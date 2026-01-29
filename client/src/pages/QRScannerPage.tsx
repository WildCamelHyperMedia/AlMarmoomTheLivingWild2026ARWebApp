import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, XCircle, Scan } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { Html5Qrcode } from "html5-qrcode";
import { animals } from "@/lib/data";
import { apiRequest } from "@/lib/queryClient";
import { useProgress } from "@/lib/progress";
import { validateQRCode, cleanQRText } from "@shared/qrCodes";
import { trackQRScan } from "@/lib/activityTracker";

export default function QRScannerPage() {
  const [, setLocation] = useLocation();
  const { language, dir } = useLanguage();
  const { user } = useUser();
  const { refreshProgress, recordUnlock } = useProgress();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const isStartingRef = useRef(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: "Scan QR Code", ar: "امسح رمز QR" },
      subtitle: { en: "Point your camera at an animal QR code", ar: "وجّه الكاميرا نحو رمز QR للحيوان" },
      invalidCode: { en: "Invalid QR Code", ar: "رمز QR غير صالح" },
      tryAgain: { en: "Try Again", ar: "حاول مرة أخرى" },
      cameraError: { en: "Camera access denied. Please enable camera permissions.", ar: "تم رفض الوصول للكاميرا. يرجى تفعيل إذن الكاميرا." },
    };
    return translations[key]?.[language] || key;
  };

  const stopScanner = async () => {
    // Clear any pending error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    isStartingRef.current = false;
  };

  const startScanner = async () => {
    // Guard against overlapping starts
    if (isStartingRef.current || isScanning) return;
    if (!containerRef.current) return;
    
    isStartingRef.current = true;
    setError(null);

    try {
      // Clear any existing scanner instance before creating a new one
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) { // SCANNING state
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          console.log("[QR] Raw scan result:", decodedText);
          await stopScanner();
          await handleQRCode(decodedText);
        },
        () => {}
      );
      
      setIsScanning(true);
      isStartingRef.current = false;
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(t("cameraError"));
      isStartingRef.current = false;
    }
  };

  // Extract animal ID and signature from URL format or legacy token format
  const extractQRData = (code: string): { animalId: string | null; signature: string | null; isUrl: boolean } => {
    const cleanedCode = cleanQRText(code);
    
    // Dev-only debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log("[QR Debug] Raw length:", code.length, "Clean length:", cleanedCode.length);
      console.log("[QR Debug] Cleaned code:", cleanedCode);
    }
    
    // Check if it's a URL format (e.g., https://app.replit.app/animal/desert_hare?qr=unlock&sig=XXXX)
    try {
      const url = new URL(cleanedCode);
      const pathMatch = url.pathname.match(/\/animal\/([a-z_]+)/i);
      if (pathMatch && pathMatch[1]) {
        const signature = url.searchParams.get('sig');
        return { animalId: pathMatch[1].toLowerCase(), signature, isUrl: true };
      }
    } catch {
      // Not a URL, try legacy token format
    }
    
    // Legacy token format: TLW-{animalId}-{token} - requires valid token
    const validation = validateQRCode(cleanedCode);
    
    if (validation.valid && validation.animalId) {
      return { animalId: validation.animalId, signature: null, isUrl: false };
    }
    
    return { animalId: null, signature: null, isUrl: false };
  };

  const scheduleRestart = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      errorTimeoutRef.current = null;
      startScanner();
    }, 2000);
  };

  const handleQRCode = async (code: string) => {
    try {
      // Extract animal ID and signature from either URL or token format
      const { animalId, signature, isUrl } = extractQRData(code);
      
      if (!animalId) {
        setError(t("invalidCode"));
        scheduleRestart();
        return;
      }
      
      // Verify animal exists
      const animal = animals.find(a => a.id === animalId);
      if (!animal) {
        setError(t("invalidCode"));
        scheduleRestart();
        return;
      }
      
      if (user) {
        // Logged-in user: use server API
        const payload = isUrl && signature 
          ? { animalId, signature }
          : { qrCode: code };
        
        const response = await apiRequest("POST", "/api/unlock-animal", payload);
        const data = await response.json();
        
        if (data.success) {
          if (!data.alreadyUnlocked) {
            recordUnlock(data.animalId);
          }
          await refreshProgress();
          trackQRScan(data.animalId, code);
          // Navigate directly to animal page with auto-play flag
          setLocation(`/animal/${data.animalId}?autoplay=1`);
        } else {
          setError(data.message || t("invalidCode"));
          scheduleRestart();
        }
      } else {
        // Guest user: validate via public API first, then store in localStorage
        const payload = isUrl && signature 
          ? { animalId, signature }
          : { qrCode: code };
        
        const validateResponse = await fetch("/api/validate-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const validation = await validateResponse.json();
        
        if (!validation.valid) {
          setError(validation.message || t("invalidCode"));
          scheduleRestart();
          return;
        }
        
        const storedUnlocked = localStorage.getItem("unlockedAnimals");
        const unlocked: string[] = storedUnlocked ? JSON.parse(storedUnlocked) : [];
        const alreadyUnlocked = unlocked.includes(animalId);
        
        if (!alreadyUnlocked) {
          unlocked.push(animalId);
          localStorage.setItem("unlockedAnimals", JSON.stringify(unlocked));
          recordUnlock(animalId);
        }
        
        await refreshProgress();
        trackQRScan(animalId, code);
        // Navigate directly to animal page with auto-play flag
        setLocation(`/animal/${animalId}?autoplay=1`);
      }
    } catch (err) {
      console.error("Unlock error:", err);
      setError(t("invalidCode"));
      scheduleRestart();
    }
  };

  // Auto-start scanner when page loads
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      // Small delay to ensure DOM is ready
      setTimeout(() => startScanner(), 100);
    }
    
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[100dvh] w-full bg-black text-white flex flex-col relative"
      dir={dir}
    >
      {/* Full Screen QR Scanner Container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full bg-black"
      >
        <div id="qr-reader" className="w-full h-full" />
        
        {/* Loading/Starting state */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <Scan className="h-24 w-24 text-white/30 mx-auto mb-4 animate-pulse" />
              <p className="text-white/70 text-center px-6">{t("subtitle")}</p>
            </div>
          </div>
        )}
        
        {/* Scanning Frame Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-[#b97d42] rounded-2xl relative">
                <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-[#b97d42] rounded-tl-2xl" />
                <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-[#b97d42] rounded-tr-2xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-[#b97d42] rounded-bl-2xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-[#b97d42] rounded-br-2xl" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Header - Overlaid on camera */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 to-transparent safe-top"
      >
        <motion.button
          onClick={() => setLocation("/gallery")}
          className={`p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6" />
        </motion.button>
        <h1 className="text-lg font-semibold drop-shadow-lg">{t("title")}</h1>
        <div className="w-10" />
      </motion.div>

      {/* Bottom Controls - Error message only */}
      {error && (
        <div className="relative z-10 mt-auto p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent safe-bottom">
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-400 mb-2" />
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                startScanner();
              }}
              className="px-6 py-3 bg-[#b97d42] rounded-full font-semibold"
              data-testid="button-try-again"
            >
              {t("tryAgain")}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
