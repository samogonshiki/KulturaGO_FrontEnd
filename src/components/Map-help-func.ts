import { useEffect, useRef } from "react";
import L from "leaflet";
import {
    createAttractionMarkers,
    getCurrentLocation,
    mapRef,
    markers,
    useCurrentLocation,
    searchMarkersRef,
} from "./constans";

export function useMapHelpers() {
    const localRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) return;

        localRef.current.forEach(m => mapRef.current!.removeLayer(m));
        localRef.current = [];

        if (markers.A) {
            const mA = L.marker([markers.A.lat, markers.A.lng], {
                icon: L.divIcon({
                    className: "custom-marker marker-a",
                    html: `<div class="marker-inner" data-label="Откуда">
                   <span class="material-symbols-rounded">person_pin_circle</span>
                 </div>`
                })
            }).addTo(mapRef.current);
            mA.setZIndexOffset(10_000);
            localRef.current.push(mA);
        }

        if (markers.B) {
            const mB = L.marker([markers.B.lat, markers.B.lng], {
                icon: L.divIcon({
                    className: "custom-marker marker-b",
                    html: `<div class="marker-inner" data-label="Куда">
                   <span class="material-symbols-rounded">place</span>
                 </div>`
                })
            }).addTo(mapRef.current);
            mB.setZIndexOffset(10_000);
            localRef.current.push(mB);
        }

        searchMarkersRef.current = localRef.current;
    }, [markers.A?.lat, markers.A?.lng, markers.B?.lat, markers.B?.lng]);

    useEffect(() => {
        if (mapRef.current) createAttractionMarkers();
    }, []);

    useEffect(() => {
        if (useCurrentLocation) getCurrentLocation();
    }, [useCurrentLocation]);

    return null;
}