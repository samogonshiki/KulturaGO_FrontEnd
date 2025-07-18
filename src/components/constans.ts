import {useCallback, useRef, useState} from "react";
import L from "leaflet";
import {ATTRACTIONS, setRoutePoints} from "./Map-test-events";

export interface Attraction {
    id: number;
    name: string;
    type: 'museum' | 'monument' | 'park' | 'church';
    coordinates: [number, number];
    rating: number;
    price: string;
    description: string;
}

export interface RouteInfo {
    distance: string;
    time: string;
    name?: string;
    instructions: Array<{
        text: string;
        distance: string;
        time: string;
    }>;
}

export interface Statistic {
    cities: number;
    places: number;
    areaKm: number;
}

export interface VisitedPlace {
    id: string;
    name: string;
    address: string;
    type: string;
    icon: string;
}

export interface SearchPoint {
    address: string;
    coordinates?: [number, number];
}

export interface Event {
    id: string;
    name: string;
    date: string;
    location: string;
    type: string;
}

export interface PopularRoute {
    id: string;
    name: string;
    distance: string;
    time: string;
    rating: number;
}

export interface MapContextMenuProps {
    position: { lat: number; lng: number };
    onClose: () => void;
    onSetMarker: (type: 'A' | 'B') => void;
}

export interface Props {
    apiKey: string;
}

export const mapRef = useRef<L.Map | null>(null);
export const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
export const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
export const [transportMode, setTransportMode] = useState<'driving' | 'cycling' | 'walking'>('driving');
export const [isLoading, setIsLoading] = useState(true);
export const routeLayerRef = useRef<L.Layer | null>(null);
export const currentLocationMarkerRef = useRef<L.Marker | null>(null);
export const searchMarkersRef = useRef<L.Marker[]>([]);
export const attractionMarkersRef = useRef<L.Marker[]>([]);
export const [routeControl, setRouteControl] = useState<L.Routing.Control | null>(null);
export const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

export const [markers, setMarkers] = useState<{ A: { lat: number; lng: number } | null; B: { lat: number; lng: number } | null }>({ A: null, B: null });
const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
export const [useCurrentLocation, setUseCurrentLocation] = useState(false);
export const [attractions] = useState<Attraction[]>(ATTRACTIONS);

export  const toRad = (v: number) => v * Math.PI / 180;

export const calculateDistance = (p1: {lat:number;lng:number}, p2:{lat:number;lng:number}) => {
    const R = 6371;
    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lng - p1.lng);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculateTime = (distance: number, mode: string) => {
    switch (mode) {
        case 'walking': return Math.round(distance * 20);
        case 'cycling': return Math.round(distance * 8);
        case 'driving': return Math.round(distance * 3);
        default: return Math.round(distance * 20);
    }
};

export const getIconForType = (type: string, name?: string) => {
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

export const getRatingForType = (type: string) => {
    const attraction = ATTRACTIONS.find(a => a.type === type);
    return attraction ? attraction.rating : '4.5';
};

export const createCustomIcon = (type: string) => {
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

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
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

export const getCurrentLocation = useCallback(() => {
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

export const searchAddress = async (address: string, type: 'from' | 'to') => {
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

export const createAttractionMarkers = useCallback(() => {
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

export const resetRoute = () => {
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

export const translateInstruction = (text: string): string => {
    const translations: { [key: string]: string } = {
        'Head': 'Двигайтесь',
        'Continue': 'Продолжайте движение',
        'Turn right': 'Поверните направо',
        'Turn left': 'Поверните налево',
        'Make a slight right': 'Держитесь правее',
        'Make a slight left': 'Держитесь левее',
        'onto': 'на',
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

export const createRoute = (from: [number, number], to: [number, number]) => {
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

export const clearRoute = useCallback(() => {
    if (routeControl) {
        routeControl.remove();
        setRouteControl(null);
    }
}, [routeControl]);

export const getRouteCoordinates = (routeId: string): [[number, number], [number, number]] | null => {
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

export const handleLastVisitedClick = (place: VisitedPlace) => {
    const placeCoordinates = getPlaceCoordinates(place.id);
    if (placeCoordinates && mapRef.current) {
        mapRef.current.setView([placeCoordinates[0], placeCoordinates[1]], 15);
    }
};
