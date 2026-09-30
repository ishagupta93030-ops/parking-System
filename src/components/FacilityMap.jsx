import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Clock, 
  Zap, 
  Star, 
  ChevronRight,
  Crosshair,
  LocateFixed,
  AlertCircle,
  Route,
  Sparkles,
  Layers,
  Search,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Compass,
  SlidersHorizontal
} from 'lucide-react';
import { PARKING_FACILITIES } from '../data/facilitiesData';

// Haversine formula to compute actual km distance between two GPS coordinates
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Available Tile Layers for user customization
const MAP_THEMES = {
  streets: {
    id: 'streets',
    name: 'Street View',
    icon: '🗺️',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, subdomains: ['a', 'b', 'c'] }
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite / Aerial',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19 }
  },
  dark: {
    id: 'dark',
    name: 'Dark Cyber Mode',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: { maxZoom: 19, subdomains: ['a', 'b', 'c', 'd'] }
  },
  light: {
    id: 'light',
    name: 'Minimal Light',
    icon: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: { maxZoom: 19, subdomains: ['a', 'b', 'c', 'd'] }
  }
};

// Popular Quick-Jump City Presets
const CITY_PRESETS = [
  { name: 'Noida / NCR (IoT Hub)', lat: 28.5355, lng: 77.3910 },
  { name: 'New Delhi (Central)', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai (Bandra / BKC)', lat: 19.0600, lng: 72.8656 },
  { name: 'Bengaluru (Tech Park)', lat: 12.9716, lng: 77.5946 },
  { name: 'New York (Manhattan)', lat: 40.7128, lng: -74.0060 },
  { name: 'London (Westminster)', lat: 51.5074, lng: -0.1278 }
];

export function FacilityMap({
  activeFacilityId,
  onSelectFacility,
  liveLotVacantCount,
  liveLotTotalCount
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Customization States
  const [mapTheme, setMapTheme] = useState('streets');
  const [isClickToAddMode, setIsClickToAddMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);

  // Data & Selection States
  const [filterType, setFilterType] = useState('all');
  const [facilities, setFacilities] = useState(PARKING_FACILITIES);
  const [activeFacility, setActiveFacility] = useState(
    PARKING_FACILITIES.find(f => f.id === activeFacilityId) || PARKING_FACILITIES[0]
  );

  // User Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Click "Enable Live Location" or search any city to customize the map');

  // Custom Spot Modal State
  const [customSpotModal, setCustomSpotModal] = useState({
    isOpen: false,
    lat: 0,
    lng: 0,
    name: 'My Custom Parking Bay',
    ratePerHour: 30,
    totalSpots: 30,
    vacantSpots: 15,
    hasEv: false,
    isCovered: true
  });

  // Edit Existing Facility Modal State
  const [editingFacility, setEditingFacility] = useState(null);

  // Dynamic live available counts
  const getFacilityVacant = useCallback((f) => {
    if (f.isCurrentFacility) {
      return liveLotVacantCount !== undefined ? liveLotVacantCount : 18;
    }
    return f.vacantSpots || 15;
  }, [liveLotVacantCount]);

  const getFacilityTotal = useCallback((f) => {
    if (f.isCurrentFacility) {
      return liveLotTotalCount !== undefined ? liveLotTotalCount : 24;
    }
    return f.totalSpots || 50;
  }, [liveLotTotalCount]);

  // Request browser GPS location
  const handleEnableLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setIsLocating(false);

        let placeName = 'My Location';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=14`);
          if (res.ok) {
            const data = await res.json();
            placeName = data.address?.city || data.address?.town || data.address?.suburb || 'Your Area';
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }

        setUserLocation({ lat: userLat, lng: userLng, name: placeName });
        setLocationStatus(`GPS Active: ${placeName} (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);

        // Re-anchor facilities around user's real coordinates
        repositionFacilitiesNear(userLat, userLng, placeName);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`Location request denied (${err.message}). Use city search or click on map.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Reposition facilities around any chosen coordinate
  const repositionFacilitiesNear = (centerLat, centerLng, centerName) => {
    const offsets = [
      { dLat: 0.0020, dLng: 0.0025, name: `ParkSense IoT Hub (${centerName})`, isIoT: true },
      { dLat: -0.0045, dLng: 0.0055, name: `${centerName} Central Multi-Level`, isIoT: false },
      { dLat: 0.0065, dLng: -0.0050, name: `${centerName} Transit Station Deck`, isIoT: false },
      { dLat: -0.0090, dLng: -0.0075, name: `Grand Commercial Plaza (${centerName})`, isIoT: false },
      { dLat: 0.0115, dLng: 0.0090, name: `${centerName} Healthcare & Hospital Garage`, isIoT: false }
    ];

    setFacilities(prev =>
      prev.map((fac, idx) => {
        const offset = offsets[idx % offsets.length];
        const facLat = centerLat + offset.dLat;
        const facLng = centerLng + offset.dLng;
        const dist = userLocation
          ? calculateDistanceKm(userLocation.lat, userLocation.lng, facLat, facLng)
          : calculateDistanceKm(centerLat, centerLng, facLat, facLng);
        const driveMin = Math.max(1, Math.round(dist * 3.2));

        return {
          ...fac,
          name: offset.name,
          lat: facLat,
          lng: facLng,
          distanceKm: dist,
          driveTimeMin: driveMin,
          address: `${centerName} Zone ${idx + 1}`
        };
      })
    );

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 14, { duration: 0.8 });
    }
  };

  // Search any city / address using OpenStreetMap Nominatim
  const handleSearchLocation = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchFeedback('Searching location on global map...');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();

      setIsSearching(false);

      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        const name = result.display_name.split(',')[0];

        setSearchFeedback(`Jumped to: ${name}`);
        setUserLocation({ lat: newLat, lng: newLng, name });
        repositionFacilitiesNear(newLat, newLng, name);
      } else {
        setSearchFeedback('Location not found. Try another city name.');
      }
    } catch (err) {
      setIsSearching(false);
      setSearchFeedback('Search failed. Check network connection.');
    }
  };

  // Quick jump to city preset
  const handleJumpToPreset = (preset) => {
    setUserLocation({ lat: preset.lat, lng: preset.lng, name: preset.name });
    setSearchFeedback(`Switched to: ${preset.name}`);
    repositionFacilitiesNear(preset.lat, preset.lng, preset.name);
  };

  // Switch Tile Layer (Theme)
  const handleSwitchTheme = (themeKey) => {
    setMapTheme(themeKey);
    const theme = MAP_THEMES[themeKey];
    const map = mapInstanceRef.current;
    if (!map || !theme) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(theme.url, theme.options).addTo(map);
  };

  // Add Custom Parking Spot via Map Click
  const handleSaveCustomSpot = (e) => {
    e.preventDefault();
    const newId = `custom-spot-${Date.now()}`;
    const newFacility = {
      id: newId,
      name: customSpotModal.name.trim() || 'Custom Private Parking',
      tagline: 'Custom User-Added Parking Bay',
      lat: customSpotModal.lat,
      lng: customSpotModal.lng,
      address: `Custom Pinned Location (${customSpotModal.lat.toFixed(4)}, ${customSpotModal.lng.toFixed(4)})`,
      distanceKm: userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, customSpotModal.lat, customSpotModal.lng) : 0.5,
      driveTimeMin: 2,
      ratePerHour: Number(customSpotModal.ratePerHour) || 30.0,
      twoWheelerRate: Math.round((Number(customSpotModal.ratePerHour) || 30) * 0.5),
      suvRate: Math.round((Number(customSpotModal.ratePerHour) || 30) * 1.33),
      evRate: Math.round((Number(customSpotModal.ratePerHour) || 30) * 1.66),
      totalSpots: Number(customSpotModal.totalSpots) || 20,
      vacantSpots: Number(customSpotModal.vacantSpots) || 10,
      rating: 5.0,
      operatingHours: '24/7 Custom Access',
      isCurrentFacility: false,
      features: [
        customSpotModal.hasEv ? 'EV Fast Charger' : 'Standard Electric',
        customSpotModal.isCovered ? 'Covered Roof' : 'Open Air',
        'User Customized'
      ]
    };

    setFacilities(prev => [newFacility, ...prev]);
    setActiveFacility(newFacility);
    if (onSelectFacility) onSelectFacility(newFacility);
    setCustomSpotModal({ ...customSpotModal, isOpen: false });
    setIsClickToAddMode(false);
  };

  // Save edits to existing facility
  const handleSaveEditedFacility = (e) => {
    e.preventDefault();
    if (!editingFacility) return;

    setFacilities(prev =>
      prev.map(f => (f.id === editingFacility.id ? { ...f, ...editingFacility } : f))
    );

    if (activeFacility.id === editingFacility.id) {
      setActiveFacility(editingFacility);
      if (onSelectFacility) onSelectFacility(editingFacility);
    }

    setEditingFacility(null);
  };

  // Delete custom facility
  const handleDeleteFacility = (facilityId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this parking facility from your map?')) {
      const remaining = facilities.filter(f => f.id !== facilityId);
      setFacilities(remaining);
      if (activeFacility.id === facilityId && remaining.length > 0) {
        setActiveFacility(remaining[0]);
        if (onSelectFacility) onSelectFacility(remaining[0]);
      }
    }
  };

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    const vacant = getFacilityVacant(f);
    if (filterType === 'high_avail') return vacant >= 20;
    if (filterType === 'budget') return f.ratePerHour <= 25;
    if (filterType === 'ev') return f.features.some(feat => feat.toLowerCase().includes('ev'));
    return true;
  });

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialTheme = MAP_THEMES[mapTheme];
      const map = L.map(mapContainerRef.current, {
        center: [activeFacility.lat, activeFacility.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      tileLayerRef.current = L.tileLayer(initialTheme.url, initialTheme.options).addTo(map);

      // Map Click Handler for "Add Spot on Map" or "Set My Location"
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Open custom spot creation dialog
        setCustomSpotModal({
          isOpen: true,
          lat,
          lng,
          name: 'New Custom Parking Spot',
          ratePerHour: 30,
          totalSpots: 25,
          vacantSpots: 12,
          hasEv: true,
          isCovered: true
        });
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Fix grey tile rendering issue by explicitly calling invalidateSize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // 2. Render Markers, User Location Pin, and Driving Path
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // Clear old facility markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Add Facility Markers
    facilities.forEach(f => {
      const isSelected = f.id === activeFacility.id;
      const vacant = getFacilityVacant(f);
      const isFull = vacant <= 2;

      const markerHtml = `
        <div style="transform: translate(-50%, -100%);" class="cursor-pointer transition-transform hover:scale-110">
          <div style="background-color: ${isSelected ? '#2563eb' : isFull ? '#e11d48' : '#059669'}; color: white; border: 2px solid white; border-radius: 12px; padding: 4px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: 800; font-size: 11px; white-space: nowrap; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 9999px; background-color: ${isSelected ? '#93c5fd' : '#a7f3d0'};"></span>
            <span>${vacant} Free</span>
            <span style="background: rgba(0,0,0,0.35); padding: 2px 6px; border-radius: 6px; font-family: monospace;">₹${f.ratePerHour}/h</span>
          </div>
          <div style="width: 8px; height: 8px; background-color: ${isSelected ? '#2563eb' : isFull ? '#e11d48' : '#059669'}; transform: rotate(45deg); margin: -4px auto 0 auto;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'facility-marker-pin',
        html: markerHtml,
        iconSize: [120, 36],
        iconAnchor: [60, 36]
      });

      const marker = L.marker([f.lat, f.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveFacility(f);
        if (onSelectFacility) onSelectFacility(f);
      });

      markersRef.current.push(marker);
    });

    // Add User Live GPS Location Pin (if enabled)
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userPinHtml = `
        <div style="transform: translate(-50%, -50%); position: relative;" class="flex items-center justify-center">
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: rgba(37,99,235,0.25); border: 2px solid #3b82f6; position: absolute; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 9999px; background: #2563eb; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 10;"></div>
          <div style="position: absolute; top: 22px; background: #0f172a; color: white; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1px solid #334155;">
            📍 YOU ARE HERE
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-live-pin',
        html: userPinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

      // Draw Driving Route Polyline from User Location to Active Parking Lot
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }

      const routePoints = [
        [userLocation.lat, userLocation.lng],
        [(userLocation.lat + activeFacility.lat) / 2 + 0.0006, (userLocation.lng + activeFacility.lng) / 2 - 0.0005],
        [activeFacility.lat, activeFacility.lng]
      ];

      routeLineRef.current = L.polyline(routePoints, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    // Pan map smoothly to the active facility or fit both user and lot
    if (userLocation && activeFacility) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [activeFacility.lat, activeFacility.lng]
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (activeFacility) {
      map.flyTo([activeFacility.lat, activeFacility.lng], 14, { duration: 0.8 });
    }
  }, [activeFacility, facilities, userLocation, getFacilityVacant, onSelectFacility]);

  return (
    <section className="card-panel p-5 md:p-6 shadow-sm overflow-hidden flex flex-col gap-4">
      {/* 1. TOP CONTROL BAR: Map Layer Switcher, City Search & Location Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
              CUSTOMIZABLE GPS MAP
            </span>
            {userLocation && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Location: {userLocation.name}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            Interactive City Parking Map & Navigator
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            {locationStatus}
          </p>
        </div>

        {/* Global Search Bar & GPS Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Address / City Search Form */}
          <form onSubmit={handleSearchLocation} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search city, area, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-16 py-2 bg-slate-100 border border-slate-300 focus:border-blue-600 text-xs font-semibold text-slate-900 rounded-xl outline-none w-56 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
            >
              {isSearching ? '...' : 'Jump'}
            </button>
          </form>

          {/* Live GPS Button */}
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={isLocating}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
              userLocation
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {userLocation ? <LocateFixed className="w-3.5 h-3.5" /> : <Crosshair className="w-3.5 h-3.5" />}
            <span>{userLocation ? 'GPS Active' : 'My Live Location'}</span>
          </button>
        </div>
      </div>

      {/* 2. CUSTOMIZATION TOOLS BAR: Layer Theme Selector, City Presets, and Click-to-Pin Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        {/* Layer Theme Selector */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Map Layer:
          </span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
            {Object.values(MAP_THEMES).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSwitchTheme(t.id)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                  mapTheme === t.id
                    ? 'bg-blue-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={`Switch map to ${t.name}`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick City Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="font-bold text-slate-500 text-[11px] hidden md:inline">Quick Jump:</span>
          {CITY_PRESETS.slice(0, 4).map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleJumpToPreset(p)}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Click to Add Custom Spot Helper */}
        <div className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-[11px] font-bold">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Click anywhere on the map to pin your own parking spot!</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Lots ({facilities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('high_avail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'high_avail' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟢 High Vacancy (&gt;20)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'budget' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏷️ Budget (&le; ₹25/hr)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ev')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'ev' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ EV Chargers
          </button>
        </div>

        {searchFeedback && (
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {searchFeedback}
          </span>
        )}
      </div>

      {/* Main Grid: Leaflet Map (Left) & Facilities List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Leaflet Map Container (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner relative min-h-[440px] lg:min-h-[520px]">
          {/* Map canvas */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[440px] lg:min-h-[520px] z-10" />

          {/* Current Map Theme Badge */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 pointer-events-none">
            <span>{MAP_THEMES[mapTheme]?.icon}</span>
            <span>{MAP_THEMES[mapTheme]?.name}</span>
          </div>

          {/* Bottom Active Facility Floating Banner */}
          {activeFacility && (
            <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm">
                  {getFacilityVacant(activeFacility)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{activeFacility.name}</h4>
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <span>{activeFacility.distanceKm === 0 ? 'At Location' : `${activeFacility.distanceKm} km away`}</span>
                    <span>•</span>
                    <strong className="text-emerald-400 font-mono">1-Hr Rate: ₹{activeFacility.ratePerHour}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-2 py-1 rounded border border-blue-800">
                  {getFacilityVacant(activeFacility)} of {getFacilityTotal(activeFacility)} Free
                </span>
                <button
                  type="button"
                  onClick={() => setEditingFacility(activeFacility)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title="Customize Rate / Name of this facility"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Facilities List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filteredFacilities.map(f => {
            const isSelected = f.id === activeFacility.id;
            const vacant = getFacilityVacant(f);
            const total = getFacilityTotal(f);
            const pct = Math.round((vacant / total) * 100);

            return (
              <div
                key={f.id}
                onClick={() => {
                  setActiveFacility(f);
                  if (onSelectFacility) onSelectFacility(f);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Top Row: Name, Tag & 1-Hr Badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{f.name}</h4>
                      {f.isCurrentFacility && (
                        <span className="text-[9px] font-black text-blue-800 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded">
                          IOT SENSOR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">{f.address}</p>
                  </div>

                  {/* 1-HOUR RATE BADGE */}
                  <div className="text-right shrink-0 bg-slate-900 text-white px-2.5 py-1 rounded-xl shadow-2xs">
                    <span className="text-[9px] uppercase tracking-wider text-slate-300 block font-bold">1 HOUR</span>
                    <span className="font-mono text-sm font-black text-emerald-400">₹{f.ratePerHour}</span>
                  </div>
                </div>

                {/* Middle Row: Availability Bar & Distance */}
                <div className="my-2.5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>{vacant} Free Spots</strong>{' '}
                      <span className="text-slate-400 font-normal">({total} Total)</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {f.distanceKm === 0 ? '📍 At Your Spot' : `${f.distanceKm} km • ${f.driveTimeMin} min drive`}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Tags & Customize Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {f.features.slice(0, 2).map((feat, i) => (
                      <span key={i} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {feat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFacility(f);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Edit hourly rate & details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {!f.isCurrentFacility && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFacility(f.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove facility"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className={`text-xs font-extrabold flex items-center gap-0.5 ${
                      isSelected ? 'text-blue-700' : 'text-slate-600'
                    }`}>
                      {isSelected ? 'Active' : 'Select'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: ADD CUSTOM SPOT (Triggered by clicking map) */}
      {customSpotModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Add Custom Parking Bay on Map
              </h3>
              <button
                type="button"
                onClick={() => setCustomSpotModal({ ...customSpotModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCustomSpot} className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <span>Pinned GPS: </span>
                <strong className="font-mono">{customSpotModal.lat.toFixed(5)}, {customSpotModal.lng.toFixed(5)}</strong>
              </div>

              <div>
                <label className="block font-black uppercase text-slate-700 mb-1">Facility / Spot Name</label>
                <input
                  type="text"
                  value={customSpotModal.name}
                  onChange={(e) => setCustomSpotModal({ ...customSpotModal, name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-bold px-3 py-2 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-slate-700 mb-1">1-Hour Tariff (₹)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={customSpotModal.ratePerHour}
                    onChange={(e) => setCustomSpotModal({ ...customSpotModal, ratePerHour: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold px-3 py-2 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-slate-700 mb-1">Total Spots</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={customSpotModal.totalSpots}
                    onChange={(e) => setCustomSpotModal({ ...customSpotModal, totalSpots: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold px-3 py-2 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-slate-700 mb-1">Vacant / Free Spots</label>
                  <input
                    type="number"
                    min="0"
                    max={customSpotModal.totalSpots}
                    value={customSpotModal.vacantSpots}
                    onChange={(e) => setCustomSpotModal({ ...customSpotModal, vacantSpots: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold px-3 py-2 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col justify-center space-y-1.5 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={customSpotModal.hasEv}
                      onChange={(e) => setCustomSpotModal({ ...customSpotModal, hasEv: e.target.checked })}
                      className="accent-blue-600"
                    />
                    <span>EV Fast Charging</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={customSpotModal.isCovered}
                      onChange={(e) => setCustomSpotModal({ ...customSpotModal, isCovered: e.target.checked })}
                      className="accent-blue-600"
                    />
                    <span>Covered Parking</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomSpotModal({ ...customSpotModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Spot to Map</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EXISTING FACILITY */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Customize Facility Pricing & Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingFacility(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditedFacility} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  value={editingFacility.name}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-bold px-3 py-2 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-slate-700 mb-1">1-Hour Tariff (₹/hr)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={editingFacility.ratePerHour}
                    onChange={(e) => setEditingFacility({ ...editingFacility, ratePerHour: parseFloat(e.target.value) || 30 })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold px-3 py-2 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-slate-700 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editingFacility.totalSpots}
                    onChange={(e) => setEditingFacility({ ...editingFacility, totalSpots: parseInt(e.target.value, 10) || 50 })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold px-3 py-2 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              {!editingFacility.isCurrentFacility && (
                <div>
                  <label className="block font-black uppercase text-slate-700 mb-1">Current Vacant Spots</label>
                  <input
                    type="number"
                    min="0"
                    max={editingFacility.totalSpots}
                    value={editingFacility.vacantSpots || 10}
                    onChange={(e) => setEditingFacility({ ...editingFacility, vacantSpots: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold px-3 py-2 rounded-xl outline-none"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
