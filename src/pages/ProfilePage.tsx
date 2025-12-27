import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, LogOut, Hexagon, Clock, CheckCircle, XCircle, 
  Phone, MapPin, ChevronRight, AlertTriangle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getRelocationRequests } from '@/lib/sightings';
import BottomNav from '@/components/hivecare/BottomNav';

interface RelocationRequest {
  id: string;
  status: string;
  urgency: string;
  created_at: string;
  contact_phone: string;
  additional_notes: string;
  bee_sightings: {
    species: string;
    behavior: string;
    latitude: number;
    longitude: number;
    image_url?: string;
  };
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<RelocationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests'>('overview');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchRequests(session.user.id);
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setProfile(data);
  };

  const fetchRequests = async (userId: string) => {
    const data = await getRelocationRequests(userId);
    setRequests(data as RelocationRequest[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const statusIcons = {
    pending: Clock,
    accepted: CheckCircle,
    completed: CheckCircle,
    rejected: XCircle,
  };

  const statusColors = {
    pending: 'text-yellow-500 bg-yellow-500/10',
    accepted: 'text-blue-500 bg-blue-500/10',
    completed: 'text-green-500 bg-green-500/10',
    rejected: 'text-red-500 bg-red-500/10',
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-honey opacity-90" />
        <div className="relative px-6 pt-12 pb-8 safe-top text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">{profile?.full_name || user.email}</h1>
          <p className="text-sm text-white/80 capitalize">{profile?.user_type || 'Citizen'} Scientist</p>
          
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile?.sightings_count || 0}</div>
              <div className="text-xs text-white/70">Sightings</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{requests.length}</div>
              <div className="text-xs text-white/70">Requests</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{(profile?.badges || []).length}</div>
              <div className="text-xs text-white/70">Badges</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-6 py-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-card border border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'requests' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Requests ({requests.length})
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-honey flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Citizen Scientist</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.sightings_count || 0} hives reported
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => navigate('/detect')} className="h-12 rounded-xl">
                  <Hexagon className="w-4 h-4 mr-2" /> Scan Hive
                </Button>
                <Button variant="outline" onClick={() => navigate('/map')} className="h-12 rounded-xl">
                  <MapPin className="w-4 h-4 mr-2" /> View Map
                </Button>
              </div>
            </Card>

            <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl">
              <LogOut className="w-5 h-5 mr-2" /> Sign Out
            </Button>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {requests.length === 0 ? (
              <Card className="p-6 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No Relocation Requests</h3>
                <p className="text-sm text-muted-foreground">
                  When you request a hive relocation, it will appear here.
                </p>
              </Card>
            ) : (
              requests.map((request, index) => {
                const StatusIcon = statusIcons[request.status as keyof typeof statusIcons] || Clock;
                const statusColor = statusColors[request.status as keyof typeof statusColors] || statusColors.pending;
                const sighting = request.bee_sightings;

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {sighting?.image_url ? (
                          <img
                            src={sighting.image_url}
                            alt="Hive"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                            <Hexagon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold capitalize">
                              {sighting?.species?.replace('_', ' ') || 'Unknown Species'}
                            </h4>
                            {request.urgency === 'urgent' && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize mb-2">
                            {sighting?.behavior || 'Unknown'} behavior
                          </p>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{request.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                        {request.contact_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{request.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
