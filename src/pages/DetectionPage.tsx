import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Loader2, AlertTriangle, MapPin, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/hivecare/BottomNav';

interface AnalysisResult {
  species: string;
  speciesName: string;
  confidence: number;
  behavior: string;
  behaviorDescription: string;
  safetyLevel: string;
  safetyMessage: string;
  proximityWarning: boolean;
  recommendedDistance: string;
  conservationNote: string;
  explainability: string;
}

const DetectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please try uploading an image instead.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setMode('select');
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImageData(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
        setMode('select');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageData) return;
    
    setIsAnalyzing(true);
    
    try {
      // Extract base64 data from data URL
      const base64Data = imageData.split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('analyze-bee', {
        body: { imageBase64: base64Data }
      });
      
      if (error) throw error;
      
      // Store result and navigate
      sessionStorage.setItem('analysisResult', JSON.stringify(data));
      sessionStorage.setItem('imageData', imageData);
      sessionStorage.setItem('location', JSON.stringify(location));
      
      navigate('/results');
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCapture = () => {
    setImageData(null);
    setMode('select');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 safe-bottom">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scan Hive</h1>
            <p className="text-sm text-muted-foreground">
              {location ? 'Location detected' : 'Getting location...'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/')}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      <div className="px-6">
        <AnimatePresence mode="wait">
          {/* Selection Mode */}
          {mode === 'select' && !imageData && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="aspect-square rounded-3xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center px-8">
                  <h3 className="font-semibold mb-1">Capture or Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Take a photo of the hive or upload an existing image for AI analysis
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={startCamera}
                  className="h-14 gradient-honey text-primary-foreground rounded-2xl font-semibold"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Camera
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-14 rounded-2xl font-semibold"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Safety Tips */}
              <div className="p-4 rounded-2xl bg-caution/10 border border-caution/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-caution flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-caution-dark mb-1">Safety First</h4>
                    <p className="text-sm text-muted-foreground">
                      Maintain at least 6 meters distance from the hive. Do not use flash photography.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Camera Mode */}
          {mode === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Camera overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-primary rounded-full">
                    <div className="absolute inset-2 border border-primary/50 rounded-full" />
                  </div>
                </div>
                
                {/* Location indicator */}
                {location && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-nature-light" />
                    <span className="text-xs text-white">GPS Active</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 h-14 gradient-honey text-primary-foreground rounded-2xl font-semibold"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Image Preview Mode */}
          {imageData && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-card">
                <img
                  src={imageData}
                  alt="Captured hive"
                  className="w-full h-full object-cover"
                />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">Analyzing Image</p>
                      <p className="text-sm text-white/70">Identifying species and behavior...</p>
                    </div>
                  </div>
                )}
                
                {location && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-nature-light" />
                    <span className="text-xs text-white">Location Captured</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={resetCapture}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl"
                  disabled={isAnalyzing}
                >
                  Retake
                </Button>
                <Button
                  onClick={analyzeImage}
                  className="flex-1 h-14 gradient-honey text-primary-foreground rounded-2xl font-semibold"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Hive'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default DetectionPage;
