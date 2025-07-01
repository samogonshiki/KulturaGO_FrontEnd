import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import type { Map, Layer, Marker, LatLngExpression, LatLng, Control } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './scss/Map3D.scss';

interface Attraction {
  id: number;
  name: string;
  type: 'museum' | 'monument' | 'park' | 'church';
  coordinates: [number, number];
  rating: number;
  price: string;
  description: string;
}

interface RouteInfo {
  distance: string;
  time: string;
  name?: string;
  instructions: Array<{
    text: string;
    distance: string;
    time: string;
  }>;
}

interface Statistic {
  cities: number;
  places: number;
  areaKm: number;
}

interface VisitedPlace {
  id: string;
  name: string;
  address: string;
  type: string;
  icon: string;
}

interface SearchPoint {
  address: string;
  coordinates?: [number, number];
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  type: string;
}

interface PopularRoute {
  id: string;
  name: string;
  distance: string;
  time: string;
  rating: number;
}

interface MapContextMenuProps {
  position: { lat: number; lng: number };
  onClose: () => void;
  onSetMarker: (type: 'A' | 'B') => void;
}

const MapContextMenu: React.FC<MapContextMenuProps> = ({ position, onClose, onSetMarker }) => {
  return (
    <div 
      className="map-context-menu"
      style={{ 
        position: 'absolute',
        left: position.lng,
        top: position.lat,
      }}
    >
      <button onClick={() => onSetMarker('A')}>
        <span className="material-symbols-rounded">place</span>
        Установить метку A
      </button>
      <button onClick={() => onSetMarker('B')}>
        <span className="material-symbols-rounded">flag</span>
        Установить метку B
      </button>
      <button onClick={onClose}>
        <span className="material-symbols-rounded">close</span>
        Закрыть
      </button>
    </div>
  );
};

const ATTRACTIONS: Attraction[] = [
  {
    id: 1,
    name: 'Гостиный двор',
    type: 'museum',
    coordinates: [64.538111, 40.509778],
    rating: 4.8,
    price: 'Бесплатно',
    description: 'Исторический памятник архитектуры XVIII века, символ Архангельска.'
  },
  {
    id: 2,
    name: 'Северный морской музей',
    type: 'museum',
    coordinates: [64.533987, 40.516768],
    rating: 4.6,
    price: '200₽',
    description: 'Музей истории освоения Арктики и Северного морского пути.'
  },
  {
    id: 3,
    name: 'Петровский парк',
    type: 'park',
    coordinates: [64.537222, 40.514194],
    rating: 4.5,
    price: 'Бесплатно',
    description: 'Исторический парк с памятником Петру I и красивой набережной.'
  },
  {
    id: 4,
    name: 'Свято-Троицкий кафедральный собор',
    type: 'church',
    coordinates: [64.563969, 40.529866],
    rating: 4.7,
    price: 'Бесплатно',
    description: 'Главный православный храм Архангельска, памятник архитектуры.'
  },
  {
    id: 5,
    name: 'Драматический театр',
    type: 'monument',
    coordinates: [64.536369, 40.515223],
    rating: 4.7,
    price: 'От 500₽',
    description: 'Архангельский театр драмы имени М.В. Ломоносова.'
  },
  {
    id: 6,
    name: 'Музей художественного освоения Арктики',
    type: 'museum',
    coordinates: [64.533925, 40.522796],
    rating: 4.5,
    price: '300₽',
    description: 'Уникальная коллекция произведений искусства, посвященных Арктике.'
  },
  {
    id: 7,
    name: "Архангельский краеведческий музей",
    type: "museum",
    coordinates: [64.539115, 40.509573],
    rating: 4.8,
    price: "от 150 ₽",
    description: "Один из старейших музеев России, расположенный в историческом здании Гостиных дворов XVII века. Экспозиции рассказывают об истории, культуре и природе Русского Севера."
  }
];

declare module 'leaflet' {
  namespace Routing {
    interface Control extends L.Control {
      addTo(map: L.Map): this;
      remove(): this;
      getRouter(): any;
      setWaypoints(waypoints: L.LatLng[]): this;
    }

