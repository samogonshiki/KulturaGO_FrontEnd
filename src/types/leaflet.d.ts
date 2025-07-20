declare module 'leaflet' {
  export interface LeafletMouseEvent {
    latlng: LatLng;
    originalEvent: MouseEvent;
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  interface Marker {
    setZIndexOffset(offset: number): this;
  }

  export class Map {
    constructor(element: string | HTMLElement, options?: MapOptions);
    setView(center: [number, number], zoom: number): this;
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    fitBounds(bounds: LatLngBounds, options?: FitBoundsOptions): this;
    remove(): void;
    on(type: string, fn: (e: LeafletMouseEvent) => void): this;
    off(type: string, fn: (e: LeafletMouseEvent) => void): this;
    eachLayer(fn: (layer: Layer) => void): this;
  }

  export class Layer {
    addTo(map: Map): this;
    remove(): void;
    getBounds(): LatLngBounds;
  }

  export class Marker extends Layer {
    constructor(latlng: LatLngExpression, options?: MarkerOptions);
    setLatLng(latLng: LatLng | [number, number]): this;
    getLatLng(): LatLng;
    on(type: string, fn: (e: LeafletMouseEvent) => void): this;
    off(type: string, fn: (e: LeafletMouseEvent) => void): this;
  }

  export class GeoJSON extends Layer {
    constructor(geojson?: any, options?: GeoJSONOptions);
  }

  export interface Control {
    addTo(map: Map): this;
  }

  export namespace Control {
    export class Zoom extends Control {
      constructor(options?: ZoomOptions);
    }
  }

  export interface ControlStatic {
    zoom: new (options: ZoomOptions) => Control;
  }

  export const control: ControlStatic;

  export function map(id: string | HTMLElement, options?: MapOptions): Map;
  export function marker(latlng: LatLng | [number, number], options?: MarkerOptions): Marker;
  export function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;
  export function divIcon(options: DivIconOptions): DivIcon;
  export function geoJSON(geojson?: any, options?: GeoJSONOptions): GeoJSON;
  export function latLng(lat: number, lng: number): LatLng;

  export type LatLngExpression = LatLng | [number, number] | { lat: number; lng: number };
  export type LatLngBoundsExpression = LatLngBounds | LatLngExpression[];

  export class LatLng {
    constructor(lat: number, lng: number);
    lat: number;
    lng: number;
  }

  export class LatLngBounds {
    constructor(southWest: LatLngExpression, northEast: LatLngExpression);
    extend(latlng: LatLng | [number, number]): this;
    _southWest: LatLng;
    _northEast: LatLng;
  }

  export interface MapOptions {
    center?: [number, number];
    zoom?: number;
    zoomControl?: boolean;
  }

  export interface MarkerOptions {
    icon?: DivIcon;
  }

  export interface ZoomOptions {
    position?: string;
  }

  export interface TileLayerOptions {
    attribution?: string;
  }

  export interface DivIconOptions {
    html?: string;
    className?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }

  export interface GeoJSONOptions {
    style?: any;
  }

  export interface FitBoundsOptions {
    padding?: [number, number];
    maxZoom?: number;
    animate?: boolean;
  }

  export interface Icon {
    options: any;
  }

  export class TileLayer extends Layer {
    constructor(urlTemplate: string, options?: TileLayerOptions);
  }

  export class DivIcon implements Icon {
    constructor(options: DivIconOptions);
    options: any;
  }
} 