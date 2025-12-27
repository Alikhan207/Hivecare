import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, MapPin, Shield, ChevronRight, Hexagon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import BottomNav from '@/components/hivecare/BottomNav';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const features = [
    {
      icon: Camera,
      title: 'AI Detection',
      description: 'Identify bee species instantly with advanced AI',
      action: () => navigate('/detect'),
      gradient: 'gradient-honey',
    },
    {
      icon: Shield,
      title: 'Safety Check',
      description: 'Assess colony behavior and get safety alerts',
      action: () => navigate('/detect'),
      gradient: 'gradient-nature',
    },
    {
      icon: MapPin,
      title: 'Hive Map',
      description: 'View nearby sightings and migration patterns',
      action: () => navigate('/map'),
      gradient: 'gradient-safe',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 honeycomb-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative px-6 pt-12 pb-8 safe-top">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Hexagon className="w-10 h-10 text-primary fill-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">HC</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">HiveCare</h1>
                <p className="text-xs text-muted-foreground">Guardian of Wild Bees</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(user ? '/profile' : '/auth')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Hexagon className="w-4 h-4 hexagon-pulse" />
              Protecting India's Pollinators
            </div>
            
            <h2 className="text-3xl font-bold mb-3 leading-tight">
              Spot a Hive?
              <br />
              <span className="text-primary">Don't Panic.</span>
            </h2>
            
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Use AI to identify Rock Bees safely and connect with ethical relocators instead of exterminators.
            </p>
          </motion.div>
          
          {/* Quick Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              onClick={() => navigate('/detect')}
              className="w-full h-14 gradient-honey text-primary-foreground font-semibold text-lg rounded-2xl shadow-lg shadow-primary/20"
            >
              <Camera className="w-5 h-5 mr-2" />
              Scan Hive Now
            </Button>
          </motion.div>
        </div>
      </header>
      
      {/* Features */}
      <section className="px-6 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          What You Can Do
        </h3>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.button
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              onClick={feature.action}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '80%', label: 'Wild Honey' },
            { value: '0', label: 'Colonies Saved' },
            { value: '0', label: 'Sightings' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              className="p-4 rounded-xl bg-card border border-border text-center"
            >
              <div className="text-xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Conservation Message */}
      <section className="px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="p-4 rounded-2xl bg-nature/10 border border-nature/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full gradient-nature flex items-center justify-center flex-shrink-0">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-nature-light mb-1">Did You Know?</h4>
              <p className="text-sm text-muted-foreground">
                Apis dorsata (Rock Bee) produces 80% of India's wild honey and is crucial for pollinating wild plants and crops.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      
      <BottomNav />
    </div>
  );
};

export default HomePage;
