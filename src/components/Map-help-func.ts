import {useEffect} from "react";
import {
    createAttractionMarkers,
    getCurrentLocation,
    mapRef,
    markers,
    searchMarkersRef,
    setIsLoading,
    useCurrentLocation
} from "./constans";
import L from "leaflet";

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

useEffect(() => {
    if (mapRef.current) {
        createAttractionMarkers();
    }
}, [createAttractionMarkers, mapRef.current]);

useEffect(() => {
    if (useCurrentLocation) {
        getCurrentLocation();
    }
}, [useCurrentLocation, getCurrentLocation]);