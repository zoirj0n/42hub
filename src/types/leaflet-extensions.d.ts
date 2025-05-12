
import L from 'leaflet';

// Type declaration for global window object with userMarker property
declare global {
  interface Window {
    userMarker?: L.Marker;
  }
}

export {};
