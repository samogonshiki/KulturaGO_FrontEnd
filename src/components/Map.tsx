import React, { useEffect, useRef, useState, useCallback } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "./scss/Map3D.scss";

import {
  Attraction,
  RouteInfo,
  Statistic,
  VisitedPlace,
  SearchPoint,
  Event,
  PopularRoute,
  MapContextMenuProps,
  Props,
  mapRef,
  markers,
  setMarkers,
  searchMarkersRef,
  attractionMarkersRef,
  routeInfo,
  setRouteInfo,
  currentLocation,
  setCurrentLocation,
  transportMode,
  setTransportMode,
  isLoading,
  setIsLoading,
  routeLayerRef,
  currentLocationMarkerRef,
  routeControl,
  setRouteControl,
  userLocation,
  setUserLocation,
  useCurrentLocation,
  setUseCurrentLocation,
  calculateDistance,
  calculateTime,
  reverseGeocode,
  getCurrentLocation,
  searchAddress,
  createAttractionMarkers,
  getIconForType,
  resetRoute,
  translateInstruction,
  createRoute,
  clearRoute,
  getRouteCoordinates,
  handleLastVisitedClick,
} from "./constans";

import {
  lastVisited,
  statistics,
  popularRoutes,
  upcomingEvents,
  routePoints,
  setRoutePoints,
  initialRoutePoints,
  attractions as ATTRACTIONS,
} from "./Map-test-events";



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
        styles: { color: string; opacity: number; weight: number }[];
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

const Map: React.FC<Props> = ({ apiKey }) => {
  const [contextMenu, setContextMenu] = useState<{ position: { lat: number; lng: number }; pixelPosition: { x: number; y: number } } | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const buildCustomRoute = useCallback(async () => {
    if (!markers.A || !markers.B || !mapRef.current) return;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/${transportMode}/${markers.A.lng},${markers.A.lat};${markers.B.lng},${markers.B.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error('OSRM вернул ошибку:', response.status, response.statusText);
        throw new Error(`OSRM error ${response.status}`);
      }
      const data = await response.json();
      console.log('OSRM response', data);

      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as LatLngExpression);

        const fg = (L as any).featureGroup();
        const line = (L as any).polyline(coords, { color: '#6C5DD3', weight: 4, opacity: 0.8 });
        fg.addLayer(line).addTo(mapRef.current);
        routeLayerRef.current = fg;

        const distKm = route.distance / 1000;
        const durMin = Math.round(route.duration / 60);
        setRouteInfo({
          distance: `${distKm.toFixed(1)} км`,
          time: `${durMin} мин`,
          instructions: route.legs[0].steps.map((step: any) => ({
            text: step.maneuver.instruction,
            distance: `${(step.distance/1000).toFixed(1)} км`,
            time: `${Math.round(step.duration/60)} мин`
          }))
        });

        mapRef.current.fitBounds(line.getBounds());
      }
    } catch (err) {
      console.error('Error building route, drawing straight line:', err);
      const coords: LatLngExpression[] = [
        [markers.A.lat, markers.A.lng],
        [markers.B.lat, markers.B.lng],
      ];
      const fg = (L as any).featureGroup();
      const line = (L as any).polyline(coords, { color: '#6C5DD3', weight: 4, opacity: 0.8 });
      fg.addLayer(line).addTo(mapRef.current!);
      routeLayerRef.current = fg;

      const dist = calculateDistance(markers.A, markers.B);
      const dur = calculateTime(dist, transportMode);
      setRouteInfo({
        distance: `${dist.toFixed(1)} км`,
        time: `${dur} мин`,
        instructions: [
          { text: 'Начать движение', distance: '0 км', time: '0 мин' },
          { text: 'Следовать по маршруту', distance: `${dist.toFixed(1)} км`, time: `${dur} мин` }
        ]
      });
      mapRef.current!.fitBounds(line.getBounds());
    }
  }, [markers, transportMode]);
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

  const handleReset = () => {
    resetRoute();
    setRoutePoints(initialRoutePoints);
    setRouteInfo(null);
  };

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
      createAttractionMarkers();
    }
  }, [handleMapClick, getCurrentLocation])
  

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
              <button className="reset-route-btn"
                      onClick={handleReset}
                      disabled={!markers.A && !markers.B && !routeInfo}>
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

export default Map;