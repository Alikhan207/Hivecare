import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, AlertTriangle, Check, MapPin, Phone, ArrowLeft, 
  Hexagon, Loader2, Save, ChevronLeft, ChevronRight, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadSightingImage, saveSighting, createRelocationRequest } from '@/lib/sightings';
import BottomNav from '@/components/hivecare/BottomNav';
import ConfidenceBreakdown from '@/components/hivecare/ConfidenceBreakdown';

interface CaptureData {
  hiveOverview: string | null;
  beeCloseup: string | null;
  wideAngle: string | null;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<any>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [allCaptures, setAllCaptures] = useState<CaptureData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSightingId, setSavedSightingId] = useState<string | null>(null);
  const [showRelocationForm, setShowRelocationForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedImage = sessionStorage.getItem('imageData');
    const storedCaptures = sessionStorage.getItem('allCaptures');
    const storedLocation = sessionStorage.getItem('location');
    
    if (storedResult) setResult(JSON.parse(storedResult));
    if (storedImage) setImageData(storedImage);
    if (storedCaptures) setAllCaptures(JSON.parse(storedCaptures));
    if (storedLocation) setLocation(JSON.parse(storedLocation));

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) setEmail(session.user.email);
    });
  }, []);

  const capturedImages = allCaptures 
    ? [
        { label: 'Hive Overview', src: allCaptures.hiveOverview },
        { label: 'Bee Close-up', src: allCaptures.beeCloseup },
        { label: 'Location Context', src: allCaptures.wideAngle },
      ].filter(img => img.src)
    : imageData 
      ? [{ label: 'Captured Image', src: imageData }]
      : [];

  const handleSaveSighting = async () => {
    if (!result || !location) {
      toast({ title: 'Error', description: 'Missing data to save sighting', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = null;
      if (imageData && user) {
        imageUrl = await uploadSightingImage(imageData, user.id);
      }

      const sighting = await saveSighting({
        species: result.species,
        confidence_score: result.confidence,
        behavior: result.behavior,
        latitude: location.lat,
        longitude: location.lng,
        image_url: imageUrl || undefined,
        analysis_result: result,
        proximity_warning: result.proximityWarning,
      }, user?.id);

      if (sighting) {
        setSavedSightingId(sighting.id);
        toast({ title: 'Sighting Saved!', description: 'Your observation has been recorded.' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save sighting', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestRelocation = async () => {
    if (!savedSightingId || !user) {
      toast({ title: 'Error', description: 'Please save the sighting and sign in first', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const request = await createRelocationRequest(
        savedSightingId,
        user.id,
        phone,
        email,
        notes,
        result?.safetyLevel === 'danger' ? 'urgent' : 'normal'
      );

      if (request) {
        toast({ title: 'Request Submitted!', description: 'An Urban Guardian will contact you soon.' });
        setShowRelocationForm(false);
        navigate('/profile');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <Hexagon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No analysis data found.</p>
          <Button onClick={() => navigate('/detect')}>Scan a Hive</Button>
        </div>
      </div>
    );
  }

  const isRockBee = result.species === 'apis_dorsata' || result.isRockBee === true;
  const safetyColors = {
    safe: 'safety-safe',
    caution: 'safety-caution',
    danger: 'safety-danger',
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 safe-bottom">
      <header className="px-6 pt-12 pb-4 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate('/detect')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      <div className="px-6 space-y-5">
        {/* Image Gallery */}
        {capturedImages.length > 0 && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-card">
            <img 
              src={capturedImages[currentImageIndex].src!} 
              alt={capturedImages[currentImageIndex].label} 
              className="w-full h-full object-cover" 
            />
            
            {/* Image label */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
              <span className="text-xs font-medium text-foreground">
                {capturedImages[currentImageIndex].label}
              </span>
            </div>

            {/* Navigation arrows */}
            {capturedImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : capturedImages.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => (prev < capturedImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {capturedImages.length > 1 && (
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {capturedImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentImageIndex ? 'bg-primary' : 'bg-foreground/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {savedSightingId && (
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-nature text-white text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </div>
            )}
          </div>
        )}

        {/* Safety Level Banner */}
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

        {/* Confidence Breakdown */}
        <ConfidenceBreakdown
          overallConfidence={result.confidence}
          breakdown={result.confidenceBreakdown}
          explainabilityDetails={result.explainabilityDetails}
          isRockBee={isRockBee}
        />

        {/* Species Info Card */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Hexagon className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-bold text-foreground">{result.speciesName}</h3>
              <p className="text-sm text-muted-foreground">
                {result.identifiedObject && !isRockBee ? result.identifiedObject : result.species}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            <strong className="text-foreground">Behavior:</strong> {result.behaviorDescription}
          </p>
          {result.recommendedDistance && (
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Safe Distance:</strong> {result.recommendedDistance}
            </p>
          )}
        </div>

        {/* Location Info */}
        {location && (
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-nature" />
              <div>
                <p className="text-sm font-medium text-foreground">Location Captured</p>
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://maps.google.com/?q=${location.lat},${location.lng}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Conservation Note */}
        <div className="p-4 rounded-2xl bg-nature/10 border border-nature/20">
          <p className="text-sm text-foreground">{result.conservationNote}</p>
        </div>

        {/* Action Buttons */}
        {!savedSightingId ? (
          <Button
            onClick={handleSaveSighting}
            disabled={isSaving}
            className="w-full h-14 gradient-honey text-primary-foreground rounded-2xl font-semibold"
          >
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {isSaving ? 'Saving...' : 'Save Sighting'}
          </Button>
        ) : !showRelocationForm ? (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => navigate('/map')} variant="outline" className="h-14 rounded-2xl">
              <MapPin className="w-5 h-5 mr-2" /> View Map
            </Button>
            <Button onClick={() => setShowRelocationForm(true)} className="h-14 gradient-honey text-primary-foreground rounded-2xl">
              <Phone className="w-5 h-5 mr-2" /> Request Relocator
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-2xl bg-card border border-border space-y-4"
          >
            <h3 className="font-semibold text-foreground">Request Ethical Relocation</h3>
            <p className="text-sm text-muted-foreground">An Urban Guardian will contact you to safely relocate the colony.</p>
            
            <Input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl"
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
            <Textarea
              placeholder="Additional notes (access instructions, urgency, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl"
            />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRelocationForm(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleRequestRelocation}
                disabled={isSubmitting || !phone}
                className="flex-1 gradient-nature text-white rounded-xl"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ResultsPage;
