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