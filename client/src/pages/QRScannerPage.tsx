import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, CheckCircle, XCircle, Scan, ZoomIn, ZoomOut } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { Html5Qrcode } from "html5-qrcode";
import { animals } from "@/lib/data";
import { apiRequest } from "@/lib/queryClient";
import { useProgress } from "@/lib/progress";
import { validateQRCode, cleanQRText } from "@shared/qrCodes";
import { trackQRScan } from "@/lib/activityTracker";

interface UnlockResult {
  success: boolean;
  animalId?: string;
  animalName?: string;
  message?: string;
  alreadyUnlocked?: boolean;
}

export default function QRScannerPage() {
  const [, setLocation] = useLocation();
  const { language, dir } = useLanguage();
  const { user } = useUser();
  const { refreshProgress, recordUnlock } = useProgress();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<UnlockResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1 });
  const [supportsZoom, setSupportsZoom] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: "Scan QR Code", ar: "امسح رمز QR" },
      subtitle: { en: "Point your camera at an animal QR code to unlock it", ar: "وجّه الكاميرا نحو رمز QR للحيوان لإلغاء قفله" },
      startScan: { en: "Start Scanning", ar: "ابدأ المسح" },
      stopScan: { en: "Stop Scanning", ar: "أوقف المسح" },
      unlocked: { en: "Animal Unlocked!", ar: "تم إلغاء قفل الحيوان!" },
      alreadyUnlocked: { en: "Already Unlocked", ar: "تم إلغاء القفل مسبقاً" },
      invalidCode: { en: "Invalid QR Code", ar: "رمز QR غير صالح" },
      viewAnimal: { en: "View Animal", ar: "عرض الحيوان" },
      scanAnother: { en: "Scan Another", ar: "امسح آخر" },
      backToGallery: { en: "Back to Gallery", ar: "العودة للمعرض" },
      cameraError: { en: "Camera access denied. Please enable camera permissions.", ar: "تم رفض الوصول للكاميرا. يرجى تفعيل إذن الكاميرا." },
      loginRequired: { en: "Please login to unlock animals", ar: "يرجى تسجيل الدخول لإلغاء قفل الحيوانات" },
      zoom: { en: "Zoom", ar: "تكبير" },
    };
    return translations[key]?.[language] || key;
  };

  const applyZoom = async (zoomLevel: number) => {
    if (!scannerRef.current || !supportsZoom) return;
    
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ zoom: zoomLevel } as any]
      });
      setZoom(zoomLevel);
    } catch (err) {
      console.error("Failed to apply zoom:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (!containerRef.current) return;

    setError(null);
    setResult(null);

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
      
      // Get container dimensions for portrait aspect ratio
      const containerWidth = containerRef.current?.clientWidth || 300;
      const containerHeight = containerRef.current?.clientHeight || 400;
      
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
      
      // Check for zoom capability after starting scanner
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && 'zoom' in capabilities) {
          const zoomCaps = capabilities.zoom as { min: number; max: number };
          if (zoomCaps && zoomCaps.max > 1) {
            setSupportsZoom(true);
            setZoomRange({ min: zoomCaps.min || 1, max: zoomCaps.max });
            setZoom(1);
          }
        }
      } catch (zoomErr) {
        console.log("Zoom not supported on this device");
        setSupportsZoom(false);
      }
      
      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(t("cameraError"));
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

  const handleQRCode = async (code: string) => {
    try {
      // Extract animal ID and signature from either URL or token format
      const { animalId, signature, isUrl } = extractQRData(code);
      
      if (!animalId) {
        setResult({
          success: false,
          message: t("invalidCode")
        });
        return;
      }
      
      // Verify animal exists
      const animal = animals.find(a => a.id === animalId);
      if (!animal) {
        setResult({
          success: false,
          message: t("invalidCode")
        });
        return;
      }
      
      if (user) {
        // Logged-in user: use server API
        // For URL-based QR codes, send signature; for legacy, send qrCode
        const payload = isUrl && signature 
          ? { animalId, signature }
          : { qrCode: code };
        
        const response = await apiRequest("POST", "/api/unlock-animal", payload);
        const data = await response.json();
        
        if (data.success) {
          // Update points immediately for this unlock
          if (!data.alreadyUnlocked) {
            recordUnlock(data.animalId);
          }
          await refreshProgress();
          // Track QR scan for analytics
          trackQRScan(data.animalId, code);
          setResult({
            success: true,
            animalId: data.animalId,
            animalName: animal.id,
            alreadyUnlocked: data.alreadyUnlocked
          });
        } else {
          setResult({
            success: false,
            message: data.message || t("invalidCode")
          });
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
          setResult({
            success: false,
            message: validation.message || t("invalidCode")
          });
          return;
        }
        
        const storedUnlocked = localStorage.getItem("unlockedAnimals");
        const unlocked: string[] = storedUnlocked ? JSON.parse(storedUnlocked) : [];
        const alreadyUnlocked = unlocked.includes(animalId);
        
        if (!alreadyUnlocked) {
          unlocked.push(animalId);
          localStorage.setItem("unlockedAnimals", JSON.stringify(unlocked));
          // Update points immediately for this unlock
          recordUnlock(animalId);
        }
        
        await refreshProgress();
        // Track QR scan for analytics (even for guests)
        trackQRScan(animalId, code);
        setResult({
          success: true,
          animalId,
          animalName: animal.id,
          alreadyUnlocked
        });
      }
    } catch (err) {
      console.error("Unlock error:", err);
      setResult({
        success: false,
        message: t("invalidCode")
      });
    }
  };

  useEffect(() => {
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
      {!result && (
        <div 
          ref={containerRef}
          className="absolute inset-0 w-full h-full bg-black"
        >
          <div id="qr-reader" className="w-full h-full" />
          
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <Scan className="h-24 w-24 text-white/30 mx-auto mb-4" />
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
      )}
      
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

      {/* Bottom Controls - Overlaid on camera */}
      <div className="relative z-10 mt-auto p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent safe-bottom">
        {!result ? (
          <>

            {/* Zoom Control */}
            {isScanning && supportsZoom && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mb-4 px-2"
              >
                <div className="flex items-center gap-3 bg-black/30 rounded-xl p-3">
                  <ZoomOut className="w-5 h-5 text-white/70" />
                  <input
                    type="range"
                    min={zoomRange.min}
                    max={zoomRange.max}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => applyZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#b97d42]"
                    data-testid="slider-zoom"
                  />
                  <ZoomIn className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm min-w-[40px] text-center">{zoom.toFixed(1)}x</span>
                </div>
              </motion.div>
            )}

            {/* Scan Button */}
            <motion.button
              onClick={isScanning ? stopScanner : startScanner}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-colors relative overflow-hidden ${
                isScanning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-[#b97d42] hover:bg-[#a06d35]'
              }`}
              whileHover={{ scale: 1.05, boxShadow: isScanning ? "0 10px 30px rgba(239,68,68,0.4)" : "0 10px 30px rgba(185,125,66,0.4)" }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-scan"
            >
              {!isScanning && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                />
              )}
              <motion.div
                animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
                transition={isScanning ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
              >
                <Camera className="h-5 w-5 relative z-10" />
              </motion.div>
              <span className="relative z-10">{isScanning ? t("stopScan") : t("startScan")}</span>
            </motion.button>

            {error && (
              <p className="mt-4 text-red-400 text-center">{error}</p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center text-center"
          >
            {result.success ? (
              <>
                <CheckCircle className="h-20 w-20 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {result.alreadyUnlocked ? t("alreadyUnlocked") : t("unlocked")}
                </h2>
                <p className="text-white/70 mb-8 capitalize">
                  {result.animalName?.replace(/_/g, ' ')}
                </p>
                
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <motion.button
                    onClick={() => setLocation(`/animal/${result.animalId}`)}
                    className="w-full py-3 bg-[#b97d42] rounded-full font-semibold"
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(185,125,66,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="button-view-animal"
                  >
                    {t("viewAnimal")}
                  </motion.button>
                  <button
                    onClick={() => {
                      setResult(null);
                      startScanner();
                    }}
                    className="w-full py-3 bg-white/10 rounded-full font-semibold"
                    data-testid="button-scan-another"
                  >
                    {t("scanAnother")}
                  </button>
                  <button
                    onClick={() => setLocation("/gallery")}
                    className="w-full py-3 text-white/70"
                    data-testid="button-back-gallery"
                  >
                    {t("backToGallery")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-20 w-20 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t("invalidCode")}</h2>
                <p className="text-white/70 mb-8">{result.message}</p>
                
                <button
                  onClick={() => {
                    setResult(null);
                    startScanner();
                  }}
                  className="px-8 py-3 bg-[#b97d42] rounded-full font-semibold"
                  data-testid="button-try-again"
                >
                  {t("scanAnother")}
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
