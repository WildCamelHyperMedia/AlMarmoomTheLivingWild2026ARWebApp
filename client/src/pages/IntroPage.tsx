import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, LogOut, ArrowLeft, Gift, Camera, Book, Sparkles, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import posterImage from "@assets/generated_images/portrait_of_ali_bin_thalith_in_traditional_emirati_clothing.png";

export default function IntroPage() {
  const [, setLocation] = useLocation();
  const { t, language, dir } = useLanguage();
  const { user, isLoading, logout } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showPrizePopup, setShowPrizePopup] = useState(false);

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      setIsVideoLoading(true);
      video.play()
        .then(() => {
          setIsPlaying(true);
          setIsVideoLoading(false);
        })
        .catch((e) => {
          console.error("Play failed:", e);
          setIsVideoLoading(false);
        });
    }
  };

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
      setLocation("/gallery");
    }
  };

  const handleRegisterNow = () => {
    setShowPrizePopup(false);
    setLocation("/auth");
  };

  const handleAlreadyRegistered = () => {
    setShowPrizePopup(false);
    setLocation("/auth");
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
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-4 sm:px-6 py-4 sm:py-6 relative overflow-hidden safe-top safe-bottom">
      
      {/* Desert Dunes Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/desert-dunes.jpg')" }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      {/* Header with Back Button and Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full z-10 flex justify-between items-center mb-2"
      >
        <button 
          onClick={() => setLocation("/")}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          data-testid="button-back-to-language"
          title={language === 'en' ? 'Change Language' : 'تغيير اللغة'}
        >
          <ArrowLeft className="h-5 w-5 text-white/60 hover:text-white" />
        </button>
        <img src="/logo.png" alt="Al Marmoom" className="w-28 sm:w-36 h-auto" />
        {user ? (
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            data-testid="button-logout"
            title={language === 'en' ? 'Logout' : 'تسجيل الخروج'}
          >
            <LogOut className="h-5 w-5 text-white/60 hover:text-white" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </motion.div>

      {/* Main Content - Centered */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
        {/* Video Player Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[9/16] max-h-[50vh] sm:max-h-[55vh] bg-black/20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-4"
        >
          {/* Poster Image (always visible as background) */}
          <img 
            src="/images/photographer_ghillie.png" 
            alt="Ali Bin Thalith" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Video (overlays poster when playing) */}
          <video
            ref={videoRef}
            src="/videos/ali-intro.mp4"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            playsInline
            preload="auto"
            onEnded={() => {
              setCanProceed(true);
              setIsPlaying(false);
            }}
            onCanPlay={() => {
              if (videoRef.current && isPlaying) {
                videoRef.current.play().catch(() => setIsPlaying(false));
              }
            }}
          />
        
          {/* Play Button Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayVideo}
                disabled={isVideoLoading}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white"
                data-testid="button-play-intro-video"
              >
                {isVideoLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Play className="w-8 h-8 fill-white ml-1" />
                )}
              </motion.button>
            </div>
          )}
      </motion.div>

        {/* Action Buttons */}
        <div className="w-full max-w-[300px] sm:max-w-sm space-y-3 sm:space-y-4">
          
          {/* Start Journey Button - Clickable after 5 seconds */}
          <div className="relative">
            <motion.button
              onClick={handleStartJourney}
              disabled={!canProceed}
              className={`w-full py-3 sm:py-4 rounded-xl font-bold tracking-wide transition-all duration-300 overflow-hidden relative text-sm sm:text-base ${
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
        </div>
      </div>

      {/* Partner Logo - Bottom */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center py-4 z-10 mt-auto"
      >
        <img src="/dubai-culture-logo.png" alt="Dubai Culture" className="h-5 sm:h-6 w-auto opacity-60 grayscale" />
      </motion.div>

      {/* Prize Popup Modal - Elegant Card Design */}
      <AnimatePresence>
        {showPrizePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleAlreadyRegistered}
            />

            {/* Card */}
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#fef3dc] rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Decorative Top Bar */}
              <div className="h-2 bg-gradient-to-r from-[#b97d42] via-[#d3bea5] to-[#b97d42]" />
              
              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 12 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#30221b] flex items-center justify-center shadow-lg"
                >
                  <Gift className="w-8 h-8 text-[#b97d42]" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-[#30221b] mb-2"
                >
                  {t("intro.popup.title")}
                </motion.h2>

                {/* Subtitle */}
                {/* Message */}
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#5b3e34] text-sm leading-relaxed mb-5"
                >
                  {t("intro.popup.message")}
                </motion.p>

                {/* Prize List */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2 mb-6"
                >
                  {/* Prize 1 */}
                  <div className="flex items-center gap-3 bg-[#f5e6d3] border border-[#d3c4b0] rounded-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-[#30221b] flex items-center justify-center flex-shrink-0">
                      <Camera className="w-4 h-4 text-[#b97d42]" />
                    </div>
                    <span className="text-[#30221b] font-medium text-left text-sm">{t("intro.popup.prize1")}</span>
                  </div>

                  {/* Prize 2 */}
                  <div className="flex items-center gap-3 bg-[#f5e6d3] border border-[#d3c4b0] rounded-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-[#30221b] flex items-center justify-center flex-shrink-0">
                      <Book className="w-4 h-4 text-[#b97d42]" />
                    </div>
                    <span className="text-[#30221b] font-medium text-left text-sm">{t("intro.popup.prize2")}</span>
                  </div>

                  {/* Prize 3 */}
                  <div className="flex items-center gap-3 bg-[#f5e6d3] border border-[#d3c4b0] rounded-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-[#30221b] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#b97d42]" />
                    </div>
                    <span className="text-[#30221b] font-medium text-left text-sm">{t("intro.popup.prize3")}</span>
                  </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <motion.button
                    onClick={handleRegisterNow}
                    className="w-full bg-[#b97d42] hover:bg-[#855338] text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(185,125,66,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="button-register-now"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                    />
                    <span className="relative z-10">{t("intro.popup.register")}</span>
                  </motion.button>

                  <motion.button
                    onClick={handleAlreadyRegistered}
                    className="w-full text-[#5b3e34] hover:text-[#30221b] font-medium py-2 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="button-already-registered"
                  >
                    {t("intro.popup.skip")}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
