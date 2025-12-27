import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { MapPin, Hexagon, AlertTriangle, RefreshCw, Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getSightings } from '@/lib/sightings';
import BottomNav from '@/components/hivecare/BottomNav';

interface Sighting {
  id: string;
  species: string;
  behavior: string;
  latitude: number;
  longitude: number;
  confidence_score: number;
  created_at: string;
  image_url?: string;
  analysis_result?: any;
}

const MapPage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Fetch sightings
  useEffect(() => {
    const fetchSightings = async () => {
      const data = await getSightings();
      setSightings(data as Sighting[]);
      setIsLoading(false);
    };
    fetchSightings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('sightings-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bee_sightings' },
        (payload) => {
          setSightings(prev => [payload.new as Sighting, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, mapStyle]);

  // Add markers for sightings
  useEffect(() => {
    if (!map.current || sightings.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    sightings.forEach(sighting => {
      if (!sighting.latitude || !sighting.longitude) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            sighting.behavior === 'shimmering' ? 'bg-red-500' :
            sighting.behavior === 'agitated' ? 'bg-yellow-500' :
            'bg-green-500'
          }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 ${
            sighting.behavior === 'shimmering' ? 'border-t-red-500' :
            sighting.behavior === 'agitated' ? 'border-t-yellow-500' :
            'border-t-green-500'
          } border-l-transparent border-r-transparent"></div>
        </div>
      `;

      el.addEventListener('click', () => setSelectedSighting(sighting));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([Number(sighting.longitude), Number(sighting.latitude)])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds if we have sightings
    if (sightings.length > 0 && sightings.some(s => s.latitude && s.longitude)) {
      const bounds = new mapboxgl.LngLatBounds();
      sightings.forEach(s => {
        if (s.latitude && s.longitude) {
          bounds.extend([Number(s.longitude), Number(s.latitude)]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
    }
  }, [sightings, map.current]);

  const toggleMapStyle = () => {
    setMapStyle(prev => 
      prev === 'mapbox://styles/mapbox/dark-v11' 
        ? 'mapbox://styles/mapbox/satellite-streets-v12' 
        : 'mapbox://styles/mapbox/dark-v11'
    );
  };

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getSightings();
    setSightings(data as Sighting[]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 pt-12 pb-4 safe-top pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="px-4 py-2 rounded-xl bg-background/80 backdrop-blur-sm">
            <h1 className="text-lg font-bold">Hive Map</h1>
            <p className="text-xs text-muted-foreground">{sightings.length} sightings</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl bg-background/80 backdrop-blur-sm"
              onClick={toggleMapStyle}
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl bg-background/80 backdrop-blur-sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Legend */}
      <div className="absolute bottom-24 left-6 z-10 p-3 rounded-xl bg-background/90 backdrop-blur-sm border border-border">
        <p className="text-xs font-semibold mb-2">Colony Status</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Calm</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Agitated</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Shimmering</span>
          </div>
        </div>
      </div>

      {/* Selected Sighting Card */}
      {selectedSighting && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-24 left-6 right-6 z-20"
        >
          <Card className="p-4 bg-background/95 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedSighting.behavior === 'shimmering' ? 'bg-red-500' :
                  selectedSighting.behavior === 'agitated' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}>
                  <Hexagon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold capitalize">
                    {selectedSighting.species?.replace('_', ' ') || 'Unknown'}
                  </h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedSighting.behavior} • {selectedSighting.confidence_score}% confident
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSighting(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedSighting.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img src={selectedSighting.image_url} alt="Sighting" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              <span>{Number(selectedSighting.latitude).toFixed(4)}, {Number(selectedSighting.longitude).toFixed(4)}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
                onClick={() => {
                  map.current?.flyTo({
                    center: [Number(selectedSighting.longitude), Number(selectedSighting.latitude)],
                    zoom: 15,
                  });
                }}
              >
                <MapPin className="w-4 h-4 mr-1" /> Zoom In
              </Button>
              {selectedSighting.analysis_result?.safetyLevel === 'danger' && (
                <Button size="sm" className="flex-1 rounded-xl gradient-danger text-white">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Report Issue
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && sightings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Card className="p-6 text-center bg-background/90 backdrop-blur-sm pointer-events-auto">
            <Hexagon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No Sightings Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Be the first to report a hive!</p>
            <Button onClick={() => navigate('/detect')} className="gradient-honey text-primary-foreground rounded-xl">
              Scan Hive
            </Button>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MapPage;
