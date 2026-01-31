import { motion } from "framer-motion";
import { ArrowLeft, Camera, Smartphone, ScanLine } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";

export default function QRScannerPage() {
  const [, setLocation] = useLocation();
  const { language, dir } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: "Scan QR Code", ar: "امسح رمز QR" },
      useNativeCamera: { 
        en: "Use Your Phone's Camera", 
        ar: "استخدم كاميرا هاتفك" 
      },
      instructions: { 
        en: "For the best scanning experience, please use your phone's built-in camera app to scan QR codes.", 
        ar: "للحصول على أفضل تجربة مسح، يرجى استخدام تطبيق الكاميرا المدمج في هاتفك لمسح رموز QR." 
      },
      step1: { 
        en: "Open your phone's Camera app", 
        ar: "افتح تطبيق الكاميرا في هاتفك" 
      },
      step2: { 
        en: "Point it at the animal QR code", 
        ar: "وجّهها نحو رمز QR الخاص بالحيوان" 
      },
      step3: { 
        en: "Tap the link that appears", 
        ar: "اضغط على الرابط الذي يظهر" 
      },
      step4: { 
        en: "The animal video will play automatically!", 
        ar: "سيتم تشغيل فيديو الحيوان تلقائياً!" 
      },
      backToGallery: { en: "Back to Gallery", ar: "العودة إلى المعرض" },
    };
    return translations[key]?.[language] || key;
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: "#30221b",
        direction: dir 
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          onClick={() => setLocation("/gallery")}
          className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white text-lg font-semibold">{t("title")}</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Camera Icon */}
        <motion.div
          className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
          style={{ backgroundColor: "#b97d42" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Camera className="w-16 h-16 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl font-bold text-white text-center mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t("useNativeCamera")}
        </motion.h2>

        {/* Instructions */}
        <motion.p
          className="text-white/80 text-center mb-8 max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t("instructions")}
        </motion.p>

        {/* Steps */}
        <motion.div
          className="w-full max-w-sm space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: Camera, text: t("step1") },
            { icon: ScanLine, text: t("step2") },
            { icon: Smartphone, text: t("step3") },
            { icon: null, text: t("step4"), emoji: "🎬" },
          ].map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ backgroundColor: "#b97d42" }}
              >
                {index + 1}
              </div>
              <div className="flex items-center gap-2 flex-1">
                {step.icon && <step.icon className="w-5 h-5 text-white/60" />}
                {step.emoji && <span className="text-xl">{step.emoji}</span>}
                <span className="text-white text-sm">{step.text}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Back to Gallery Button */}
        <motion.button
          onClick={() => setLocation("/gallery")}
          className="mt-8 px-8 py-3 rounded-full text-white font-semibold"
          style={{ backgroundColor: "#b97d42" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back-to-gallery"
        >
          {t("backToGallery")}
        </motion.button>
      </div>
    </motion.div>
  );
}
