import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, X, Loader2, AlertTriangle, MapPin, Upload, Image, 
  ChevronRight, Check, RotateCcw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/hivecare/BottomNav';

interface CaptureData {
  hiveOverview: string | null;
  beeCloseup: string | null;
  wideAngle: string | null;
}

const STEPS = [
  {
    key: 'hiveOverview' as const,
    title: 'Hive Overview',
    description: 'Capture the entire hive/colony from a safe distance (6+ meters). This helps identify nesting pattern.',
    icon: '🏠',
    tip: 'Stand back and capture the full nest structure',
  },
  {
    key: 'beeCloseup' as const,
    title: 'Bee Close-up',
    description: 'Capture individual bees to identify species. Zoom in or get closer safely.',
    icon: '🐝',
    tip: 'Focus on bee size and color pattern',
  },
  {
    key: 'wideAngle' as const,
    title: 'Location Context',
    description: 'Capture surroundings showing the height/altitude of the hive. Rock Bees nest at high elevations.',
    icon: '📍',
    tip: 'Show building floors or tree height for scale',
  },
];

const DetectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [captures, setCaptures] = useState<CaptureData>({
    hiveOverview: null,
    beeCloseup: null,
    wideAngle: null,
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

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
        },
        { enableHighAccuracy: true }
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
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Camera error:', error);
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
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        if (dataUrl && dataUrl.length > 100) {
          handleCapture(dataUrl);
          stopCamera();
        } else {
          toast({
            title: 'Capture Failed',
            description: 'Unable to capture image. Please try again.',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.length > 100) {
          handleCapture(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (dataUrl: string) => {
    const stepKey = STEPS[currentStep].key;
    setCaptures(prev => ({ ...prev, [stepKey]: dataUrl }));
  };

  const handleRetake = () => {
    const stepKey = STEPS[currentStep].key;
    setCaptures(prev => ({ ...prev, [stepKey]: null }));
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const analyzeImages = async () => {
    // Use the best available image for analysis
    const primaryImage = captures.beeCloseup || captures.hiveOverview || captures.wideAngle;
    
    if (!primaryImage) {
      toast({
        title: 'No Images',
        description: 'Please capture at least one image before analyzing.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Extract base64 data from data URL
      const base64Data = primaryImage.split(',')[1];
      
      if (!base64Data || base64Data.length < 100) {
        throw new Error('Invalid image data');
      }
      
      console.log('Sending image for analysis, size:', base64Data.length);
      
      const { data, error } = await supabase.functions.invoke('analyze-bee', {
        body: { 
          imageBase64: base64Data,
          hasHiveOverview: !!captures.hiveOverview,
          hasBeeCloseup: !!captures.beeCloseup,
          hasWideAngle: !!captures.wideAngle,
          location: location,
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      // Store result and navigate
      sessionStorage.setItem('analysisResult', JSON.stringify(data));
      sessionStorage.setItem('imageData', primaryImage);
      sessionStorage.setItem('allCaptures', JSON.stringify(captures));
      sessionStorage.setItem('location', JSON.stringify(location));
      
      navigate('/results');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Unable to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completedSteps = [
    captures.hiveOverview,
    captures.beeCloseup,
    captures.wideAngle,
  ].filter(Boolean).length;

  const currentStepData = STEPS[currentStep];
  const currentCapture = captures[currentStepData.key];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 safe-bottom">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Scan Hive</h1>
            <p className="text-sm text-muted-foreground">
              {location ? '📍 Location detected' : '⏳ Getting location...'}
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

        {/* Progress Bar */}
        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex-1 flex items-center">
              <div
                className={`h-2 flex-1 rounded-full transition-colors ${
                  captures[step.key] 
                    ? 'bg-nature' 
                    : index === currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                }`}
              />
              {index < STEPS.length - 1 && <div className="w-2" />}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {completedSteps} of 3 photos captured
        </p>
      </header>
      
      <div className="px-6">
        <AnimatePresence mode="wait">
          {/* Step Indicators */}
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Step Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary">Step {currentStep + 1} of 3</p>
                <h2 className="font-bold text-lg text-foreground">{currentStepData.title}</h2>
              </div>
              {currentCapture && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-nature/20">
                  <Check className="w-4 h-4 text-nature" />
                  <span className="text-xs font-medium text-nature">Done</span>
                </div>
              )}
            </div>

            {/* Camera/Preview Area */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-card border-2 border-dashed border-border">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-6 border-2 border-primary/40 rounded-2xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-3 border-primary rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>
                  {/* Location indicator */}
                  {location && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-nature" />
                      <span className="text-xs font-medium text-foreground">GPS Active</span>
                    </div>
                  )}
                </>
              ) : currentCapture ? (
                <>
                  <img src={currentCapture} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRetake}
                      className="rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Retake
                    </Button>
                  </div>
                  {location && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-nature" />
                      <span className="text-xs font-medium text-foreground">Location Saved</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                    {currentStepData.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground max-w-xs">{currentStepData.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!currentCapture && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  variant={isCameraActive ? "outline" : "default"}
                  className={`h-14 rounded-2xl font-semibold ${!isCameraActive ? 'gradient-honey text-primary-foreground' : ''}`}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isCameraActive ? 'Cancel' : 'Camera'}
                </Button>
                
                {isCameraActive ? (
                  <Button
                    onClick={capturePhoto}
                    className="h-14 gradient-honey text-primary-foreground rounded-2xl font-semibold"
                  >
                    <div className="w-8 h-8 rounded-full border-3 border-primary-foreground flex items-center justify-center mr-2">
                      <div className="w-4 h-4 rounded-full bg-primary-foreground" />
                    </div>
                    Capture
                  </Button>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-14 rounded-2xl font-semibold"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload
                  </Button>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {currentCapture && (
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    onClick={goToPrevStep}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl"
                  >
                    Previous
                  </Button>
                )}
                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={goToNextStep}
                    className="flex-1 h-14 gradient-honey text-primary-foreground rounded-2xl font-semibold"
                  >
                    Next Step
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={analyzeImages}
                    disabled={isAnalyzing}
                    className="flex-1 h-14 gradient-nature text-white rounded-2xl font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Image className="w-5 h-5 mr-2" />
                        Analyze All Photos
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Safety Tip */}
            <div className="p-4 rounded-2xl bg-caution/10 border border-caution/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-caution flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Tip</h4>
                  <p className="text-sm text-muted-foreground">{currentStepData.tip}</p>
                </div>
              </div>
            </div>

            {/* Quick Skip Option */}
            {!currentCapture && completedSteps > 0 && (
              <Button
                variant="ghost"
                onClick={analyzeImages}
                disabled={isAnalyzing}
                className="w-full text-muted-foreground"
              >
                Skip remaining steps and analyze now
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Analyzing Overlay */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🐝</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Analyzing Images</h3>
              <p className="text-muted-foreground">
                Identifying species, behavior, and safety level...
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default DetectionPage;
