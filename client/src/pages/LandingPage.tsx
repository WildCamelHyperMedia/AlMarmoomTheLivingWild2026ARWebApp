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
    <div className="relative h-[100dvh] w-full overflow-hidden text-white">
      {/* Background Image to cover black areas */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-texture.png')" }}
      />
      
      {/* Background Video - optimized for all screen sizes */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <video
          src="/videos/landing-video.mp4"
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#30221b]/80 via-transparent to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-end px-4 sm:px-6 text-center safe-bottom">
        
        {/* Language Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-[280px] sm:max-w-xs space-y-3 mb-2"
        >
          {/* Arabic Option */}
          <button 
            onClick={() => handleLanguageSelect("ar")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-[#5b3e34]/80 px-4 sm:px-5 py-4 text-right backdrop-blur-md transition-all hover:bg-[#855338] active:scale-[0.98] border border-[#b97d42]/30 hover:border-[#b97d42]"
            data-testid="button-language-arabic"
          >
            <ArrowRight className="h-5 w-5 text-[#fef3dc]/70 rotate-180 group-hover:-translate-x-1 group-hover:text-[#b97d42] transition-all" />
            <span className="font-arabic text-lg sm:text-xl text-[#fef3dc]">العربية</span>
          </button>

          {/* English Option */}
          <button 
            onClick={() => handleLanguageSelect("en")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-[#5b3e34]/80 px-4 sm:px-5 py-4 text-left backdrop-blur-md transition-all hover:bg-[#855338] active:scale-[0.98] border border-[#b97d42]/30 hover:border-[#b97d42]"
            data-testid="button-language-english"
          >
            <span className="font-serif text-lg sm:text-xl text-[#fef3dc]">English</span>
            <ArrowRight className="h-5 w-5 text-[#fef3dc]/70 group-hover:translate-x-1 group-hover:text-[#b97d42] transition-all" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
