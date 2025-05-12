
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Event } from '@/types/event';
import { format } from 'date-fns';

class MapService {
  private map: L.Map | null = null;
  private markersLayer: L.MarkerClusterGroup | null = null;
  
  // Initialize the map on a given HTML element
  public initializeMap(element: HTMLElement): L.Map {
    if (this.map) return this.map;
    
    // Create map instance
    this.map = L.map(element).setView([40, -95], 4);
    
    // Fix Leaflet default icon paths
    this.fixLeafletIconPaths();
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Create marker cluster group
    this.markersLayer = L.markerClusterGroup();
    this.map.addLayer(this.markersLayer);
    
    return this.map;
  }

  // Fix for Leaflet's default icon path issues
  private fixLeafletIconPaths() {
    // Get the path to the Leaflet images directory
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    
    // Set default icon options
    L.Icon.Default.mergeOptions({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
    });
  }

  // Add event markers to the map
  public addEventMarkers(events: Event[]): void {
    if (!this.map || !this.markersLayer) return;
    
    // Clear existing markers
    this.markersLayer.clearLayers();
    
    // Add markers for each event
    events.forEach(event => {
      // For demo purposes, generate random coordinates if not present
      const lat = event.latitude || (Math.random() * 180 - 90);
      const lng = event.longitude || (Math.random() * 360 - 180);
      
      const marker = L.marker([lat, lng])
        .bindPopup(`
          <div>
            <h3 class="font-semibold">${event.title}</h3>
            <p>${event.location}</p>
            <p>${format(new Date(event.date), 'PPP p')}</p>
            <a href="/events/${event.id}" class="text-blue-500 underline">View Details</a>
          </div>
        `);
      
      this.markersLayer?.addLayer(marker);
    });
    
    // Fit bounds to show all markers
    if (events.length > 0 && this.markersLayer.getBounds()) {
      this.map.fitBounds(this.markersLayer.getBounds(), { padding: [50, 50] });
    }
  }

  // Add user location marker
  public addUserLocationMarker(latitude: number, longitude: number): void {
    if (!this.map) return;
    
    // Remove previous user marker if exists
    if (window.userMarker) {
      this.map.removeLayer(window.userMarker);
    }
    
    // Create custom user icon
    const userIcon = L.divIcon({
      html: `<div class="h-6 w-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">U</div>`,
      className: '',
      iconSize: [24, 24]
    });
    
    // Add user marker
    window.userMarker = L.marker([latitude, longitude], { icon: userIcon })
      .addTo(this.map)
      .bindPopup("<b>You are here!</b>")
      .openPopup();
    
    // Center map on user location
    this.map.setView([latitude, longitude], 13);
  }

  // Calculate distance between two points using Haversine formula
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  // Clean up map instance
  public cleanup(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markersLayer = null;
      window.userMarker = undefined;
    }
  }
}

export const mapService = new MapService();
