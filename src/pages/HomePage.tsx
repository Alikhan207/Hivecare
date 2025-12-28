import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
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

// Floating Honeycomb Component
const FloatingHoneycomb = ({ className, delay = 0, size = 60 }: { className?: string; delay?: number; size?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 1 }}
    className={className}
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon
        points="50,2 93,25 93,75 50,98 7,75 7,25"
        fill="none"
        stroke="hsl(40 96% 53%)"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <polygon
        points="50,15 80,32 80,68 50,85 20,68 20,32"
        fill="hsl(40 96% 53%)"
        opacity="0.08"
      />
    </svg>
  </motion.div>
);

// Honey Drop Particle Component
const HoneyDrop = ({ delay = 0, left, duration = 8 }: { delay?: number; left: string; duration?: number }) => (
  <motion.div
    className="absolute bottom-0 w-2 h-3 rounded-full"
    style={{ 
      left,
      background: 'linear-gradient(180deg, hsl(40 96% 53%) 0%, hsl(35 95% 40%) 100%)',
      boxShadow: '0 0 8px hsl(40 96% 53% / 0.5)'
    }}
    initial={{ y: 0, opacity: 0, scale: 0.5 }}
    animate={{ 
      y: [0, -1200],
      opacity: [0, 0.8, 0.8, 0],
      scale: [0.5, 1, 1, 0.3]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
  />
);

// Animated Bee Component with Bezier Path
const FlyingBee = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        offsetPath: "path('M -50 300 Q 150 100 300 250 T 500 150 T 700 300 T 900 200')",
        offsetRotate: "0deg",
        width: 32,
        height: 32
      }}
      animate={{ 
        offsetDistance: ["0%", "100%"]
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "linear" as const
      }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full bee-fly">
        {/* Bee body */}
        <ellipse cx="32" cy="32" rx="14" ry="10" fill="hsl(40 96% 53%)" />
        {/* Stripes */}
        <rect x="26" y="26" width="4" height="12" rx="1" fill="hsl(20 14% 10%)" />
        <rect x="34" y="26" width="4" height="12" rx="1" fill="hsl(20 14% 10%)" />
        {/* Wings */}
        <ellipse cx="24" cy="24" rx="8" ry="5" fill="hsl(40 30% 96% / 0.6)" className="animate-pulse" />
        <ellipse cx="40" cy="24" rx="8" ry="5" fill="hsl(40 30% 96% / 0.6)" className="animate-pulse" />
        {/* Head */}
        <circle cx="46" cy="32" r="6" fill="hsl(20 14% 10%)" />
        {/* Eyes */}
        <circle cx="48" cy="30" r="1.5" fill="hsl(40 30% 96%)" />
        <circle cx="48" cy="34" r="1.5" fill="hsl(40 30% 96%)" />
      </svg>
    </motion.div>
  );
};

// Section Reveal Animation Wrapper
const RevealSection = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.8]);

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
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Honey Drop Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
          <HoneyDrop left="5%" delay={0} duration={10} />
          <HoneyDrop left="15%" delay={2} duration={12} />
          <HoneyDrop left="25%" delay={4} duration={9} />
          <HoneyDrop left="40%" delay={1} duration={11} />
          <HoneyDrop left="55%" delay={3} duration={10} />
          <HoneyDrop left="70%" delay={5} duration={13} />
          <HoneyDrop left="85%" delay={2.5} duration={11} />
          <HoneyDrop left="95%" delay={4.5} duration={9} />
        </div>

        {/* Flying Bee Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]">
          <FlyingBee delay={0} />
          <FlyingBee delay={6} />
        </div>

        {/* Floating Honeycomb Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
          <FloatingHoneycomb className="absolute top-[10%] left-[5%] honeycomb-float" delay={0} size={80} />
          <FloatingHoneycomb className="absolute top-[20%] right-[10%] honeycomb-float-reverse" delay={0.3} size={60} />
          <FloatingHoneycomb className="absolute top-[35%] left-[15%] honeycomb-drift" delay={0.6} size={50} />
          <FloatingHoneycomb className="absolute top-[50%] right-[5%] honeycomb-float" delay={0.9} size={70} />
          <FloatingHoneycomb className="absolute top-[15%] left-[40%] honeycomb-float-reverse" delay={1.2} size={45} />
          <FloatingHoneycomb className="absolute top-[60%] left-[8%] honeycomb-drift" delay={1.5} size={55} />
          <FloatingHoneycomb className="absolute top-[40%] right-[20%] honeycomb-float" delay={0.4} size={65} />
          <FloatingHoneycomb className="absolute top-[70%] right-[15%] honeycomb-float-reverse" delay={0.7} size={40} />
        </div>

        {/* Video Background with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: videoY }}
        >
          <video
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-[120%] object-cover"
            poster={heroImage}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
          <motion.div 
            className="absolute inset-0 bg-background"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>

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

        {/* Hero Content with Parallax */}
        <motion.div 
          className="relative z-10 h-full flex flex-col justify-end pb-32 px-6"
          style={{ y: contentY }}
        >
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
        </motion.div>

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
      <RevealSection className="px-6 py-16 bg-background">
        <section id="roles">
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
      </RevealSection>

      {/* Stats Section */}
      <RevealSection className="px-6 py-12 bg-card/50" delay={0.1}>
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { value: '80%', label: 'Wild Honey Production', icon: Hexagon, gradient: 'from-amber-500 to-orange-600' },
            { value: '1M+', label: 'Colonies in India', icon: MapPin, gradient: 'from-emerald-500 to-green-600' },
            { value: '0', label: 'Species Identified', icon: Camera, gradient: 'from-blue-500 to-indigo-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative p-4 rounded-2xl bg-background border border-border text-center overflow-hidden group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* Conservation Message */}
      <RevealSection className="px-6 py-12" delay={0.15}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-6 rounded-3xl overflow-hidden group"
        >
          {/* Animated glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-amber-500/30 to-primary/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
          
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <img src={heroImage} alt="Rock bee colony" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
            </div>
            
            <div className="relative p-2 flex items-start gap-4">
              <motion.div 
                className="w-14 h-14 rounded-2xl gradient-nature flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Leaf className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-primary drop-shadow-sm">Why Rock Bees Matter</h4>
                <p className="text-sm text-foreground leading-relaxed">
                  Apis dorsata (Rock Bee) is responsible for 80% of India's wild honey production and plays a crucial role in pollinating wild plants, forest ecosystems, and agricultural crops. Unlike domesticated bees, they cannot be kept in boxes - they are wild, migratory, and essential for biodiversity.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </RevealSection>

      {/* Quick Actions */}
      <RevealSection className="px-6 py-8 pb-24" delay={0.2}>
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
      </RevealSection>

      <BottomNav />
    </div>
  );
};

export default HomePage;