    interface ControlStatic {
      new(options?: ControlOptions): Control;
    }

    interface ControlOptions {
      waypoints: L.LatLng[];
      router: any;
      lineOptions?: {
        styles: {
          color: string;
          opacity: number;
          weight: number;
        }[];
        extendToWaypoints: boolean;
        missingRouteTolerance: number;
      };
      addWaypoints?: boolean;
      routeWhileDragging?: boolean;
      fitSelectedRoutes?: boolean;
      showAlternatives?: boolean;
    }
  }

  interface Routing {
    control(options: Routing.ControlOptions): Routing.Control;
    osrmv1(options: any): any;
  }
}

interface Props {
  apiKey: string;
}


const Map3D: React.FC<Props> = ({ apiKey }) => {
  const mapRef = useRef<L.Map | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [transportMode, setTransportMode] = useState<'driving' | 'cycling' | 'walking'>('driving');
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Layer | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);
  const searchMarkersRef = useRef<L.Marker[]>([]);
  const attractionMarkersRef = useRef<L.Marker[]>([]);
  const [routeControl, setRouteControl] = useState<L.Routing.Control | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const [statistics] = useState<Statistic>({
    cities: 4,
    places: 12,
    areaKm: 5.3
  });

  const [lastVisited] = useState<VisitedPlace[]>([
    {
      id: '1',
      name: 'Dontea Tea Bar',
      address: 'Jl. Gajah Mada No.115, Pekauman, Kec. Tegal Barat...',
      type: 'cafe',
      icon: 'local_cafe'
    }
  ]);

  const [routePoints, setRoutePoints] = useState<{
    from: SearchPoint;
    to: SearchPoint;
  }>({
    from: { address: '' },
    to: { address: '' }
  });

  const [upcomingEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Фестиваль уличной еды',
      date: '15 июня',
      location: 'Петровский парк',
      type: 'festival'
    },
    {
      id: '2',
      name: 'Концерт классической музыки',
      date: '20 июня',
      location: 'Драматический театр',
      type: 'concert'
    }
  ]);

  const [popularRoutes] = useState<PopularRoute[]>([
    {
      id: '1',
      name: 'Исторический центр',
      distance: '2.5 км',
      time: '45 мин',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Набережная Северной Двины',
      distance: '3.2 км',
      time: '1 час',
      rating: 4.9
    }
  ]);

  const [contextMenu, setContextMenu] = useState<{
    position: { lat: number; lng: number };
    pixelPosition: { x: number; y: number };
  } | null>(null);
  
  const [markers, setMarkers] = useState<{
    A: { lat: number; lng: number } | null;
    B: { lat: number; lng: number } | null;
  }>({
    A: null,
    B: null
  });

  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const [attractions] = useState<Attraction[]>(ATTRACTIONS);

  const buildCustomRoute = useCallback(async () => {
    if (!markers.A || !markers.B || !mapRef.current) return;

    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    try {
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${markers.A.lng},${markers.A.lat};${markers.B.lng},${markers.B.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes[0] && mapRef.current) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

        const routeLine = (L as any).featureGroup();
        const polyline = (L as any).polyline(coordinates as L.LatLngExpression[], {
          color: '#6C5DD3',
          weight: 4,
          opacity: 0.8
        });
        routeLine.addLayer(polyline);
        routeLine.addTo(mapRef.current);

        routeLayerRef.current = routeLine;

        const distance = route.distance / 1000;
        const time = Math.round(route.duration / 60);
        
        setRouteInfo({
          distance: `${distance.toFixed(1)} км`,
          time: `${time} мин`,
          instructions: route.legs[0].steps.map((step: any) => ({
            text: step.maneuver.instruction,
            distance: `${(step.distance / 1000).toFixed(1)} км`,
            time: `${Math.round(step.duration / 60)} мин`
          }))
        });

        mapRef.current.fitBounds(polyline.getBounds());
      }
    } catch (error) {
      console.error('Error building route:', error);
      if (mapRef.current) {
        const coordinates = [
          [markers.A.lat, markers.A.lng],
          [markers.B.lat, markers.B.lng]
        ];

        const routeLine = (L as any).featureGroup();
        const polyline = (L as any).polyline(coordinates as L.LatLngExpression[], {
          color: '#6C5DD3',
          weight: 4,
          opacity: 0.8
        });
        routeLine.addLayer(polyline);
        routeLine.addTo(mapRef.current);

        routeLayerRef.current = routeLine;

        const distance = calculateDistance(markers.A, markers.B);
        const time = calculateTime(distance, transportMode);
        
        setRouteInfo({
          distance: `${distance.toFixed(1)} км`,
          time: `${time} мин`,
          instructions: [
            {
              text: 'Начать движение',
              distance: '0 км',
              time: '0 мин'
            },
            {
              text: 'Следовать по маршруту',
              distance: `${distance.toFixed(1)} км`,
              time: `${time} мин`
            }
          ]
        });

        mapRef.current.fitBounds(polyline.getBounds());
      }
    }
  }, [markers, transportMode]);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || '';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return '';
    }
  };

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const { x, y } = e.originalEvent;

    if (markers.A) {
      setMarkers(prev => ({
        ...prev,
        B: { lat, lng }
      }));

      if (mapRef.current) {
        if (searchMarkersRef.current[1]) {
          mapRef.current.removeLayer(searchMarkersRef.current[1]);
        }

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-marker marker-b',
            html: `<div class="marker-inner" data-label="Куда">
                    <span class="material-symbols-rounded">place</span>
                  </div>`
          })
        }).addTo(mapRef.current);

        searchMarkersRef.current[1] = marker;

        reverseGeocode(lat, lng).then(address => {
          setRoutePoints(prev => ({
            ...prev,
            to: {
              address: address || '',
              coordinates: [lat, lng]
            }
          }));
        });

        buildCustomRoute();
      }
    } else {
      setContextMenu({
        position: { lat, lng },
        pixelPosition: { x, y }
      });
    }
  }, [markers.A, buildCustomRoute]);

  useEffect(() => {
    if (mapRef.current) {
      searchMarkersRef.current.forEach(marker => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker);
        }
      });
      searchMarkersRef.current = [];

      if (markers.A) {
        const markerA = L.marker([markers.A.lat, markers.A.lng], {
          icon: L.divIcon({
            className: 'custom-marker marker-a',
            html: `<div class="marker-inner" data-label="Откуда">
                    <span class="material-symbols-rounded">person_pin_circle</span>
                  </div>`
          })
        }).addTo(mapRef.current);
        searchMarkersRef.current[0] = markerA;
      }

      if (markers.B) {
        const markerB = L.marker([markers.B.lat, markers.B.lng], {
          icon: L.divIcon({
            className: 'custom-marker marker-b',
            html: `<div class="marker-inner" data-label="Куда">
                    <span class="material-symbols-rounded">place</span>
                  </div>`
          })
        }).addTo(mapRef.current);
        searchMarkersRef.current[1] = markerB;
      }
    }
  }, [markers]);

  const getCurrentLocation = useCallback(() => {
    if (!mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setCurrentLocation([latitude, longitude]);

        if (useCurrentLocation) {
          setMarkers(prev => ({
            ...prev,
            A: { lat: latitude, lng: longitude }
          }));

          reverseGeocode(latitude, longitude).then(address => {
            setRoutePoints(prev => ({
              ...prev,
              from: {
                address: address || 'Мое местоположение',
                coordinates: [latitude, longitude]
              }
            }));
          });

          if (searchMarkersRef.current[0] && mapRef.current) {
            mapRef.current.removeLayer(searchMarkersRef.current[0]);
          }

          if (mapRef.current) {
            const marker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'custom-marker marker-a',
                html: `<div class="marker-inner" data-label="Откуда">
                        <span class="material-symbols-rounded">person_pin_circle</span>
                      </div>`
              })
            }).addTo(mapRef.current);

            searchMarkersRef.current[0] = marker;
          }
        }

        if (currentLocationMarkerRef.current && mapRef.current) {
          mapRef.current.removeLayer(currentLocationMarkerRef.current);
        }

        if (mapRef.current) {
          const locationMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'custom-marker current-location',
              html: `<div class="marker-inner">
                      <span class="material-symbols-rounded">my_location</span>
                    </div>`
            })
          }).addTo(mapRef.current);

          currentLocationMarkerRef.current = locationMarker;

          if (!currentLocation) {
            mapRef.current.setView([latitude, longitude], 13);
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setUseCurrentLocation(false);
      }
    );
  }, [useCurrentLocation, currentLocation]);

  const searchAddress = async (address: string, type: 'from' | 'to') => {
    if (!address.trim() || !mapRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon } = data[0];
        const coordinates: [number, number] = [parseFloat(lat), parseFloat(lon)];
        
        const markerIndex = type === 'from' ? 0 : 1;
        if (searchMarkersRef.current[markerIndex]) {
          mapRef.current.removeLayer(searchMarkersRef.current[markerIndex]);
        }

        const marker = L.marker(coordinates, {
          icon: L.divIcon({
            className: `search-marker ${type}-marker`,
            html: `<div class="marker-inner"><span class="material-symbols-rounded">${type === 'from' ? 'place' : 'flag'}</span></div>`
          })
        }).addTo(mapRef.current);

        searchMarkersRef.current[markerIndex] = marker;

        setRoutePoints(prev => ({
          ...prev,
          [type]: {
            address,
            coordinates
          }
        }));

        mapRef.current.setView(coordinates, 15);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  const createAttractionMarkers = useCallback(() => {
    if (!mapRef.current) return;

    attractionMarkersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    attractionMarkersRef.current = [];

    attractions.forEach(attraction => {
      if (mapRef.current) {
        const marker = L.marker(attraction.coordinates, {
          icon: L.divIcon({
            className: `attraction-marker ${attraction.type}-marker`,
            html: `
              <div class="marker-inner">
                <span class="material-symbols-rounded">${getIconForType(attraction.type, attraction.name)}</span>
                <div class="marker-tooltip">
                  <strong>${attraction.name}</strong>
                  <div class="rating">
                    ${'★'.repeat(Math.floor(attraction.rating))}${'☆'.repeat(5 - Math.floor(attraction.rating))}
                    <span>${attraction.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            `
          })
        }).addTo(mapRef.current);

        marker.on('click', () => {
          setSelectedAttraction(attraction);
        });

        attractionMarkersRef.current.push(marker);
      }
    });
  }, [attractions]);

  useEffect(() => {
    if (mapRef.current) {
      createAttractionMarkers();
    }
  }, [createAttractionMarkers, mapRef.current]);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map', {
        center: [64.539115, 40.509573],
        zoom: 14,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: ''
      }).addTo(map);

      (map as any).addControl(
        new L.Control.Zoom({
          position: 'bottomright'
        })
      );

      map.on('click', handleMapClick);

      mapRef.current = map;
      setIsLoading(false);

      getCurrentLocation();
    }
  }, [handleMapClick, getCurrentLocation]);

  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation, getCurrentLocation]);

  const createCustomIcon = (type: string) => {
    return L.divIcon({
      className: `attraction-marker ${type}-marker`,
      html: `
        <div class="marker-inner">
          <span class="material-symbols-rounded">${getIconForType(type)}</span>
          <span class="marker-rating">${getRatingForType(type)}</span>
        </div>
      `
    });
  };

  const getIconForType = (type: string, name?: string) => {
    if (type === 'monument' && name === 'Драматический театр') {
      return 'theater_comedy';
    }
    switch (type) {
      case 'museum': return 'museum';
      case 'monument': return 'landmark';
      case 'park': return 'park';
      case 'church': return 'church';
      default: return 'place';
    }
  };

  const getRatingForType = (type: string) => {
    const attraction = ATTRACTIONS.find(a => a.type === type);
    return attraction ? attraction.rating : '4.5';
  };

  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  const calculateTime = (distance: number, mode: string) => {
    switch (mode) {
      case 'walking':
        return Math.round(distance * 20); 
      case 'cycling':
        return Math.round(distance * 8);
      case 'driving':
        return Math.round(distance * 3);
      default:
        return Math.round(distance * 20);
    }
  };

  const resetRoute = () => {
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    searchMarkersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    searchMarkersRef.current = [];
    if (routeControl) {
  routeControl.remove();
  setRouteControl(null);
}

    setMarkers({ A: null, B: null });
    setRoutePoints({
      from: { address: '' },
      to: { address: '' }
    });
    setRouteInfo(null);
    setUseCurrentLocation(false);
  };

  const handleSetMarker = (type: 'A' | 'B') => {
    if (!contextMenu) return;
    
    setMarkers(prev => ({
      ...prev,
      [type]: contextMenu.position
    }));

    if (mapRef.current) {
      const markerIndex = type === 'A' ? 0 : 1;
      if (searchMarkersRef.current[markerIndex]) {
        mapRef.current.removeLayer(searchMarkersRef.current[markerIndex]);
      }

      const marker = L.marker([contextMenu.position.lat, contextMenu.position.lng], {
        icon: L.divIcon({
          className: `custom-marker marker-${type.toLowerCase()}`,
          html: `<div class="marker-inner" data-label="${type === 'A' ? 'Откуда' : 'Куда'}">
                  <span class="material-symbols-rounded">${type === 'A' ? 'person_pin_circle' : 'place'}</span>
                </div>`
        })
      }).addTo(mapRef.current);

      searchMarkersRef.current[markerIndex] = marker;

      reverseGeocode(contextMenu.position.lat, contextMenu.position.lng).then(address => {
        setRoutePoints(prev => ({
          ...prev,
          [type === 'A' ? 'from' : 'to']: {
            address: address || '',
            coordinates: [contextMenu.position.lat, contextMenu.position.lng]
          }
        }));
      });

      if (type === 'B' && markers.A) {
        buildCustomRoute();
      }
    }

    setContextMenu(null);
  };

  const buildRoute = useCallback((destination: [number, number]) => {
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userCoords);
          createRoute(userCoords, destination);
        },
        (error) => {
          console.error('Ошибка получения местоположения:', error);
          alert('Не удалось получить ваше местоположение. Пожалуйста, разрешите доступ к геолокации.');
        }
      );
    } else {
      createRoute(userLocation, destination);
    }
  }, [userLocation]);

  const translateInstruction = (text: string): string => {
    const translations: { [key: string]: string } = {
      'Head': 'Двигайтесь',
      'Continue': 'Продолжайте движение',
      'Turn right': 'Поверните направо',
      'Turn left': 'Поверните налево',
      'Make a slight right': 'Держитесь правее',
      'Make a slight left': 'Держитесь левее',
      'onto': 'на',          // Ставим выше 'on'
      'on': 'по',
      'west': 'на запад',
      'east': 'на восток',
      'north': 'на север',
      'south': 'на юг'
    };

    let translatedText = text;
    Object.entries(translations).forEach(([eng, rus]) => {
      translatedText = translatedText.replace(new RegExp(eng, 'gi'), rus);
    });
    return translatedText;
  };

  const createRoute = (from: [number, number], to: [number, number]) => {
    if (routeControl) {
      routeControl.remove();
    }

    if (mapRef.current) {
      const newRouteControl = L.Routing.control({
        waypoints: [
          L.latLng(from[0], from[1]),
          L.latLng(to[0], to[1])
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'walking'
        }),
        lineOptions: {
          styles: [
            { color: '#6C5DD3', opacity: 0.8, weight: 6 },
            { color: '#ffffff', opacity: 0.3, weight: 8 }
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        show: false,
        plan: new L.Routing.Plan([
          L.latLng(from[0], from[1]),
          L.latLng(to[0], to[1])
        ], {
          createMarker: function() { return false; }
        })
      });

      newRouteControl.on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        const instructions = routes[0].instructions;
        
        setRouteInfo({
          distance: `${(summary.totalDistance / 1000).toFixed(1)} км`,
          time: `${Math.round(summary.totalTime / 60)} мин`,
          name: selectedAttraction ? `Маршрут до ${selectedAttraction.name}` : 'Построенный маршрут',
          instructions: instructions
            .filter((instruction: any) => instruction.type !== 'DestinationReached')
            .map((instruction: any) => ({
              text: translateInstruction(instruction.text),
              distance: instruction.distance > 999 
                ? `${(instruction.distance / 1000).toFixed(1)} км`
                : `${Math.round(instruction.distance)} м`,
              time: instruction.time > 59 
                ? `${Math.round(instruction.time / 60)} мин`
                : `${Math.round(instruction.time)} сек`
            }))
        });
      });

      newRouteControl.addTo(mapRef.current);
      setRouteControl(newRouteControl);
    }
  };

  const clearRoute = useCallback(() => {
    if (routeControl) {
      routeControl.remove();
      setRouteControl(null);
    }
  }, [routeControl]);

  const handlePopularRouteClick = (route: PopularRoute) => {
    const routeCoordinates = getRouteCoordinates(route.id);
    if (routeCoordinates) {
      setMarkers({
        A: { lat: routeCoordinates[0][0], lng: routeCoordinates[0][1] },
        B: { lat: routeCoordinates[1][0], lng: routeCoordinates[1][1] }
      });
      buildCustomRoute();
    }
  };

  const handleLastVisitedClick = (place: VisitedPlace) => {
    const placeCoordinates = getPlaceCoordinates(place.id);
    if (placeCoordinates && mapRef.current) {
      mapRef.current.setView([placeCoordinates[0], placeCoordinates[1]], 15);
    }
  };

  const getRouteCoordinates = (routeId: string): [[number, number], [number, number]] | null => {
    const routeCoordinates: { [key: string]: [[number, number], [number, number]] } = {
      '1': [[64.537222, 40.514194], [64.538111, 40.509778]],
      '2': [[64.533987, 40.516768], [64.536369, 40.515223]]
    };
    return routeCoordinates[routeId] || null;
  };

  const getPlaceCoordinates = (placeId: string): [number, number] | null => {
    const placeCoordinates: { [key: string]: [number, number] } = {
      '1': [64.533925, 40.522796]
    };
    return placeCoordinates[placeId] || null;
  };

  return (
    <div className="map3d-page">
      <div className="map3d-container">
        <div className="search-panel">
          <div className="search-inputs">
            <div className="search-input">
              <button 
                className={`use-location-btn ${useCurrentLocation ? 'active' : ''}`}
                onClick={() => {
                  setUseCurrentLocation(!useCurrentLocation);
                  if (!useCurrentLocation) {
                    getCurrentLocation();
                  }
                }}
              >
                <span className="material-symbols-rounded">my_location</span>
              </button>
              <input
                type="text"
                placeholder="Откуда"
                value={useCurrentLocation ? 'Мое местоположение' : routePoints.from.address}
                onChange={(e) => {
                  setUseCurrentLocation(false);
                  setRoutePoints(prev => ({
                    ...prev,
                    from: { ...prev.from, address: e.target.value }
                  }));
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchAddress(routePoints.from.address, 'from');
                  }
                }}
              />
            </div>
            <div className="search-input">
              <span className="material-symbols-rounded">place</span>
              <input
                type="text"
                placeholder="Куда"
                value={routePoints.to.address}
                onChange={(e) => setRoutePoints(prev => ({
                  ...prev,
                  to: { ...prev.to, address: e.target.value }
                }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchAddress(routePoints.to.address, 'to');
                  }
                }}
              />
            </div>
          </div>
          <div className="transport-modes">
            <button
              className={`transport-mode ${transportMode === 'walking' ? 'active' : ''}`}
              onClick={() => setTransportMode('walking')}
            >
              <span className="material-symbols-rounded">directions_walk</span>
            </button>
            <button
              className={`transport-mode ${transportMode === 'cycling' ? 'active' : ''}`}
              onClick={() => setTransportMode('cycling')}
            >
              <span className="material-symbols-rounded">directions_bike</span>
            </button>
            <button
              className={`transport-mode ${transportMode === 'driving' ? 'active' : ''}`}
              onClick={() => setTransportMode('driving')}
            >
              <span className="material-symbols-rounded">directions_car</span>
            </button>
          </div>
          <div className="route-buttons">
            <button 
              className="build-route-btn"
              onClick={buildCustomRoute}
              disabled={!markers.A || !markers.B}
            >
              <span className="material-symbols-rounded">directions</span>
              Построить маршрут
            </button>
            <button 
              className="reset-route-btn"
              onClick={resetRoute}
              disabled={!markers.A && !markers.B && !routeInfo}
            >
              <span className="material-symbols-rounded">restart_alt</span>
              Сбросить
            </button>
          </div>
          <div className="click-hint">
            Или кликните на карте, чтобы выбрать точки маршрута
          </div>
        </div>

        <div id="map" className="map"></div>

        {isLoading && (
          <div className="map-loading">
            <div className="loading-spinner" />
            <p>Загрузка карты...</p>
          </div>
        )}

        {routeInfo && (
          <div className="route-info">
            <div className="route-header">
              <span className="material-symbols-rounded">route</span>
              <h3>Маршрут</h3>
              <button className="close-route" onClick={() => setRouteInfo(null)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="route-details">
              <div className="detail-item">
                <span className="material-symbols-rounded">straight</span>
                <span>{routeInfo.distance}</span>
              </div>
              <div className="detail-item">
                <span className="material-symbols-rounded">schedule</span>
                <span>{routeInfo.time}</span>
              </div>
            </div>
            <div className="route-instructions">
              {routeInfo.instructions.map((instruction, index) => (
                <div key={index} className="instruction-item">
                  <div className="instruction-content">
                    <p>{instruction.text}</p>
                    <div className="instruction-meta">
                      <span>{instruction.distance}</span>
                      {instruction.time !== '0 сек' && <span>{instruction.time}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {contextMenu && (
          <div 
            className="map-context-menu"
            style={{ 
              position: 'fixed',
              left: contextMenu.pixelPosition.x,
              top: contextMenu.pixelPosition.y,
              zIndex: 1000
            }}
          >
            <button onClick={() => handleSetMarker('A')}>
              <span className="material-symbols-rounded">person_pin_circle</span>
              Установить точку A (Откуда)
            </button>
            <button onClick={() => handleSetMarker('B')}>
              <span className="material-symbols-rounded">place</span>
              Установить точку B (Куда)
            </button>
            <button onClick={() => setContextMenu(null)}>
              <span className="material-symbols-rounded">close</span>
              Отмена
            </button>
          </div>
        )}

        {selectedAttraction && (
          <div className="attraction-details">
            <div className="attraction-header">
              <h3>{selectedAttraction.name}</h3>
              <button className="close-button" onClick={() => {
                setSelectedAttraction(null);
                clearRoute();
              }}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="attraction-content">
              <div className="rating">
                <span className="material-symbols-rounded">star</span>
                <span>{selectedAttraction.rating.toFixed(1)}</span>
              </div>
              <div className="type">
                <span className="material-symbols-rounded">{getIconForType(selectedAttraction.type, selectedAttraction.name)}</span>
                <span>{selectedAttraction.type === 'museum' ? 'Museum' : selectedAttraction.type.charAt(0).toUpperCase() + selectedAttraction.type.slice(1)}</span>
              </div>
              <div className="price">
                <span className="material-symbols-rounded">payments</span>
                <span>{selectedAttraction.price}</span>
              </div>
              <p className="description">{selectedAttraction.description}</p>
              {routeInfo ? (
                <div className="route-info">
                  <div className="route-header">
                    <h4>{routeInfo.name}</h4>
                    <div className="route-meta">
                      <span>{routeInfo.distance}, {routeInfo.time}</span>
                    </div>
                  </div>
                  <div className="route-instructions">
                    {routeInfo.instructions.map((instruction, index) => (
                      <div key={index} className="instruction-item">
                        <div className="instruction-content">
                          <p>{instruction.text}</p>
                          <div className="instruction-meta">
                            <span>{instruction.distance}</span>
                            {instruction.time !== '0 сек' && <span>{instruction.time}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button 
                  className="route-button"
                  onClick={() => {
                    buildRoute(selectedAttraction.coordinates);
                    setSelectedAttraction(null);
                  }}
                >
                  <span className="material-symbols-rounded">directions</span>
                  Построить маршрут
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="side-panel">
        <div className="route-info-header">
          <h1>Набережная Северной Двины</h1>
          <div className="route-meta">
            <span><span className="material-symbols-rounded">straight</span>3.2 км</span>
            <span><span className="material-symbols-rounded">schedule</span>1 час</span>
            <span><span className="material-symbols-rounded">star</span>4.9</span>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="material-symbols-rounded">apartment</span>
              <div className="stat-value">4</div>
              <div className="stat-label">Cities<br/>Total visited</div>
            </div>
            <div className="stat-item">
              <span className="material-symbols-rounded">location_on</span>
              <div className="stat-value">12</div>
              <div className="stat-label">Places<br/>Places visited</div>
            </div>
            <div className="stat-item">
              <span className="material-symbols-rounded">map</span>
              <div className="stat-value">5.3</div>
              <div className="stat-label">Km²<br/>Places visited</div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section events-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <button className="view-all-btn">
                View all <span className="material-symbols-rounded">chevron_right</span>
              </button>
            </div>
            
            <div className="event-card">
              <div className="icon">
                <span className="material-symbols-rounded">festival</span>
              </div>
              <div className="info">
                <h3>Фестиваль уличной еды</h3>
                <div className="details">
                  <span><span className="material-symbols-rounded">calendar_today</span>15 июня</span>
                  <span><span className="material-symbols-rounded">location_on</span>Петровский парк</span>
                </div>
              </div>
            </div>

            <div className="event-card">
              <div className="icon">
                <span className="material-symbols-rounded">music_note</span>
              </div>
              <div className="info">
                <h3>Концерт классической музыки</h3>
                <div className="details">
                  <span><span className="material-symbols-rounded">calendar_today</span>20 июня</span>
                  <span><span className="material-symbols-rounded">location_on</span>Драматический театр</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section routes-section">
            <div className="section-header">
              <h2>Popular Routes</h2>
              <button className="view-all-btn">
                View all <span className="material-symbols-rounded">chevron_right</span>
              </button>
            </div>
            
            <div className="route-cards">
              {popularRoutes.map(route => (
                <div 
                  key={route.id} 
                  className="route-card"
                  onClick={() => handlePopularRouteClick(route)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="icon">
                    <span className="material-symbols-rounded">route</span>
                  </div>
                  <div className="info">
                    <h3>{route.name}</h3>
                    <div className="details">
                      <span><span className="material-symbols-rounded">straight</span>{route.distance}</span>
                      <span><span className="material-symbols-rounded">schedule</span>{route.time}</span>
                      <span className="rating"><span className="material-symbols-rounded">star</span>{route.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section latest-section">
            <div className="section-header">
              <h2>Latest visited</h2>
              <span className="period">This weeks</span>
            </div>
            
            {lastVisited.map(place => (
              <div 
                key={place.id}
                className="place-card"
                onClick={() => handleLastVisitedClick(place)}
                style={{ cursor: 'pointer' }}
              >
                <div className="icon">
                  <span className="material-symbols-rounded">{place.icon}</span>
                </div>
                <div className="info">
                  <h3>{place.name}</h3>
                  <p>{place.address}</p>
                </div>
                <button className="see-detail-btn">
                  See detail <span className="material-symbols-rounded">chevron_right</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map3D; 