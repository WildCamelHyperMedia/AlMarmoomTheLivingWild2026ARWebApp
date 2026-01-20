import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import oryxImage from "@assets/generated_images/arabian_oryx_in_desert_dunes_at_golden_hour.png";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
    setLocation("/signup");
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background text-white">
      {/* Background Image with Zoom Effect */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 z-10" />
        <img 
          src={oryxImage} 
          alt="Al Marmoom Desert" 
          className="h-full w-full object-cover object-center"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-between px-6 py-12 text-center">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <img src="/logo.png" alt="Al Marmoom" className="w-64 h-auto" />
          <h2 className="font-sans text-sm tracking-widest uppercase text-white/80 mt-2">
            Drive-Through Photography Exhibition
          </h2>
          <p className="font-sans text-xs tracking-wider text-white/60 mt-1">
            Al Marmoom Desert Conservation Reserve
          </p>
        </motion.div>

        {/* Center Visual/Spacer */}
        <div className="flex-1" />

        {/* Language Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* Arabic Option */}
          <button 
            onClick={() => handleLanguageSelect("ar")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white/10 p-4 text-right backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 border border-white/10 hover:border-primary/50"
          >
            <ArrowRight className="h-5 w-5 text-white/70 rotate-180 group-hover:-translate-x-1 group-hover:text-primary transition-all" />
            <span className="font-arabic text-xl">العربية</span>
          </button>

          {/* English Option */}
          <button 
            onClick={() => handleLanguageSelect("en")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white/10 p-4 text-left backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 border border-white/10 hover:border-primary/50"
          >
            <span className="font-serif text-xl">English</span>
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 group-hover:text-primary transition-all" />
          </button>

          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-[10px] text-white/30 tracking-widest uppercase">
              Al Marmoom Desert Conservation Reserve
            </p>
            <img src="/dubai-culture-logo.png" alt="Dubai Culture" className="h-8 w-auto opacity-70 grayscale hover:grayscale-0 transition-all" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
