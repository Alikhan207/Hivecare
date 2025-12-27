import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MapPin, Shield, ChevronRight, Hexagon, User, 
  Leaf, BarChart3, Play, Pause, Volume2, VolumeX,
  ArrowRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import BottomNav from '@/components/hivecare/BottomNav';
import heroVideo from '@/assets/hero-video.mp4';
import heroImage from '@/assets/hero-bee-colony.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Show content after video loads
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const userRoles = [
    {
      id: 'citizen',
      icon: Shield,
      title: 'Urban Citizen',
      subtitle: 'Safety & Relocation',
      description: 'Identify hives, get safety alerts, request ethical relocation',
      action: () => navigate('/detect'),
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'harvester',
      icon: Leaf,
      title: 'Tribal Harvester',
      subtitle: 'Sustainable Livelihoods',
      description: 'Harvest calendar, certification, market linkage',
      action: () => navigate('/harvester'),
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      id: 'official',
      icon: BarChart3,
      title: 'Official / Researcher',
      subtitle: 'Data & Analytics',
      description: 'Migration heatmaps, colony health, anomaly alerts',
      action: () => navigate('/dashboard'),
      gradient: 'from-blue-500 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Video */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
            poster={heroImage}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>

        {/* Video Controls */}
        <div className="absolute top-6 right-6 flex gap-2 z-20 safe-top">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 pt-12 safe-top">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Hexagon className="w-12 h-12 text-primary fill-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">HC</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">HiveCare</h1>
                <p className="text-xs text-white/70">AI Guardian for Rock Bees</p>
              </div>
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/20 backdrop-blur-sm"
              onClick={() => navigate(user ? '/profile' : '/auth')}
            >
              <User className="w-5 h-5 text-white" />
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-32 px-6">
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Conservation</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Protecting India's
                  <br />
                  <span className="text-primary">Wild Pollinators</span>
                </h2>
                
                <p className="text-lg text-white/80 mb-8 max-w-md">
                  The first digital ranger for Apis dorsata. Identify, protect, and coexist with Rock Bees using advanced AI.
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate('/detect')}
                    className="h-14 px-8 gradient-honey text-primary-foreground font-semibold text-lg rounded-2xl shadow-lg shadow-primary/30"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Scan Hive
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById('roles');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="h-14 px-6 rounded-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="px-6 py-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Choose Your Role
          </h3>
          <h2 className="text-3xl font-bold mb-4">
            One Platform, Three Purposes
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            HiveCare serves urban citizens, tribal harvesters, and researchers with tailored tools for each stakeholder.
          </p>
        </motion.div>

        <div className="space-y-4 max-w-lg mx-auto">
          {userRoles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              onClick={role.action}
              className="w-full group"
            >
              <div className="relative p-5 rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-all duration-300">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg`}>
                    <role.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{role.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {role.subtitle}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-12 bg-card/50">
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { value: '80%', label: 'Wild Honey Production', icon: Hexagon },
            { value: '1M+', label: 'Colonies in India', icon: MapPin },
            { value: '0', label: 'Species Identified', icon: Camera },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-2xl bg-background border border-border text-center"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Conservation Message */}
      <section className="px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-6 rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <img src={heroImage} alt="Rock bee colony" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
          </div>
          
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-nature flex items-center justify-center flex-shrink-0">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Why Rock Bees Matter</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Apis dorsata (Rock Bee) is responsible for 80% of India's wild honey production and plays a crucial role in pollinating wild plants, forest ecosystems, and agricultural crops. Unlike domesticated bees, they cannot be kept in boxes - they are wild, migratory, and essential for biodiversity.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 py-8 pb-24">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          <Button
            onClick={() => navigate('/detect')}
            className="h-16 rounded-2xl gradient-honey text-primary-foreground flex-col gap-1"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">Scan Hive</span>
          </Button>
          <Button
            onClick={() => navigate('/map')}
            variant="outline"
            className="h-16 rounded-2xl flex-col gap-1"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">View Map</span>
          </Button>
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default HomePage;
