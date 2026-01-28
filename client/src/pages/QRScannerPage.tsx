import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, CheckCircle, XCircle, Scan } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { Html5Qrcode } from "html5-qrcode";
import { animals } from "@/lib/data";
import { apiRequest } from "@/lib/queryClient";
import { useProgress } from "@/lib/progress";
import { validateQRCode } from "@shared/qrCodes";

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
  const { refreshProgress } = useProgress();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<UnlockResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    };
    return translations[key]?.[language] || key;
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
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await stopScanner();
          await handleQRCode(decodedText);
        },
        () => {}
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(t("cameraError"));
    }
  };

  const handleQRCode = async (code: string) => {
    try {
      if (user) {
        // Logged-in user: use server API
        const response = await apiRequest("POST", "/api/unlock-animal", { qrCode: code });
        const data = await response.json();
        
        if (data.success) {
          const animal = animals.find(a => a.id === data.animalId);
          await refreshProgress();
          setResult({
            success: true,
            animalId: data.animalId,
            animalName: animal?.id || data.animalId,
            alreadyUnlocked: data.alreadyUnlocked
          });
        } else {
          setResult({
            success: false,
            message: data.message || t("invalidCode")
          });
        }
      } else {
        // Guest user: validate locally and store in localStorage
        const validation = validateQRCode(code);
        if (validation.valid && validation.animalId) {
          const storedUnlocked = localStorage.getItem("unlockedAnimals");
          const unlocked: string[] = storedUnlocked ? JSON.parse(storedUnlocked) : [];
          const alreadyUnlocked = unlocked.includes(validation.animalId);
          
          if (!alreadyUnlocked) {
            unlocked.push(validation.animalId);
            localStorage.setItem("unlockedAnimals", JSON.stringify(unlocked));
          }
          
          await refreshProgress();
          const animal = animals.find(a => a.id === validation.animalId);
          setResult({
            success: true,
            animalId: validation.animalId,
            animalName: animal?.id || validation.animalId,
            alreadyUnlocked
          });
        } else {
          setResult({
            success: false,
            message: t("invalidCode")
          });
        }
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
      className="h-[100dvh] w-full bg-background text-white flex flex-col"
      dir={dir}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={() => setLocation("/gallery")}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!result ? (
          <>
            <p className="text-white/70 text-center mb-6">{t("subtitle")}</p>
            
            {/* QR Scanner Container */}
            <div 
              ref={containerRef}
              className="w-full max-w-sm aspect-square bg-black/50 rounded-2xl overflow-hidden relative mb-6"
            >
              <div id="qr-reader" className="w-full h-full" />
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scan className="h-24 w-24 text-white/30" />
                </div>
              )}
            </div>

            {/* Scan Button */}
            <button
              onClick={isScanning ? stopScanner : startScanner}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-colors ${
                isScanning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-[#b97d42] hover:bg-[#a06d35]'
              }`}
              data-testid="button-scan"
            >
              <Camera className="h-5 w-5" />
              {isScanning ? t("stopScan") : t("startScan")}
            </button>

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
                  <button
                    onClick={() => setLocation(`/animal/${result.animalId}`)}
                    className="w-full py-3 bg-[#b97d42] rounded-full font-semibold"
                    data-testid="button-view-animal"
                  >
                    {t("viewAnimal")}
                  </button>
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
