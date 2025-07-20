import L from "leaflet";
// @ts-ignore
import type {FeatureGroup} from "leaflet"
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";


export interface Coordinates {
    lat: number;
    lng: number;
}

export interface SearchPoint {
    address: string;
    coordinates?: [number, number];
}

export type MarkersState = { A?: Coordinates; B?: Coordinates };

export interface RouteInfo {
    distance: string;
    time: string;
    instructions: { text: string; distance: string; time: string }[];
    name?: string;
}

export interface Statistic { cities: number; places: number; areaKm: number }
export interface VisitedPlace { id: string; name: string; address: string; type: string; icon: string }
export interface Event { id: string; name: string; date: string; location: string; type: string }
export interface PopularRoute { id: string; name: string; distance: string; time: string; rating: number }

export interface Attraction {
    id: number;
    name: string;
    type: "museum" | "park" | "church" | "monument" | string;
    coordinates: [number, number];
    rating: number;
    price: string;
    description: string;
}

export interface Props { apiKey?: string }

export interface MapContextMenuProps {
    position: { lat: number; lng: number };
    onClose: () => void;
    onSetMarker: (type: "A" | "B") => void;
}

export const attractions: Attraction[] = [
    {
        id: 1,
        name: "Гостиный двор",
        type: "museum",
        coordinates: [64.538111, 40.509778],
        rating: 4.8,
        price: "Бесплатно",
        description: "Исторический памятник архитектуры XVIII века, символ Архангельска.",
    },
    {
        id: 2,
        name: "Северный морской музей",
        type: "museum",
        coordinates: [64.533987, 40.516768],
        rating: 4.6,
        price: "200₽",
        description: "Музей истории освоения Арктики и Северного морского пути.",
    },
    {
        id: 3,
        name: "Петровский парк",
        type: "park",
        coordinates: [64.537222, 40.514194],
        rating: 4.5,
        price: "Бесплатно",
        description: "Исторический парк с памятником Петру I и красивой набережной.",
    },
    {
        id: 4,
        name: "Свято-Троицкий собор",
        type: "church",
        coordinates: [64.563969, 40.529866],
        rating: 4.7,
        price: "Бесплатно",
        description: "Главный православный храм Архангельска, памятник архитектуры.",
    },
    {
        id: 5,
        name: "Драматический театр",
        type: "monument",
        coordinates: [64.536369, 40.515223],
        rating: 4.7,
        price: "От 500₽",
        description: "Архангельский театр драмы имени М.В. Ломоносова.",
    },
    {
        id: 6,
        name: "Музей освоения Арктики",
        type: "museum",
        coordinates: [64.533925, 40.522796],
        rating: 4.5,
        price: "300₽",
        description: "Коллекция произведений искусства, посвящённых Арктике.",
    },
    {
        id: 7,
        name: "Краеведческий музей",
        type: "museum",
        coordinates: [64.539115, 40.509573],
        rating: 4.8,
        price: "от 150₽",
        description: "Один из старейших музеев России, расположенный в Гостиных дворах XVII века.",
    },
];


export const mapRef:            { current: L.Map | null }                 = { current: null };
export const searchMarkersRef:  { current: L.Marker[] }                   = { current: [] };
export const attractionMarkersRef: { current: L.Marker[] }               = { current: [] };
export const routeLayerRef:     { current: FeatureGroup<any> | null }   = { current: null };
export const currentLocationMarkerRef: { current: L.Marker | null }      = { current: null };

export let routeControl: any = null;
export const setRouteControl = (c: any) => { routeControl = c; };

export const markers: MarkersState = {};
export const setMarkers = (
    upd: MarkersState | ((prev: MarkersState) => MarkersState),
) => {
    const next = typeof upd === "function" ? upd(markers) : upd;
    Object.assign(markers, next);
};

export let routeInfo: RouteInfo | null = null;
export const setRouteInfo = (info: RouteInfo | null) => { routeInfo = info; };

export let transportMode: "walking" | "cycling" | "driving" = "walking";
export const setTransportMode = (m: typeof transportMode) => { transportMode = m; };

export let isLoading = true;
export const setIsLoading = (v: boolean) => { isLoading = v; };

export let useCurrentLocation = false;
export const setUseCurrentLocation = (v: boolean) => { useCurrentLocation = v; };

export let userLocation: [number, number] | null = null;
export const setUserLocation = (coords: [number, number] | null) => { userLocation = coords; };

export let currentLocation: [number, number] | null = null;
export const setCurrentLocation = (coords: [number, number] | null) => { currentLocation = coords; };


export const toRad = (deg: number) => (deg * Math.PI) / 180;

export const calculateDistance = (a: Coordinates, b: Coordinates) => {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(h));
};

export const calculateTime = (
    distKm: number,
    mode: typeof transportMode,
) => {
    const speed = mode === "walking" ? 5 : mode === "cycling" ? 15 : 40;
    return Math.round((distKm / speed) * 60);
};

export async function searchAddress(
    query: string,
    field: "from" | "to",
): Promise<void> {
    console.log("searchAddress mock", query, field);
}

export async function reverseGeocode(
    lat: number,
    lng: number,
): Promise<string | null> {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(coords);

        if (mapRef.current) {
            if (currentLocationMarkerRef.current) mapRef.current.removeLayer(currentLocationMarkerRef.current);

            currentLocationMarkerRef.current = L.marker(coords, {
                icon: L.divIcon({ className: "my-location" })
            }).addTo(mapRef.current);

            currentLocationMarkerRef.current.setZIndexOffset(9_999);
        }
    });
};

export const translateInstruction = (txt: string) =>
    txt.replace("Head", "Двигайтесь").replace("Continue", "Продолжайте");

export const getIconForType = (type: string, _name?: string): string => {
    switch (type) {
        case "museum":  return "museum";
        case "park":    return "park";
        case "church":  return "church";
        default:        return "location_on";
    }
};

export function createAttractionMarkers(): void {
    if (!mapRef.current) return;

    const mapAny = mapRef.current as any;

    if (mapAny._attractionCluster) {
        mapRef.current.removeLayer(mapAny._attractionCluster);
    }
    const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        iconCreateFunction(c: any) {
            const count = c.getChildCount();
            return L.divIcon({
                html: `<div class="cluster-inner">${count}</div>`,
                className: "attraction-cluster",
                iconSize: [40, 40],
            });
        },
    });

    attractions.forEach((a) => {
        const marker = L.marker(a.coordinates, {
            icon: L.divIcon({
                className: "attraction-marker",
                html: `<span class="material-symbols-rounded">${getIconForType(a.type)}</span>`,
            }),
        } as L.MarkerOptions);

        (marker as any).bindTooltip(a.name, {
            direction: "top",
            offset: [0, -10],
        });

        cluster.addLayer(marker);
    });

    mapAny._attractionCluster = cluster;
    mapRef.current.addLayer(cluster);
}


export function resetRoute() {
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
    setRouteInfo(null);

    searchMarkersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
    searchMarkersRef.current = [];
    setMarkers({});
}

export function createRoute(
    from: [number, number],
    to: [number, number],
): void {
    console.log("createRoute mock", from, to);
}

export function clearRoute() {
    console.log("clearRoute mock");
}

export function getRouteCoordinates(
    id: string,
): [[number, number], [number, number]] | null {
    return null;
}

export function handleLastVisitedClick(_: any) {
    console.log("handleLastVisitedClick mock");
}