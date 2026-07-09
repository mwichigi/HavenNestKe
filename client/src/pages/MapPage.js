import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const MAP_CENTER = { lat: -1.3521, lng: 36.8219 };

const DEMO_PROPERTIES = [
  { id:1, title:'Rongai Gardens',      lat:-1.4241, lng:36.7528, rent:18000, bedrooms:1, status:'available'  },
  { id:2, title:'Kitengela Heights',   lat:-1.4748, lng:36.9605, rent:25000, bedrooms:2, status:'new_build'  },
  { id:3, title:'Thika Road Suites',   lat:-1.1453, lng:36.9800, rent:35000, bedrooms:2, status:'available'  },
  { id:4, title:'Juja Green Apts',     lat:-1.1028, lng:37.0144, rent:15000, bedrooms:0, status:'occupied'   },
  { id:5, title:'Syokimau Courts',     lat:-1.3626, lng:36.9059, rent:28000, bedrooms:2, status:'available'  },
  { id:6, title:'Ruiru Budget Studio', lat:-1.1595, lng:36.9612, rent:8000,  bedrooms:0, status:'available'  },
  { id:7, title:'Rongai Executive',    lat:-1.4280, lng:36.7510, rent:30000, bedrooms:2, status:'new_build'  },
];

const PIN_ICONS = {
  available: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  new_build: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  occupied:  'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
};

const STATUS_LABELS = {
  available: { text:'✅ Available', color:'bg-green-100 text-green-700' },
  new_build: { text:'🆕 New Build', color:'bg-amber-100 text-amber-700' },
  occupied:  { text:'🔴 Full',      color:'bg-red-100 text-red-700'     },
};

