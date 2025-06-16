declare module 'react-leaflet' {
  import { FC, ReactNode } from 'react';
  import { LatLngExpression, Map as LeafletMap, Control, Marker } from 'leaflet';

  interface MapContainerProps {
    center: LatLngExpression;
    zoom: number;
    children?: ReactNode;
    style?: React.CSSProperties;
    whenReady?: () => void;
    whenError?: (error: any) => void;
  }

  interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  interface MarkerProps {
    position: LatLngExpression;
    icon?: any;
    children?: ReactNode;
    eventHandlers?: {
      [key: string]: (...args: any[]) => void;
    };
  }

  interface PopupProps {
    children?: ReactNode;
  }

  export const MapContainer: FC<MapContainerProps>;
  export const TileLayer: FC<TileLayerProps>;
  export const Marker: FC<MarkerProps>;
  export const Popup: FC<PopupProps>;
  export function useMap(): LeafletMap;
}

declare module 'leaflet' {
  interface RoutingControlOptions {
    waypoints: LatLngExpression[];
    router?: any;
    routeWhileDragging?: boolean;
    showAlternatives?: boolean;
    fitSelectedRoutes?: boolean;
    lineOptions?: {
      styles: { color: string; weight: number }[];
      extendToWaypoints: boolean;
      missingRouteTolerance: number;
    };
    plan?: any;
    createMarker?: (i: number, waypoint: any) => Marker | null | false;
  }

  namespace Routing {
    function control(options: RoutingControlOptions): Control;
    function osrmv1(options: { serviceUrl: string }): any;
    function plan(waypoints: LatLngExpression[], options: any): any;
  }
} 