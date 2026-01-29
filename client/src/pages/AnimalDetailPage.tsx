import { motion } from "framer-motion";
import { ArrowLeft, Play, ScanLine, ArrowRight, X, Volume2, VolumeX } from "lucide-react";
import { Link, useRoute, useLocation, useSearch } from "wouter";
import { useLanguage } from "@/lib/language";
import { animals } from "@/lib/data";
import { useState, useRef, useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { useUser } from "@/lib/user";
import { AnimatePresence } from "framer-motion";
import SaveProgressModal from "@/components/SaveProgressModal";
import { apiRequest } from "@/lib/queryClient";

const voiceoverMap: Record<string, { en: string; ar: string }> = {
  eurasian_stone_curlew: {
    en: "/videos/stone_curlew_en.mp3",
    ar: "/videos/stone_curlew_ar.mp3"
  }
};

const MIN_WATCH_TIME = 10; // seconds

export default function AnimalDetailPage() {
  const [, params] = useRoute("/animal/:id");
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { t, dir, language } = useLanguage();
  const { user, isLoading: userLoading } = useUser();
  const { recordVideoWatch, hasWatched, refreshProgress } = useProgress();

  const animal = animals.find((a) => a.id === params?.id);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isArOpen, setIsArOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [hasRecordedWatch, setHasRecordedWatch] = useState(false);
  const [qrUnlockProcessed, setQrUnlockProcessed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceoverRef = useRef<HTMLAudioElement>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAnimalIdRef = useRef<string | null>(null);
  
  // Auto-unlock when accessed via QR code URL (?qr=unlock&sig=XXXX)
  useEffect(() => {
    const urlParams = new URLSearchParams(searchString);
    const isQrUnlock = urlParams.get('qr') === 'unlock';
    const signature = urlParams.get('sig');
    
    if (isQrUnlock && signature && animal && !qrUnlockProcessed) {
      setQrUnlockProcessed(true);
      
      const performUnlock = async () => {
        try {
          if (user) {
            // Logged-in user: use server API with signature
            await apiRequest("POST", "/api/unlock-animal", { 
              animalId: animal.id,
              signature: signature 
            });
            await refreshProgress();
          } else {
            // Guest user: validate via public API endpoint first
            const validateResponse = await fetch("/api/validate-qr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ animalId: animal.id, signature })
            });
            const validation = await validateResponse.json();
            
            if (validation.valid) {
              const storedUnlocked = localStorage.getItem("unlockedAnimals");
              const unlocked: string[] = storedUnlocked ? JSON.parse(storedUnlocked) : [];
              if (!unlocked.includes(animal.id)) {
                unlocked.push(animal.id);
                localStorage.setItem("unlockedAnimals", JSON.stringify(unlocked));
                await refreshProgress();
              }
            } else {
              console.error("Invalid QR code:", validation.message);
            }
          }
          // Remove the qr param from URL to prevent re-processing
          setLocation(`/animal/${animal.id}`, { replace: true });
        } catch (err) {
          console.error("Auto-unlock error:", err);
        }
      };
      
      performUnlock();
    }
  }, [searchString, animal, user, qrUnlockProcessed, refreshProgress, setLocation]);
  
  // Reset state when animal changes
  useEffect(() => {
    if (animal && animal.id !== currentAnimalIdRef.current) {
      currentAnimalIdRef.current = animal.id;
      setWatchTime(0);
      setHasRecordedWatch(hasWatched(animal.id));
      setQrUnlockProcessed(false);
    }
  }, [animal, hasWatched]);

  // Track watch time - only when video is actually playing (not paused)
  useEffect(() => {
    if (isPlaying && !hasRecordedWatch && animal) {
      watchTimerRef.current = setInterval(() => {
        // Only count time if video is not paused
        if (videoRef.current && !videoRef.current.paused) {
          setWatchTime(prev => {
            const newTime = prev + 1;
            // Record watch when minimum time reached
            if (newTime >= MIN_WATCH_TIME && !hasRecordedWatch) {
              recordVideoWatch(animal.id).then((recorded) => {
                if (recorded) {
                  setHasRecordedWatch(true);
                  // Show reward popup
                  setShowRewardPopup(true);
                  // Auto-hide after 3 seconds
                  setTimeout(() => {
                    setShowRewardPopup(false);
                    // Then prompt guest to save progress
                    if (!user) {
                      setTimeout(() => {
                        setShowSaveModal(true);
                      }, 500);
                    }
                  }, 3000);
                }
              });
            }
            return newTime;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
    };
  }, [isPlaying, hasRecordedWatch, animal, user, recordVideoWatch]);

  // Auto-play video when animal has video
  const currentVideo = animal ? (language === 'ar' ? animal.videoAr : animal.videoEn) : undefined;
  useEffect(() => {
    if (currentVideo) {
      setIsPlaying(true);
    }
  }, [currentVideo]);

  // Handle video completion
  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Prompt guests to register after every video ends
    if (!user) {
      setTimeout(() => {
        setShowSaveModal(true);
      }, 500);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
    if (voiceoverRef.current) {
      voiceoverRef.current.volume = volume;
    }
  }, [volume]);

  // Play/pause voiceover with video
  useEffect(() => {
    const voiceover = animal?.id ? voiceoverMap[animal.id] : null;
    if (!voiceover || !voiceoverRef.current) return;

    if (isPlaying) {
      voiceoverRef.current.src = voiceover[language];
      voiceoverRef.current.volume = volume;
      voiceoverRef.current.muted = isMuted;
      voiceoverRef.current.play().catch(e => console.error("Voiceover play failed:", e));
    } else {
      voiceoverRef.current.pause();
      voiceoverRef.current.currentTime = 0;
    }
  }, [isPlaying, animal?.id, language]);

  // Sync mute state with voiceover
  useEffect(() => {
    if (voiceoverRef.current) {
      voiceoverRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Pause all media when AR opens
  useEffect(() => {
    if (isArOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (voiceoverRef.current) {
        voiceoverRef.current.pause();
      }
    }
  }, [isArOpen]);

  if (userLoading) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  if (!animal) {
    return <div>Animal not found</div>;
  }

  return (
    <div className="h-[100dvh] w-full bg-background text-white relative overflow-hidden">
      
      {/* Hidden voiceover audio element */}
      <audio ref={voiceoverRef} />
      
      {/* Full Screen Background Media - FILLS ENTIRE SCREEN */}
      <div className="absolute inset-0 z-0">
        {isPlaying && currentVideo ? (
          <video 
            ref={videoRef}
            src={currentVideo} 
            autoPlay 
            controls={false}
            playsInline
            loop={false}
            muted={isMuted}
            onEnded={handleVideoEnded}
            onClick={() => setIsPlaying(false)}
            className="w-full h-full object-cover absolute inset-0 z-0"
            poster={animal.optimizedImage}
          />
        ) : (
          <img 
            src={animal.optimizedImage} 
            alt={t(`animals.${animal.id}`)}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = animal.image; }}
          />
        )}
      </div>
      
      {/* Gradient for bottom content readability */}
      <div className="absolute bottom-0 left-0 right-0 h-[250px] bg-gradient-to-t from-black via-black/70 to-transparent z-5 pointer-events-none" />

      {/* Close Button - Top Right (when playing) */}
      {isPlaying && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsPlaying(false)}
          className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors text-white`}
          data-testid="button-stop-video"
        >
          <X className="w-6 h-6" />
        </motion.button>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isArOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(true)}
            className="pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl group"
            data-testid="button-play-video"
          >
            <Play className="fill-white ml-1 w-8 h-8 group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>
      )}

      {/* Mattercraft AR Overlay */}
      {isArOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="relative flex-1">
            <button 
              onClick={() => setIsArOpen(false)}
              className="absolute top-6 left-6 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
              data-testid="button-close-ar"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Mattercraft Iframe */}
            <iframe
              src={animal.arUrl || "https://web.zappar.com/example-project"} 
              className="w-full h-full border-0"
              allow="camera *; microphone *; gyroscope *; accelerometer *; magnetometer *; xr-spatial-tracking *; fullscreen *; autoplay *; web-share *; display-capture *"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
            ></iframe>
          </div>
          
          <div className="relative z-10 bg-black/90 backdrop-blur-md p-6 pb-10 text-center border-t border-white/10">
            <p className="text-white text-sm font-medium mb-1">
              {t(`animals.${animal.id}`)} AR Experience
            </p>
            <p className="text-white/60 text-xs">
              Allow camera access to view the animal in your space
            </p>
          </div>
        </div>
      )}

      {/* Bottom Content - All controls integrated */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-6 flex flex-col gap-3">
        
        {/* Control Row - Back, Name/Timer, Close/Volume */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <Link href="/gallery">
            <button 
              className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
              data-testid="button-back-to-gallery"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
          </Link>
          
          {/* Name Block with optional countdown */}
          <div className="flex-1 bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center relative overflow-hidden">
            {/* Countdown progress bar */}
            {isPlaying && !hasRecordedWatch && (
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: `${(watchTime / MIN_WATCH_TIME) * 100}%` }}
                className="absolute bottom-0 left-0 h-1 bg-primary rounded-full"
              />
            )}
            <h1 className="font-serif text-xl font-bold text-white leading-tight">
              {t(`animals.${animal.id}`)}
            </h1>
            <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-white/50">
              {animal.scientificName}
            </p>
          </div>
          
          {/* Right Controls - Volume or Close when playing, empty when not */}
          {isPlaying ? (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors text-white"
                data-testid="button-toggle-mute"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="w-14 h-14" />
          )}
        </div>

        {/* AR Button - Full width */}
        <motion.button 
          onClick={() => setIsArOpen(true)}
          className="w-full bg-[#8B6B58] hover:bg-[#7A5C4A] text-white/90 font-medium py-4 rounded-2xl transition-all flex items-center justify-between px-6 group relative overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(139,107,88,0.4)" }}
          whileTap={{ scale: 0.98 }}
          data-testid="button-enter-ar"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
          <ScanLine className="w-5 h-5 opacity-70 relative z-10" />
          <span className="text-sm tracking-widest uppercase flex-1 text-center relative z-10">
            {t("detail.enterAr")}
          </span>
          <motion.div 
            className={`relative z-10 ${dir === 'rtl' ? 'rotate-180' : ''}`}
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-5 h-5 opacity-70" />
          </motion.div>
        </motion.button>
      </div>

      {/* Reward Popup */}
      <AnimatePresence>
        {showRewardPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-primary/95 to-[#8B6B58] backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 text-center max-w-xs pointer-events-auto"
            >
              {/* Celebration Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
              >
                <span className="text-3xl">🎉</span>
              </motion.div>
              
              {/* Text */}
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? 'Congratulations!' : 'تهانينا!'}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {language === 'en' 
                  ? `You just earned 1 reward point for watching the ${t(`animals.${animal.id}`)} video!`
                  : `لقد ربحت نقطة مكافأة واحدة لمشاهدة فيديو ${t(`animals.${animal.id}`)}!`
                }
              </p>
              
              {/* Points Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2"
              >
                <span className="text-2xl font-bold text-white">+1</span>
                <span className="text-xs text-white/80 uppercase tracking-wider">
                  {language === 'en' ? 'Point' : 'نقطة'}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Progress Modal */}
      <SaveProgressModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSuccess={() => setShowSaveModal(false)}
      />
    </div>
  );
}
