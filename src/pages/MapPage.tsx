import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import BottomNav from '@/components/hivecare/BottomNav';

const MapPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      <header className="px-6 pt-12 pb-4 safe-top">
        <h1 className="text-2xl font-bold">Hive Map</h1>
        <p className="text-sm text-muted-foreground">Nearby sightings & migration data</p>
      </header>
      <div className="px-6 flex flex-col items-center justify-center h-64 text-center">
        <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Map feature coming soon. Sightings will appear here.</p>
      </div>
      <BottomNav />
    </div>
  );
};

export default MapPage;
