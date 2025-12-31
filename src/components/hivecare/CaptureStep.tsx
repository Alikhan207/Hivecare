import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, RotateCcw, Check, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CaptureStepProps {
  step: number;
  title: string;
  description: string;
  icon: 'hive' | 'bee' | 'location';
  imageData: string | null;
  onCapture: (data: string) => void;
  onRetake: () => void;
  isActive: boolean;
  hasLocation: boolean;
}

const stepIcons = {
  hive: '🏠',
  bee: '🐝',
  location: '📍',
};

const CaptureStep = ({
  step,
  title,
  description,
  icon,
  imageData,
  onCapture,
  onRetake,
  isActive,
  hasLocation,
}: CaptureStepProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

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
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: imageData ? 1 : 0.5, scale: 1 }}
        className={`p-4 rounded-2xl border ${imageData ? 'bg-nature/10 border-nature/30' : 'bg-card/50 border-border/50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${imageData ? 'bg-nature/20' : 'bg-muted'}`}>
            {imageData ? <Check className="w-6 h-6 text-nature" /> : stepIcons[icon]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Step {step}</span>
              {imageData && <Check className="w-3 h-3 text-nature" />}
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {imageData && (
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img src={imageData} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Step Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
          {stepIcons[icon]}
        </div>
        <div>
          <p className="text-xs font-medium text-primary">Step {step} of 3</p>
          <h2 className="font-bold text-lg text-foreground">{title}</h2>
        </div>
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
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            {/* Location indicator */}
            {hasLocation && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-nature" />
                <span className="text-xs font-medium text-foreground">GPS Active</span>
              </div>
            )}
          </>
        ) : imageData ? (
          <>
            <img src={imageData} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={onRetake}
                className="rounded-full bg-background/80 backdrop-blur-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retake
              </Button>
            </div>
            {hasLocation && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-nature" />
                <span className="text-xs font-medium text-foreground">Location Captured</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
              {stepIcons[icon]}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!imageData && (
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
              <div className="w-6 h-6 rounded-full border-2 border-primary-foreground flex items-center justify-center mr-2">
                <div className="w-3 h-3 rounded-full bg-primary-foreground" />
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Safety Tip */}
      <div className="p-3 rounded-xl bg-caution/10 border border-caution/20 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-caution flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">{description}</p>
      </div>
    </motion.div>
  );
};

export default CaptureStep;
