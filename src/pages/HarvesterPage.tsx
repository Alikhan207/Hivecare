import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, Calendar, Video, QrCode, TrendingUp, AlertCircle,
  ChevronRight, ArrowLeft, Sun, Cloud, Droplets, ThermometerSun,
  Check, X, Clock, MapPin, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/hivecare/BottomNav';

type HarvestStatus = 'optimal' | 'caution' | 'restricted';

interface HarvestDay {
  date: string;
  day: string;
  status: HarvestStatus;
  reason: string;
}

const HarvesterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calendar' | 'log' | 'certify' | 'market'>('calendar');

  // Mock harvest calendar data
  const harvestCalendar: HarvestDay[] = [
    { date: '27', day: 'Fri', status: 'optimal', reason: 'Honey flow active, clear weather' },
    { date: '28', day: 'Sat', status: 'optimal', reason: 'Peak honey production window' },
    { date: '29', day: 'Sun', status: 'caution', reason: 'Light rain expected' },
    { date: '30', day: 'Mon', status: 'restricted', reason: 'Brood season - do not harvest' },
    { date: '31', day: 'Tue', status: 'restricted', reason: 'Brood season - do not harvest' },
  ];

  const weatherData = {
    temp: '28°C',
    humidity: '65%',
    conditions: 'Partly Cloudy',
    bloomStatus: 'Active',
  };

  const marketPrices = [
    { grade: 'Certified Sustainable', price: '₹850/kg', trend: '+12%' },
    { grade: 'Standard Wild', price: '₹450/kg', trend: '+5%' },
    { grade: 'TRIFED Rate', price: '₹725/kg', trend: '0%' },
  ];

  const statusColors = {
    optimal: 'bg-green-500',
    caution: 'bg-yellow-500',
    restricted: 'bg-red-500',
  };

  const statusBg = {
    optimal: 'bg-green-500/10 border-green-500/30',
    caution: 'bg-yellow-500/10 border-yellow-500/30',
    restricted: 'bg-red-500/10 border-red-500/30',
  };

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'log', label: 'Log Harvest', icon: Video },
    { id: 'certify', label: 'Certify', icon: QrCode },
    { id: 'market', label: 'Market', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-nature opacity-90" />
        <div className="absolute inset-0 honeycomb-pattern opacity-20" />
        
        <div className="relative px-6 pt-12 pb-6 safe-top">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Guardian Dashboard</h1>
              <p className="text-sm text-white/70">Tribal Harvester Mode</p>
            </div>
          </div>
          
          {/* Weather Card */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-white" />
                <span className="text-sm text-white/80">{weatherData.conditions}</span>
              </div>
              <span className="text-xl font-bold text-white">{weatherData.temp}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-white/70">
                <Droplets className="w-4 h-4" />
                <span>{weatherData.humidity}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70">
                <Sun className="w-4 h-4 text-yellow-300" />
                <span>Bloom: {weatherData.bloomStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-6 py-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-card border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Harvest Window</h3>
              <span className="text-sm text-muted-foreground">December 2025</span>
            </div>

            {/* Status Legend */}
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Optimal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Caution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Restricted</span>
              </div>
            </div>

            {/* Calendar Days */}
            <div className="space-y-2">
              {harvestCalendar.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-2xl border ${statusBg[day.status]}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <div className="text-2xl font-bold">{day.date}</div>
                      <div className="text-xs text-muted-foreground">{day.day}</div>
                    </div>
                    <div className={`w-1 h-12 rounded-full ${statusColors[day.status]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {day.status === 'optimal' && <Check className="w-4 h-4 text-green-500" />}
                        {day.status === 'caution' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        {day.status === 'restricted' && <X className="w-4 h-4 text-red-500" />}
                        <span className="font-medium capitalize">{day.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{day.reason}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <ThermometerSun className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">AI Advisory</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on weather patterns and bloom data, the optimal harvest window is Dec 27-28. 
                    Avoid harvesting Dec 30-31 due to brood development phase.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Log Harvest Tab */}
        {activeTab === 'log' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Log Your Harvest</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Record a video of your sustainable harvesting method to earn certification and premium pricing.
              </p>
              <Button className="w-full h-14 gradient-nature text-white rounded-2xl font-semibold">
                <Video className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Verification Checklist</h4>
              <div className="space-y-3">
                {[
                  { label: 'No fire/smoke used', checked: false },
                  { label: 'Only honey crown cut', checked: false },
                  { label: 'Brood comb left intact', checked: false },
                  { label: 'GPS location captured', checked: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.checked ? 'bg-green-500 border-green-500' : 'border-border'
                    }`}>
                      {item.checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={item.checked ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Offline Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    No signal? Your harvest log is saved locally and will sync when you return to network coverage.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Certify Tab */}
        {activeTab === 'certify' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6 text-center">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <QrCode className="w-16 h-16 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sustainable Harvest Certificate</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete a verified harvest to generate your certification QR code.
              </p>
              <div className="p-3 rounded-xl bg-muted text-sm text-muted-foreground">
                No verified harvests yet. Start logging to earn your first certificate.
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Certification Benefits</h4>
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, label: 'Premium pricing (up to 2x market rate)' },
                  { icon: Award, label: 'TRIFED and FPO linkage' },
                  { icon: MapPin, label: 'Origin traceability for buyers' },
                  { icon: Leaf, label: 'Conservation impact verification' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Current Market Prices</h3>
              <span className="text-xs text-muted-foreground">Updated today</span>
            </div>

            {marketPrices.map((price, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{price.grade}</h4>
                    <p className="text-2xl font-bold text-primary">{price.price}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    price.trend.startsWith('+') 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {price.trend}
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-4 gradient-nature text-white">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Connect to TRIFED</h4>
                  <p className="text-sm text-white/80 mb-3">
                    Link your certified harvests directly to TRIFED for guaranteed minimum support price.
                  </p>
                  <Button variant="secondary" size="sm" className="rounded-xl">
                    Learn More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HarvesterPage;
