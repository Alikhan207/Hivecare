import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/hivecare/BottomNav';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      <header className="px-6 pt-12 pb-8 safe-top text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-xl font-bold">{user.email}</h1>
        <p className="text-sm text-muted-foreground">Citizen Scientist</p>
      </header>
      <div className="px-6 space-y-4">
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
          <Hexagon className="w-8 h-8 text-primary" />
          <div>
            <p className="font-semibold">0 Sightings</p>
            <p className="text-sm text-muted-foreground">Start scanning hives!</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl">
          <LogOut className="w-5 h-5 mr-2" /> Sign Out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
