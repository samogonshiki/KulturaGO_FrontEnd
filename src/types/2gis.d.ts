declare namespace mapgl {
  interface MapGLStatic {
    Map: typeof Map;
    Marker: typeof Marker;
  }

  class Map {
    constructor(options: MapOptions);
    setCenter(coordinates: [number, number]): void;
    setZoom(zoom: number): void;
    destroy(): void;
    routing: {
      pedestrian(options: RoutingOptions): void;
    };
  }

  class Marker {
    constructor(map: Map, options: MarkerOptions);
    on(event: string, callback: () => void): void;
    destroy(): void;
  }

  interface MapOptions {
    container: HTMLElement;
    center: [number, number];
    zoom: number;
    key: string;
    style?: string;
    pitch?: number;
    rotation?: number;
    maxPitch?: number;
    minZoom?: number;
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

  interface RoutingOptions {
    points: [number, number][];
  }
}

declare global {
  interface Window {
    mapgl: mapgl.MapGLStatic;
  }
} 