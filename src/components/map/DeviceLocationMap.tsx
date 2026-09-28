import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GPSCoordinates } from '../../utils/geolocation';
import { NetworkHistoryRecord } from '../../types';
import { MapPinOff } from 'lucide-react';

interface DeviceLocationMapProps {
  deviceLocation: GPSCoordinates | null;
  measurementPoints?: NetworkHistoryRecord[];
  height?: string;
  zoom?: number;
  isTracking?: boolean;
}

export const DeviceLocationMap: React.FC<DeviceLocationMapProps> = ({
  deviceLocation,
  measurementPoints = [],
  height = '340px',
  zoom = 16,
  isTracking = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const pointMarkersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Mapbox Leaflet map ONLY when genuine device coordinates are available
  useEffect(() => {
    if (!mapContainerRef.current || !deviceLocation) return;

    const { latitude, longitude } = deviceLocation;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom,
        attributionControl: false, // We configure the required Mapbox attribution control below
        zoomControl: true,
      });

      // Retrieve Mapbox token from environment variable - NEVER hard-coded in source
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

      // Mapbox Dark-v11 raster tiles with clean OpenStreetMap fallback if token is unset
      const tileUrl = mapboxToken
        ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
        : (import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        tileSize: 256,
      }).addTo(map);

      // Mapbox Official Logo Control (Bottom-Left)
      const MapboxLogoControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function () {
          const div = L.DomUtil.create('div', 'mapboxgl-ctrl mapbox-logo-ctrl');
          div.innerHTML = `
            <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" title="Mapbox" style="display: flex; align-items: center; padding: 2px 6px; background: rgba(3, 7, 18, 0.7); backdrop-filter: blur(4px); border-radius: 4px; text-decoration: none; border: 1px solid rgba(255,255,255,0.08);">
              <svg width="62" height="18" viewBox="0 0 88 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ffffff" d="M14.6 14.8c-.8 0-1.4-.4-1.7-1.1l-2.4 2.8c1.1 1.2 2.6 1.8 4.2 1.8 3.5 0 6.1-2.4 6.1-6.1s-2.6-6.1-6.1-6.1c-1.6 0-3.1.6-4.2 1.8L12.9 11c.3-.7.9-1.1 1.7-1.1 1.5 0 2.5 1.1 2.5 2.5s-1 2.4-2.5 2.4zm-14.6 3.1h3.4V9.6c.9-.9 2.2-1.4 3.5-1.4 2.4 0 4 1.7 4 4.3v5.4h3.4V12c0-4.3-2.7-7-6.5-7-1.8 0-3.3.6-4.4 1.7V.8H0v17.1zm28.9-1.9c.7 1.2 2 1.9 3.5 1.9 2.3 0 4-1.3 4-3.7v-.3c-.9.7-2.1 1.1-3.4 1.1-3 0-5.1-1.9-5.1-4.7 0-3.1 2.4-5.2 5.5-5.2 1.3 0 2.3.4 3.1 1.1V5.2h3.3v10.2c0 3.7-2.8 5.9-6.9 5.9-2.6 0-4.8-1.2-5.9-3.2l1.9-2.1zm7.4-5.7c0-1.5-1-2.6-2.4-2.6-1.3 0-2.3 1-2.3 2.4 0 1.4 1.1 2.4 2.4 2.4 1.3 0 2.3-1 2.3-2.2zm11 1.9c0-3.6 2.7-6 6.3-6 3.6 0 6.3 2.4 6.3 6s-2.7 6-6.3 6c-3.6 0-6.3-2.4-6.3-6zm9.2 0c0-1.8-1.2-3.1-2.9-3.1-1.7 0-2.9 1.3-2.9 3.1s1.2 3.1 2.9 3.1c1.7 0 2.9-1.3 2.9-3.1zm11.2-1.9c.8-.8 1.9-1.3 3.1-1.3 1.3 0 2.3.5 3 1.4V5.2h3.3v12.7h-3.3v-1.1c-.8.9-1.8 1.4-3.1 1.4-2.9 0-5.3-2.3-5.3-6 0-1.8.8-3.4 2.3-4.3zm6.1 4.3c0-1.5-1-2.6-2.3-2.6-1.4 0-2.4 1.1-2.4 2.6 0 1.5 1 2.6 2.4 2.6 1.3 0 2.3-1.1 2.3-2.6z"/>
              </svg>
            </a>
          `;
          return div;
        },
      });
      new MapboxLogoControl().addTo(map);

      // Built-in Attribution Control displaying: © Mapbox | © OpenStreetMap | Improve this map
      const attributionControl = L.control.attribution({
        position: 'bottomright',
        prefix: false,
      });
      attributionControl.addAttribution(
        '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener noreferrer"><strong>Improve this map</strong></a>'
      );
      attributionControl.addTo(map);

      pointMarkersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Invalidate size after mount to guarantee crisp rendering on mobile and desktop
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      const handleResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerRef.current = null;
          circleRef.current = null;
          pointMarkersRef.current = null;
        }
      };
    }
  }, [deviceLocation ? true : false]);

  // Dynamically update marker, accuracy circle, and map center whenever deviceLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !deviceLocation) return;

    const { latitude, longitude, accuracyMeters, timestamp } = deviceLocation;

    // Custom pulsing radar marker for the live device
    const pulseIcon = L.divIcon({
      className: 'custom-gps-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(20, 184, 166, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 5px; left: 5px; width: 18px; height: 18px; border-radius: 50%; background: #0d9488; border: 2.5px solid #ffffff; box-shadow: 0 0 12px #14b8a6;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const formattedTime = new Date(timestamp).toLocaleTimeString();
    const popupContent = `
      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #0f172a; padding: 4px; line-height: 1.5;">
        <strong style="color: #0f766e; font-size: 12px;">Real Device Location</strong><br/>
        <b>Latitude:</b> ${latitude.toFixed(6)}°<br/>
        <b>Longitude:</b> ${longitude.toFixed(6)}°<br/>
        <b>GPS accuracy:</b> ±${accuracyMeters} meters<br/>
        <b>Updated:</b> ${formattedTime}<br/>
        ${
          isTracking
            ? '<span style="display:inline-block; margin-top:3px; padding:2px 6px; background:#dcfce7; color:#15803d; border-radius:4px; font-weight:bold;">● Continuous Tracking Active</span>'
            : '<span style="display:inline-block; margin-top:3px; padding:2px 6px; background:#e0f2fe; color:#0369a1; border-radius:4px;">GPS Fix Active</span>'
        }
      </div>
    `;

    // Update or create device marker
    if (!markerRef.current) {
      markerRef.current = L.marker([latitude, longitude], { icon: pulseIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng([latitude, longitude]);
    }
    markerRef.current.bindPopup(popupContent);

    // Update or create accuracy circle - RADIUS MUST USE REAL position.coords.accuracy (accuracyMeters)
    if (!circleRef.current) {
      circleRef.current = L.circle([latitude, longitude], {
        radius: accuracyMeters,
        color: '#0d9488',
        weight: 1.5,
        fillColor: '#14b8a6',
        fillOpacity: 0.15,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([latitude, longitude]);
      circleRef.current.setRadius(accuracyMeters);
    }

    // Pan smoothly to updated location
    map.panTo([latitude, longitude], { animate: true });
  }, [deviceLocation, isTracking]);

  // Update measurement history points overlay
  useEffect(() => {
    const pointGroup = pointMarkersRef.current;
    if (!pointGroup) return;

    pointGroup.clearLayers();

    measurementPoints.forEach((point) => {
      if (point.location?.latitude && point.location?.longitude) {
        const color =
          point.status === 'GOOD'
            ? '#10b981'
            : point.status === 'FAIR'
            ? '#f59e0b'
            : '#ef4444';

        const pointIcon = L.divIcon({
          className: 'custom-history-marker',
          html: `<div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 1.5px solid #ffffff; box-shadow: 0 0 6px ${color};"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const m = L.marker([point.location.latitude, point.location.longitude], { icon: pointIcon });
        m.bindPopup(`
          <div style="font-family: ui-monospace, monospace; font-size: 11px; color: #0f172a; padding: 2px;">
            <strong>${point.network_name}</strong><br/>
            Speed: ${point.download_speed_mbps} Mbps<br/>
            Latency: ${point.latency_ms} ms<br/>
            Time: ${new Date(point.timestamp).toLocaleTimeString()}
          </div>
        `);
        pointGroup.addLayer(m);
      }
    });
  }, [measurementPoints]);

  if (!deviceLocation) {
    return (
      <div
        style={{ height, width: '100%' }}
        className="rounded-2xl border border-slate-800 bg-slate-950/70 flex flex-col items-center justify-center p-6 text-center space-y-3 font-mono shadow-inner"
      >
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <MapPinOff className="w-8 h-8 opacity-80" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-200">Map Awaiting Real Device Position</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            Location permission required. Enable location to center this map on your physical coordinates with genuine radial accuracy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden' }}
      className="z-10 shadow-inner border border-slate-800 relative"
    />
  );
};
