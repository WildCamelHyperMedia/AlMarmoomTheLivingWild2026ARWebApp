import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
    setLocation("/intro");
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      
      {/* Full Screen Poster Background */}
      <div className="absolute inset-0">
        <img 
          src="/images/poster-bg.png" 
          alt="Al Marmoom: The Living Wild" 
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Language Selection Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 pb-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-sm mx-auto space-y-3"
        >
          {/* Arabic Option */}
          <button 
            onClick={() => handleLanguageSelect("ar")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white/95 p-4 text-right transition-all hover:bg-white active:scale-95 shadow-xl"
            data-testid="button-arabic"
          >
            <ArrowRight className="h-5 w-5 text-[#A67C52] rotate-180 group-hover:-translate-x-1 transition-all" />
            <span className="font-arabic text-xl text-[#3D2E1F] font-bold">ابدأ بالعربية</span>
          </button>

          {/* English Option */}
          <button 
            onClick={() => handleLanguageSelect("en")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-[#A67C52] p-4 text-left transition-all hover:bg-[#8B6914] active:scale-95 shadow-xl"
            data-testid="button-english"
          >
            <span className="text-xl text-white font-bold">Start in English</span>
            <ArrowRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
