declare global {
  interface Window {
    mapgl: {
      Map: new (containerId: string, options: MapOptions) => Map2GIS;
      Marker: new (map: Map2GIS, options: MarkerOptions) => Marker2GIS;
    };
  }
}

interface MapOptions {
  center: [number, number];
  zoom: number;
  key: string;
  style?: string;
}

interface Map2GIS {
  setCenter(coordinates: [number, number]): void;
  setZoom(zoom: number): void;
  destroy(): void;
  routing: {
    pedestrian(options: RoutingOptions): void;
  };
}

interface MarkerOptions {
  coordinates: [number, number];
  label?: {
    text: string;
    offset?: [number, number];
    relativeAnchor?: [number, number];
  };
  icon?: {
    html: string;
  };
}

interface Marker2GIS {
  on(event: string, callback: () => void): void;
  remove(): void;
}

interface RoutingOptions {
  points: [number, number][];
}

export {}; 