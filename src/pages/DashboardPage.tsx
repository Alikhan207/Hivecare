import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, MapPin, AlertTriangle, TrendingUp, ArrowLeft,
  Activity, Hexagon, Users, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BottomNav from '@/components/hivecare/BottomNav';

const DashboardPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Colonies', value: '12,450', change: '+8%', icon: Hexagon },
    { label: 'Sightings Today', value: '342', change: '+15%', icon: MapPin },
    { label: 'Relocations', value: '89', change: '+3%', icon: Users },
    { label: 'Alerts', value: '7', change: '-2', icon: AlertTriangle },
  ];

  const anomalies = [
    { region: 'Bengaluru Urban', issue: 'Low shimmering activity detected', severity: 'warning' },
    { region: 'Nilgiris District', issue: 'Unusual migration pattern', severity: 'info' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="relative px-6 pt-12 pb-6 safe-top">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Research Dashboard</h1>
              <p className="text-sm text-white/70">Official / Researcher Mode</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'}`}>{stat.change}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Heatmap Placeholder */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Migration Heatmap</h3>
            <Button variant="ghost" size="sm">View Full</Button>
          </div>
          <div className="h-48 rounded-xl bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-red-500/20 flex items-center justify-center border border-border">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Interactive map coming soon</p>
            </div>
          </div>
        </Card>

        {/* Anomaly Alerts */}
        <div>
          <h3 className="font-semibold mb-3">Anomaly Alerts</h3>
          <div className="space-y-2">
            {anomalies.map((a, i) => (
              <Card key={i} className={`p-4 ${a.severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 ${a.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
                  <div>
                    <h4 className="font-medium text-sm">{a.region}</h4>
                    <p className="text-sm text-muted-foreground">{a.issue}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DashboardPage;
