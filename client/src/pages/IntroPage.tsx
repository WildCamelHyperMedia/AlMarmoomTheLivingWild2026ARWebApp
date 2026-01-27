import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, LogOut, ArrowLeft, Gift, Camera, Book, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import posterImage from "@assets/generated_images/portrait_of_ali_bin_thalith_in_traditional_emirati_clothing.png";

export default function IntroPage() {
  const [, setLocation] = useLocation();
  const { t, language, dir } = useLanguage();
  const { user, isLoading, logout } = useUser();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showPrizePopup, setShowPrizePopup] = useState(false);

  // If already logged in and admin, go to gallery
  useEffect(() => {
    if (!isLoading && user?.isAdmin) {
      setLocation("/gallery");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else {
      setCanProceed(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleSignUp = () => {
    if (canProceed) {
      setLocation("/auth");
    }
  };

  const handleStartJourney = () => {
    if (canProceed) {
      setShowPrizePopup(true);
    }
  };

  const handleRegisterNow = () => {
    setShowPrizePopup(false);
    setLocation("/auth");
  };

  const handleSkipToGallery = () => {
    setShowPrizePopup(false);
    setLocation("/gallery");
  };

  // If admin, show loading while redirecting
  if (!isLoading && user?.isAdmin) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-6 py-8 relative overflow-hidden">
      
      {/* Desert Dunes Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/desert-dunes.jpg')" }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8 z-10 flex justify-between items-start"
      >
        <div className="flex items-start gap-3">
          <button 
            onClick={() => setLocation("/")}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
            data-testid="button-back-to-language"
            title={language === 'en' ? 'Change Language' : 'تغيير اللغة'}
          >
            <ArrowLeft className="h-5 w-5 text-white/60 hover:text-white" />
          </button>
          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            <h2 className="text-white/60 text-xs tracking-widest uppercase font-sans mb-1">{t("intro.by")}</h2>
            <h1 className="text-white text-lg tracking-wider uppercase font-serif font-bold">{t("intro.photographer")}</h1>
          </div>
        </div>
        {user && (
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            data-testid="button-logout"
            title={language === 'en' ? 'Logout' : 'تسجيل الخروج'}
          >
            <LogOut className="h-5 w-5 text-white/60 hover:text-white" />
          </button>
        )}
      </motion.div>

      {/* Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8 z-10"
      >
        <img src="/logo.png" alt="Al Marmoom" className="w-40 h-auto mx-auto" />
      </motion.div>

      {/* Video Player Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full aspect-[9/16] max-h-[50vh] bg-black/20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 mb-8"
      >
        {!isPlaying ? (
            <img 
              src="/images/photographer_ghillie.png" 
              alt="Ali Bin Thalith" 
              className="w-full h-full object-cover"
            />
        ) : (
            <div className="relative w-full h-full">
                <video
                    ref={(el) => {
                      if (el && isPlaying) {
                        el.play().catch(e => console.error("Autoplay failed:", e));
                      }
                    }}
                    src="/videos/intro_video.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => setCanProceed(true)}
                />
                {/* Invisible layer to capture clicks to pause/stop if needed, or just let it play */}
                <div 
                    className="absolute inset-0 z-10" 
                    onClick={() => setIsPlaying(false)} 
                />
            </div>
        )}
        
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
        
        {/* Start Journey Button - Clickable after 5 seconds */}
        <div className="relative">
          <motion.button
            onClick={handleStartJourney}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 overflow-hidden relative ${
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

        {/* Partner Logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center pt-4"
        >
          <img src="/dubai-culture-logo.png" alt="Dubai Culture" className="h-6 w-auto opacity-60 grayscale" />
        </motion.div>
      </div>

      {/* Prize Popup Modal */}
      <AnimatePresence>
        {showPrizePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-b from-[#3E2D24] to-[#2C1810] rounded-3xl p-8 max-w-sm w-full border border-[#D4A045]/30 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative sparkles */}
              <div className="absolute top-4 right-4">
                <Sparkles className="w-6 h-6 text-[#D4A045] animate-pulse" />
              </div>
              <div className="absolute bottom-20 left-4">
                <Sparkles className="w-4 h-4 text-[#D4A045]/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Title */}
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4A045]/20 mb-4">
                  <Gift className="w-8 h-8 text-[#D4A045]" />
                </div>
                <h2 className="text-3xl font-bold text-[#D4A045] font-serif tracking-wide">
                  {t("intro.popup.title")}
                </h2>
              </motion.div>

              {/* Message */}
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/80 text-center leading-relaxed mb-6"
              >
                {t("intro.popup.message")}
              </motion.p>

              {/* Prize List */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mb-8"
              >
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#D4A045]/20 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-[#D4A045]" />
                  </div>
                  <span className="text-white font-medium">{t("intro.popup.prize1")}</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#D4A045]/20 flex items-center justify-center">
                    <Book className="w-5 h-5 text-[#D4A045]" />
                  </div>
                  <span className="text-white font-medium">{t("intro.popup.prize2")}</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#D4A045]/20 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-[#D4A045]" />
                  </div>
                  <span className="text-white font-medium">{t("intro.popup.prize3")}</span>
                </div>
              </motion.div>

              {/* Register Button */}
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleRegisterNow}
                className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg text-lg tracking-wide mb-3"
                data-testid="button-register-now"
              >
                {t("intro.popup.register")}
              </motion.button>

              {/* Skip Button */}
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleSkipToGallery}
                className="w-full text-white/50 hover:text-white/80 font-medium py-2 transition-colors text-sm"
                data-testid="button-skip-to-gallery"
              >
                {t("intro.popup.skip")}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
