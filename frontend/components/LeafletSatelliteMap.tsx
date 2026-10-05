import React, { useMemo } from 'react';
import { View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, Navigation } from 'lucide-react-native';
import { RecycleCenter } from '../types';

interface LeafletSatelliteMapProps {
  userLat?: number;
  userLng?: number;
  userLocationName?: string;
  radiusKm?: number;
  centers: RecycleCenter[];
  onSelectCenter?: (center: RecycleCenter) => void;
  height?: number;
}

export default function LeafletSatelliteMap({
  userLat = 3.1517,
  userLng = 101.5947,
  userLocationName = 'Lokasi Semasa',
  radiusKm = 5,
  centers = [],
  onSelectCenter,
  height = 240,
}: LeafletSatelliteMapProps) {
  // Normalize centers with coordinates
  const markersData = useMemo(() => {
    return centers.map((c) => {
      const lat = c.coordinates?.lat ?? c.coordinates?.latitude ?? userLat;
      const lng = c.coordinates?.lng ?? c.coordinates?.longitude ?? userLng;
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        address: c.address,
        distance: c.distance,
        lat,
        lng,
        color: c.type === 'RecycleCenter' ? '#16a34a' : '#9333ea',
      };
    });
  }, [centers, userLat, userLng]);

  // Leaflet HTML template with Esri Satellite imagery and boundaries/labels overlay
  const mapHtml = useMemo(() => {
    const centersJson = JSON.stringify(markersData);
    const uLat = userLat || 3.1517;
    const uLng = userLng || 101.5947;
    const uName = JSON.stringify(userLocationName || 'Lokasi Anda');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .leaflet-popup-content-wrapper {
      background: rgba(15, 23, 42, 0.95);
      color: #f8fafc;
      border-radius: 12px;
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px;
    }
    .leaflet-popup-tip {
      background: rgba(15, 23, 42, 0.95);
    }
    .leaflet-popup-content {
      margin: 8px 10px;
      line-height: 1.4;
      font-size: 12px;
    }
    .popup-title {
      font-weight: 700;
      font-size: 13px;
      color: #ffffff;
      margin-bottom: 3px;
    }
    .popup-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .badge-recycle {
      background: #16a34a;
      color: #ffffff;
    }
    .badge-ngo {
      background: #9333ea;
      color: #ffffff;
    }
    .popup-address {
      color: #94a3b8;
      font-size: 11px;
    }
    .user-pulse {
      position: relative;
      width: 18px;
      height: 18px;
      background: #0284c7;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px #0284c7;
    }
    .pulse-ring {
      position: absolute;
      top: -10px;
      left: -10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #38bdf8;
      animation: pulsate 1.8s ease-out infinite;
      opacity: 0.8;
    }
    @keyframes pulsate {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .custom-pin {
      width: 26px;
      height: 26px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }
    .custom-pin-inner {
      width: 10px;
      height: 10px;
      background: #ffffff;
      border-radius: 50%;
      transform: rotate(45deg);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const userLat = ${uLat};
    const userLng = ${uLng};
    const userName = ${uName};
    const centers = ${centersJson};

    // Initialize Map
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([userLat, userLng], 14);

    // Esri World Imagery (Real High-Resolution Satellite)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    // Boundaries, Roads & Labels overlay for readable satellite hybrid view
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    // User Location Marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div class="user-pulse"><div class="pulse-ring"></div></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<div class="popup-title">📍 Lokasi Anda</div><div class="popup-address">' + userName + '</div>');

    // Radius circle around user
    L.circle([userLat, userLng], {
      color: '#38bdf8',
      fillColor: '#0284c7',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 6',
      radius: ${radiusKm * 1000}
    }).addTo(map);

    // Add Facility Markers
    const bounds = L.latLngBounds([[userLat, userLng]]);

    centers.forEach(function(c) {
      if (typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)) {
        bounds.extend([c.lat, c.lng]);

        const pinColor = c.type === 'RecycleCenter' ? '#16a34a' : '#9333ea';
        const pinHtml = '<div class="custom-pin" style="background-color: ' + pinColor + '"><div class="custom-pin-inner"></div></div>';

        const centerIcon = L.divIcon({
          className: '',
          html: pinHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
          popupAnchor: [0, -24]
        });

        const badgeClass = c.type === 'RecycleCenter' ? 'badge-recycle' : 'badge-ngo';
        const badgeText = c.type === 'RecycleCenter' ? '♻️ Pusat Kitar Semula' : '💜 Pusat Derma NGO';

        const popupContent = 
          '<span class="popup-badge ' + badgeClass + '">' + badgeText + '</span>' +
          '<div class="popup-title">' + c.name + '</div>' +
          '<div class="popup-address">' + c.address + '</div>' +
          '<div style="margin-top: 4px; font-weight: bold; color: #38bdf8;">' + c.distance + ' km dari anda</div>';

        const marker = L.marker([c.lat, c.lng], { icon: centerIcon }).addTo(map);
        marker.bindPopup(popupContent);

        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_CENTER', id: c.id }));
          }
        });
      }
    });

    if (centers.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  </script>
</body>
</html>`;
  }, [markersData, userLat, userLng, userLocationName, radiusKm]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_CENTER' && onSelectCenter) {
        const found = centers.find((c) => c.id === data.id);
        if (found) onSelectCenter(found);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {Platform.OS === 'web' ? (
        // Web platform: standard iframe
        <iframe
          srcDoc={mapHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 16,
          }}
          title="Satellite Map"
        />
      ) : (
        // Mobile platform (Android & iOS): WebView with Leaflet
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          androidLayerType="hardware"
        />
      )}

      {/* Satellite badge overlay */}
      <View style={styles.badgeOverlay}>
        <View style={styles.badgeContent}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>Satelit Sebenar (Esri World Imagery)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  badgeContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 5,
  },
  badgeText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '700',
  },
});
