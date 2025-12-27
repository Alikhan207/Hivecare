import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Check, MapPin, Phone, ArrowLeft, Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/hivecare/BottomNav';

const ResultsPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedImage = sessionStorage.getItem('imageData');
    if (storedResult) setResult(JSON.parse(storedResult));
    if (storedImage) setImageData(storedImage);
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>No analysis data. Please scan a hive first.</p>
      </div>
    );
  }

  const safetyColors = {
    safe: 'safety-safe',
    caution: 'safety-caution',
    danger: 'safety-danger',
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      <header className="px-6 pt-12 pb-4 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate('/detect')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      <div className="px-6 space-y-6">
        {imageData && (
          <div className="aspect-video rounded-2xl overflow-hidden">
            <img src={imageData} alt="Analyzed hive" className="w-full h-full object-cover" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl ${safetyColors[result.safetyLevel as keyof typeof safetyColors] || 'bg-card'}`}
        >
          <div className="flex items-center gap-3 text-white">
            {result.safetyLevel === 'danger' ? <AlertTriangle /> : result.safetyLevel === 'caution' ? <Shield /> : <Check />}
            <div>
              <p className="font-bold capitalize">{result.safetyLevel} Zone</p>
              <p className="text-sm opacity-90">{result.safetyMessage}</p>
            </div>
          </div>
        </motion.div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Hexagon className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-bold">{result.speciesName}</h3>
              <p className="text-sm text-muted-foreground">{result.confidence}% confidence</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2"><strong>Behavior:</strong> {result.behaviorDescription}</p>
          <p className="text-sm text-muted-foreground"><strong>Why:</strong> {result.explainability}</p>
        </div>

        <div className="p-4 rounded-2xl bg-nature/10 border border-nature/20">
          <p className="text-sm text-muted-foreground">{result.conservationNote}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate('/map')} variant="outline" className="h-14 rounded-2xl">
            <MapPin className="w-5 h-5 mr-2" /> View Map
          </Button>
          <Button className="h-14 gradient-honey text-primary-foreground rounded-2xl">
            <Phone className="w-5 h-5 mr-2" /> Request Relocator
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ResultsPage;
