import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import jsQR from "jsqr";

interface QrScannerProps {
  onDetected: (value: string) => void;
  active: boolean;
}

export function QrScanner({ onDetected, active }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      stopCamera();
      return;
    }
    detectedRef.current = false;
    startCamera();
    return () => stopCamera();
  }, [active]);

  async function startCamera() {
    setLoading(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          setLoading(false);
          scanFrame();
        };
      }
    } catch (e: any) {
      setError("Camera access denied. Please allow camera permissions.");
      setLoading(false);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function scanFrame() {
    if (!videoRef.current || !canvasRef.current || detectedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    if (!ctx || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code && code.data && !detectedRef.current) {
      detectedRef.current = true;
      const raw = code.data;
      // Extract batchId from URL if embedded
      try {
        const url = new URL(raw);
        const bid = url.searchParams.get("batchId");
        onDetected(bid || raw);
      } catch {
        onDetected(raw);
      }
      stopCamera();
    } else {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center">
        <CameraOff className="w-8 h-8 text-rose-400" />
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(0,200,150,0.1)] bg-black">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Starting camera…</p>
        </div>
      )}

      {/* Scanning overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Corner brackets */}
        <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-sm" />
        <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-sm" />
        <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-sm" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-sm" />
        {/* Scanning line */}
        <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-primary/60 animate-pulse shadow-[0_0_10px_rgba(0,200,150,0.8)]" />
      </div>

      <video
        ref={videoRef}
        className="w-full max-h-64 object-cover"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center">
        <p className="text-[11px] text-primary/80 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
          <Camera className="w-3 h-3" />
          Align QR Code within frame
        </p>
      </div>
    </div>
  );
}
