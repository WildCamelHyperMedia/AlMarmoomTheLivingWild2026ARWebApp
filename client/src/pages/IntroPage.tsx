import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import posterImage from "@assets/generated_images/portrait_of_ali_bin_thalith_in_traditional_emirati_clothing.png";

export default function IntroPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else {
      setCanProceed(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartJourney = () => {
    if (canProceed) {
      setLocation("/gallery");
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-6 py-8 relative overflow-hidden">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

      {/* Header - Top Left */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8 z-10 text-left"
      >
        <h2 className="text-white/60 text-xs tracking-widest uppercase font-sans mb-1">Intro By</h2>
        <h1 className="text-white text-lg tracking-wider uppercase font-serif font-bold">Ali Bin Thalith</h1>
      </motion.div>

      {/* Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8 z-10"
      >
        <div className="font-arabic text-3xl mb-1 text-primary">المرموم</div>
        <h1 className="font-serif text-xl tracking-[0.2em] uppercase text-white/90">
          Al Marmoom
        </h1>
      </motion.div>

      {/* Video Player Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full aspect-[9/16] max-h-[50vh] bg-black/20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 mb-8"
      >
        <img 
          src={posterImage} 
          alt="Ali Bin Thalith" 
          className="w-full h-full object-cover"
        />
        
        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white"
            >
              <Play className="fill-white ml-1" />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-4 z-10 mt-auto">
        
        {/* Start Journey Button */}
        <div className="relative">
          <motion.button
            onClick={handleStartJourney}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-500 overflow-hidden relative ${
              canProceed 
                ? "bg-primary text-background hover:bg-primary/90 active:scale-[0.98] cursor-pointer" 
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {/* Progress Bar Background for disabled state */}
            {!canProceed && (
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute inset-0 bg-white/10 z-0"
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {t("intro.start")}
              {!canProceed && <span className="text-xs opacity-50">({countdown}s)</span>}
            </span>
          </motion.button>
          
          {/* Shine Effect when enabled */}
          <AnimatePresence>
            {canProceed && (
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "100%", opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-xl"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Win a Book Button */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full py-4 rounded-xl bg-secondary/50 text-white border border-white/5 hover:bg-secondary/70 transition-colors text-sm tracking-wide"
        >
          {t("intro.win")}
        </motion.button>
      </div>

    </div>
  );
}
