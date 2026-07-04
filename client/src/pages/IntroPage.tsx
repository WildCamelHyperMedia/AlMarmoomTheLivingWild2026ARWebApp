import { useState, useEffect, useRef } from "react";
import { asset } from "@/lib/assetBase";
import { motion, AnimatePresence } from "framer-motion";
import { Play, LogOut, ArrowLeft, Loader2, Volume2, VolumeX } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";

export default function IntroPage() {
  const [, setLocation] = useLocation();
  const { t, language, dir } = useLanguage();
  const { user, isLoading, logout } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [videoEnded, setVideoEnded] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryUnmute = () => {
      if (video.paused) return;
      video.muted = false;
      if (video.muted === false) {
        setIsMuted(false);
      }
    };
    if (!video.paused) {
      tryUnmute();
    } else {
      video.addEventListener('playing', tryUnmute, { once: true });
    }
    return () => video.removeEventListener('playing', tryUnmute);
  }, []);

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      setIsVideoLoading(true);
      video.muted = true;
      video.play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
          setIsVideoLoading(false);
          setAutoplayFailed(false);
          video.muted = false;
          setIsMuted(video.muted);
        })
        .catch(() => setIsVideoLoading(false));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

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

  const handleStartJourney = () => {
    if (canProceed) {
      setLocation("/gallery");
    }
  };

  if (!isLoading && user?.isAdmin) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#1a1208] text-white flex flex-col relative overflow-hidden">
      
      {/* Full-Screen Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={asset("/videos/ali-intro.mp4")}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted
          preload="auto"
          poster={asset("/images/photographer_ghillie.png")}
          onPlay={() => {
            setIsPlaying(true);
            setHasStarted(true);
            setAutoplayFailed(false);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setVideoEnded(true);
            setCanProceed(true);
          }}
          onError={() => {
            setAutoplayFailed(true);
          }}
        />
        
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full flex justify-between items-center px-4 pt-4 safe-top"
      >
        <button 
          onClick={() => setLocation("/")}
          className={`p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          data-testid="button-back-to-language"
          title={language === 'en' ? 'Change Language' : 'تغيير اللغة'}
        >
          <ArrowLeft className="h-5 w-5 text-white/80" />
        </button>
        <img src={asset("/logo.png")} alt="Al Marmoom" className="w-28 sm:w-36 h-auto drop-shadow-lg" />
        {user ? (
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            data-testid="button-logout"
            title={language === 'en' ? 'Logout' : 'تسجيل الخروج'}
          >
            <LogOut className="h-5 w-5 text-white/80" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </motion.div>

      {/* Fallback play button if autoplay fails */}
      <AnimatePresence>
        {!isPlaying && !videoEnded && !hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          >
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayVideo}
              disabled={isVideoLoading}
              className="w-24 h-24 rounded-full bg-[#b97d42]/80 backdrop-blur-md border-2 border-[#b97d42] flex items-center justify-center shadow-[0_0_40px_rgba(185,125,66,0.4)] mb-6"
              data-testid="button-play-intro-video"
            >
              {isVideoLoading ? (
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              ) : (
                <Play className="w-12 h-12 fill-white text-white ml-1" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replay overlay after video ends */}
      <AnimatePresence>
        {videoEnded && !isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.currentTime = 0;
                  setVideoEnded(false);
                  handlePlayVideo();
                }
              }}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center"
              data-testid="button-replay-intro-video"
            >
              <Play className="w-8 h-8 fill-white text-white ml-0.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute/Unmute button - always visible when video has started */}
      <AnimatePresence>
        {hasStarted && !videoEnded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMute}
            className={`absolute top-20 right-4 z-20 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all safe-top ${
              isMuted 
                ? "p-3 bg-[#b97d42]/80 border border-[#b97d42] shadow-[0_0_15px_rgba(185,125,66,0.4)]" 
                : "p-2.5 bg-black/30"
            }`}
            data-testid="button-toggle-mute"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white/80" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Section - CTA */}
      <div className="relative z-20 mt-auto px-6 pb-6 safe-bottom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mx-auto space-y-4"
        >
          {/* Start Journey Button */}
          <div className="relative">
            <motion.button
              onClick={handleStartJourney}
              disabled={!canProceed}
              className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 overflow-hidden relative text-base ${
                canProceed 
                  ? "bg-[#b97d42] text-white hover:bg-[#a06c36] active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(185,125,66,0.4)]" 
                  : "bg-white/10 backdrop-blur-sm text-white/40 cursor-not-allowed border border-white/10"
              }`}
              data-testid="button-start-journey"
            >
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
            
            <AnimatePresence>
              {canProceed && (
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-2xl"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Partner Logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center pt-4"
        >
          <img src={asset("/dubai-culture-logo.png")} alt="Dubai Culture" className="h-5 sm:h-6 w-auto opacity-50 grayscale" />
        </motion.div>
      </div>
    </div>
  );
}