const mapContainerStyle = { width:'100%', height:'100%' };

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    { featureType:'poi', elementType:'labels', stylers:[{ visibility:'off' }] },
  ],
};

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedPin, setSelectedPin] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [driveTimes, setDriveTimes] = useState({});
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    Promise.all([
      api.get('/properties?status=available&limit=100'),
      api.get('/properties?status=occupied&limit=100'),
    ]).then(([availRes, occRes]) => {
      const all = [...(availRes.data.properties || []), ...(occRes.data.properties || [])];
      const mapped = all
        .filter(p => p.latitude && p.longitude)
        .map(p => ({
          id: p.id,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
          title: p.title,
          rent: Number(p.rent_amount),
          bedrooms: p.bedrooms,
          status: p.is_new_build ? 'new_build' : p.status,
        }));
      setProperties(mapped);
    }).catch(err => console.error('Failed to load properties for map', err));
  }, []);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
  const keyMissing = !apiKey || apiKey === 'PASTE_YOUR_KEY_HERE' || apiKey === 'placeholder';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const filtered = properties.filter(p =>
    filter === 'all' ? true : p.status === filter
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Location permission denied. Enable it to see drive times.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!isLoaded || !userLocation || !window.google || properties.length === 0) return;
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [userLocation],
        destinations: properties.map(p => ({ lat: p.lat, lng: p.lng })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== 'OK' || !response) return;
        const results = {};
        response.rows[0].elements.forEach((el, i) => {
          const propId = properties[i].id;
          if (el.status === 'OK') {
            results[propId] = { distance: el.distance.text, duration: el.duration.text };
          }
        });
        setDriveTimes(results);
      }
    );
  }, [isLoaded, userLocation, properties]);

  const getDirectionsUrl = (prop) => {
    const destination = prop.lat + ',' + prop.lng;
    if (userLocation) {
      return 'https://www.google.com/maps/dir/?api=1&origin=' + userLocation.lat + ',' + userLocation.lng + '&destination=' + destination + '&travelmode=driving';
    }
    return 'https://www.google.com/maps/dir/?api=1&destination=' + destination + '&travelmode=driving';
  };

  if (keyMissing) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Maps API Key Required</h2>
          <p className="text-gray-500 mb-6 max-w-md leading-relaxed">
            To display the live map with property pins, you need a Google Maps API key.
            Follow the steps below to get your free key.
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-lg w-full border border-gray-200">
            <p className="font-semibold text-gray-900 mb-4">How to get your API key:</p>
            {[
              'Go to console.cloud.google.com',
              'Create a new project called NestKenya',
              'Go to APIs & Services → Library',
              'Enable: Maps JavaScript API, Geocoding API, Places API',
              'Go to Credentials → Create API Key',
              'Copy the key and add it to client/.env',
            ].map((step, i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
            <div className="mt-5 bg-gray-900 rounded-xl p-3">
              <p className="text-green-400 text-xs font-mono">REACT_APP_GOOGLE_MAPS_KEY=AIzaSy...</p>
              <p className="text-gray-500 text-xs mt-1">Add this line to client/.env then restart npm start</p>
            </div>
          </div>
          <button
            onClick={() => window.open('https://console.cloud.google.com', '_blank')}
            className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Open Google Cloud Console →
          </button>
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Map failed to load</h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Your API key may be invalid or the Maps JavaScript API may not be enabled.
            Check your key at console.cloud.google.com
          </p>
        </div>
      </Layout>
    );
  }

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)]">

        {/* Filter bar */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          {[
            { key:'all',       label:'All Properties' },
            { key:'available', label:'✅ Available'   },
            { key:'new_build', label:'🆕 New Build'   },
            { key:'occupied',  label:'🔴 Full'        },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f.key
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
              }`}
            >
              {f.label}
            </button>
          ))}
          {locationError && <span className="text-[10px] text-amber-600">Enable location for drive times</span>}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} properties</span>
        </div>

        {/* Map + sidebar layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Map */}
          <div className="flex-1 relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={MAP_CENTER}
              zoom={11}
              options={mapOptions}
            >
              {filtered.map((prop) => (
                <Marker
                  key={prop.id}
                  position={{ lat: prop.lat, lng: prop.lng }}
                  onClick={() => setSelectedPin(prop)}
                  icon={PIN_ICONS[prop.status]}
                />
              ))}

              {selectedPin && (
                <InfoWindow
                  position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                  onCloseClick={() => setSelectedPin(null)}
                >
                  <div className="p-2 min-w-[180px]">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[selectedPin.status]?.color}`}>
                      {STATUS_LABELS[selectedPin.status]?.text}
                    </span>
                    <p className="font-bold text-sm text-gray-900 mt-1.5">{selectedPin.title}</p>
                    <p className="text-green-600 font-bold mt-1">
                      Ksh {selectedPin.rent.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedPin.bedrooms === 0 ? 'Bedsitter' : `${selectedPin.bedrooms} Bedroom`}
                    </p>
                    {driveTimes[selectedPin.id] && (
                      <p className="text-xs text-gray-600 mt-1.5">Drive: {driveTimes[selectedPin.id].duration} - {driveTimes[selectedPin.id].distance}</p>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => navigate(`/property/${selectedPin.id}`)}
                        className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => window.open(getDirectionsUrl(selectedPin), '_blank')}
                        className="flex-1 bg-gray-900 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Directions
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>

            {/* Legend */}
            <div className="absolute bottom-6 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-600"><div className="w-3 h-3 rounded-full bg-green-500"></div>Available</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600"><div className="w-3 h-3 rounded-full bg-amber-400"></div>New Build</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600"><div className="w-3 h-3 rounded-full bg-red-500"></div>Full</div>
            </div>
          </div>

          {/* Property list sidebar (desktop) */}
          <div className="hidden lg:flex flex-col w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">{filtered.length} Properties Found</p>
            </div>
            {filtered.map(prop => (
              <div
                key={prop.id}
                onClick={() => setSelectedPin(prop)}
                className={`flex gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPin?.id === prop.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-2xl flex-shrink-0">
                  🏢
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{prop.title}</p>
                  <p className="text-green-600 font-bold text-sm mt-0.5">
                    Ksh {prop.rent.toLocaleString()}/mo
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {prop.bedrooms === 0 ? 'Bedsitter' : `${prop.bedrooms} Bed`}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_LABELS[prop.status]?.color}`}>
                      {STATUS_LABELS[prop.status]?.text}
                    </span>
                  </div>
                  {driveTimes[prop.id] && (
                    <p className="text-[10px] text-gray-500 mt-1">Drive: {driveTimes[prop.id].duration} - {driveTimes[prop.id].distance}</p>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(getDirectionsUrl(prop), '_blank'); }}
                    className="mt-1.5 text-[10px] font-semibold text-green-600 hover:text-green-700"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
