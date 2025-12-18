import React, { useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Camera, RotateCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onSkip: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้อง');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror the image horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gradient-card rounded-2xl shadow-card">
      <h3 className="text-xl font-display text-foreground">ถ่ายภาพใบหน้า</h3>
      <p className="text-sm text-muted-foreground text-center">
        ถ่ายภาพใบหน้าของคุณเพื่อใส่ในตัวละคร
      </p>

      <div className="relative w-64 h-64 rounded-full overflow-hidden bg-muted border-4 border-primary/30">
        {!isStreaming && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${
            isStreaming && !capturedImage ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured face"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Circular mask overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <mask id="circleMask">
                <rect width="100" height="100" fill="white" />
                <circle cx="50" cy="50" r="48" fill="black" />
              </mask>
            </defs>
            <rect
              width="100"
              height="100"
              fill="hsl(var(--background))"
              mask="url(#circleMask)"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        {!isStreaming && !capturedImage && (
          <>
            <Button variant="hero" size="lg" onClick={startCamera}>
              <Camera className="w-5 h-5 mr-2" />
              เปิดกล้อง
            </Button>
            <Button variant="outline" size="lg" onClick={onSkip}>
              ข้าม
            </Button>
          </>
        )}
        
        {isStreaming && !capturedImage && (
          <Button variant="hero" size="lg" onClick={capturePhoto}>
            <Camera className="w-5 h-5 mr-2" />
            ถ่ายภาพ
          </Button>
        )}
        
        {capturedImage && (
          <>
            <Button variant="outline" size="lg" onClick={retake}>
              <RotateCcw className="w-5 h-5 mr-2" />
              ถ่ายใหม่
            </Button>
            <Button variant="hero" size="lg" onClick={confirmCapture}>
              <Check className="w-5 h-5 mr-2" />
              ยืนยัน
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
