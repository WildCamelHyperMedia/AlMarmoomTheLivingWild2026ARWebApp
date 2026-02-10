import { motion } from "framer-motion";
import { ArrowLeft, Play, ScanLine, ArrowRight, X, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useRoute, useLocation, useSearch } from "wouter";
import { useLanguage } from "@/lib/language";
import { animals } from "@/lib/data";
import { useState, useRef, useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { useUser } from "@/lib/user";
import { AnimatePresence } from "framer-motion";
import SaveProgressModal from "@/components/SaveProgressModal";
import { apiRequest } from "@/lib/queryClient";
import { trackVideoWatch, trackARView, trackQRScan, trackVideoPlay } from "@/lib/activityTracker";

const MIN_WATCH_TIME = 10; // seconds

export default function AnimalDetailPage() {
  const [, params] = useRoute("/animal/:id");
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { t, dir, language } = useLanguage();
  const { user, isLoading: userLoading } = useUser();
  const { recordVideoWatch, hasWatched, refreshProgress } = useProgress();

  const animal = animals.find((a) => a.id === params?.id);
  
  // Check if coming from external QR scan - used for unlock processing only, NOT autoplay
  const urlParams = new URLSearchParams(searchString);
  const isExternalQrScan = urlParams.get('qr') === 'unlock';
  
  // NEVER autoplay - always require user to tap play button
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoActuallyPlaying, setIsVideoActuallyPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isArOpen, setIsArOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [hasRecordedWatch, setHasRecordedWatch] = useState(false);
  const [qrUnlockProcessed, setQrUnlockProcessed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAnimalIdRef = useRef<string | null>(null);
  
  // Auto-unlock when accessed via QR code URL (?qr=unlock&sig=XXXX)
  useEffect(() => {
    // Wait for user loading to complete before processing unlock
    if (userLoading) return;
    
    const params = new URLSearchParams(searchString);
    const isQrUnlock = params.get('qr') === 'unlock';
    const signature = params.get('sig');
    
    if (isQrUnlock && animal && !qrUnlockProcessed) {
      setQrUnlockProcessed(true);
      
      const performUnlock = async () => {
        try {
          console.log("[QR Unlock] Processing unlock for:", animal.id, "User:", user?.name || "guest", "Signature:", signature);
          
          // Track QR scan from external camera
          trackQRScan(animal.id, `external-camera-${signature || 'no-sig'}`);
          
          // Helper to save unlock to localStorage
          const saveToLocalStorage = () => {
            const storedUnlocked = localStorage.getItem("unlockedAnimals");
            const unlocked: string[] = storedUnlocked ? JSON.parse(storedUnlocked) : [];
            if (!unlocked.includes(animal.id)) {
              unlocked.push(animal.id);
              localStorage.setItem("unlockedAnimals", JSON.stringify(unlocked));
              console.log("[QR Unlock] Saved to localStorage:", unlocked);
            }
          };
          
          // Check if there's an auth token (user might be logged in even if user object not loaded)
          const authToken = localStorage.getItem("authToken");
          
          if (user || authToken) {
            // Logged-in user: use server API with signature
            console.log("[QR Unlock] Logged-in user detected, calling server API");
            try {
              const headers: HeadersInit = { "Content-Type": "application/json" };
              if (authToken) {
                headers["Authorization"] = `Bearer ${authToken}`;
              }
              
              const response = await fetch("/api/unlock-animal", {
                method: "POST",
                headers,
                body: JSON.stringify({ 
                  animalId: animal.id,
                  signature: signature 
                })
              });
              
              if (response.ok) {
                console.log("[QR Unlock] Server unlock successful");
              } else {
                const errorData = await response.json();
                console.error("[QR Unlock] Server unlock failed:", errorData);
                // Fall back to localStorage for guests
                if (response.status === 401) {
                  console.log("[QR Unlock] Auth failed, falling back to localStorage");
                  saveToLocalStorage();
                }
              }
            } catch (err) {
              console.error("[QR Unlock] Server request failed:", err);
              saveToLocalStorage();
            }
            await refreshProgress();
          } else {
            // Guest user: store in localStorage
            console.log("[QR Unlock] Guest user detected");
            saveToLocalStorage();
            await refreshProgress();
          }
          
          // Remove the qr param from URL to prevent re-processing
          setLocation(`/animal/${animal.id}`, { replace: true });
        } catch (err) {
          console.error("Auto-unlock error:", err);
        }
      };
      
      performUnlock();
    }
  }, [searchString, animal, user, userLoading, qrUnlockProcessed, refreshProgress, setLocation]);
  
  // Reset state when animal changes
  useEffect(() => {
    if (animal && animal.id !== currentAnimalIdRef.current) {
      currentAnimalIdRef.current = animal.id;
      setWatchTime(0);
      setHasRecordedWatch(hasWatched(animal.id));
      setQrUnlockProcessed(false);
    }
  }, [animal, hasWatched]);

  // Close modal and refresh progress when user logs in (after registration)
  useEffect(() => {
    if (user) {
      setShowSaveModal(false);
      // Refresh progress to get server-side data
      refreshProgress();
    }
  }, [user]);

  // Track watch time - only when video is actually playing
  useEffect(() => {
    console.log("[Video] Timer effect - isVideoActuallyPlaying:", isVideoActuallyPlaying, "hasRecordedWatch:", hasRecordedWatch, "animal:", animal?.id);
    
    if (isVideoActuallyPlaying && !hasRecordedWatch && animal) {
      console.log("[Video] Starting watch timer for:", animal.id);
      
      watchTimerRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          console.log("[Video] Watch time:", newTime, "seconds for", animal.id);
          
          // Record watch when minimum time reached
          if (newTime >= MIN_WATCH_TIME && !hasRecordedWatch) {
            console.log("[Video] Min time reached, recording watch for:", animal.id);
            recordVideoWatch(animal.id).then((recorded) => {
              console.log("[Video] recordVideoWatch returned:", recorded, "for:", animal.id);
              if (recorded) {
                setHasRecordedWatch(true);
                trackVideoWatch(animal.id);
                // Reward popup and save modal disabled - event is over
              }
            }).catch(err => {
              console.error("[Video] recordVideoWatch error:", err);
            });
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
    };
  }, [isVideoActuallyPlaying, hasRecordedWatch, animal, user, recordVideoWatch]);

  // Don't auto-play - let user tap play button
  const currentVideo = animal ? (language === 'ar' ? animal.videoAr : animal.videoEn) : undefined;

  // Handle video completion
  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsVideoLoading(false);
    setIsVideoActuallyPlaying(false);
  };
  
  // Reset loading when stopping video
  const handleStopVideo = () => {
    setIsPlaying(false);
    setIsVideoLoading(false);
    setIsVideoActuallyPlaying(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Pause video when AR opens
  useEffect(() => {
    if (isArOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isArOpen]);

  // Preload video early for faster iOS playback
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentVideo) {
      // Start loading video data immediately
      video.load();
      console.log("[Video] Preloading video for faster playback");
    }
  }, [currentVideo]);

  // Handle play/pause when isPlaying changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    let hasAttemptedPlay = false;
    
    if (isPlaying) {
      console.log("[Video] Attempting to play video, readyState:", video.readyState, "src:", video.src ? "loaded" : "empty");
      
      // Force load the video if not loaded
      if (!video.src || video.readyState === 0) {
        console.log("[Video] Loading video source...");
        video.load();
      }
      
      // Wait for video to be ready enough to play
      const attemptPlay = () => {
        if (hasAttemptedPlay) return;
        hasAttemptedPlay = true;
        
        console.log("[Video] attemptPlay called, readyState:", video.readyState);
        video.play()
          .then(() => {
            console.log("[Video] Play succeeded, paused:", video.paused);
            setIsVideoLoading(false);
          })
          .catch((e) => {
            console.error("[Video] Play failed:", e.name, e.message);
            setIsVideoLoading(false);
            // Try muted playback as fallback (works on most browsers)
            if (e.name === 'NotAllowedError' && !video.muted) {
              console.log("[Video] Trying muted playback...");
              video.muted = true;
              video.play().catch(() => {
                console.error("[Video] Muted playback also failed");
                setIsPlaying(false);
              });
            } else {
              setIsPlaying(false);
            }
          });
      };
      
      // readyState 2+ means enough data to play - try immediately on iOS
      if (video.readyState >= 1) {
        // On iOS, try playing even with readyState 1 (metadata loaded)
        attemptPlay();
      } else {
        console.log("[Video] Video not ready (readyState:", video.readyState, "), waiting...");
        
        // Set up multiple event listeners for better iOS compatibility
        const onCanPlay = () => {
          console.log("[Video] canplay event fired");
          attemptPlay();
        };
        const onLoadedData = () => {
          console.log("[Video] loadeddata event fired, readyState:", video.readyState);
          attemptPlay();
        };
        const onCanPlayThrough = () => {
          console.log("[Video] canplaythrough event fired");
          attemptPlay();
        };
        const onLoadedMetadata = () => {
          console.log("[Video] loadedmetadata event fired");
          // On iOS, try playing as soon as metadata is loaded
          attemptPlay();
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        video.addEventListener('canplay', onCanPlay, { once: true });
        video.addEventListener('loadeddata', onLoadedData, { once: true });
        video.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
        
        // Faster timeout fallback for iOS - try playing after 1.5 seconds
        const timeout = setTimeout(() => {
          console.log("[Video] Timeout fallback - attempting play");
          attemptPlay();
        }, 1500);
        
        return () => {
          clearTimeout(timeout);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('canplaythrough', onCanPlayThrough);
        };
      }
    } else {
      video.pause();
    }
  }, [isPlaying]);

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
      
      {/* Full Screen Background Media - FILLS ENTIRE SCREEN */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Background image always visible */}
        <img 
          src={animal.optimizedImage} 
          alt={t(`animals.${animal.id}`)}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = animal.image; }}
        />
        
        {/* Video - always rendered but opacity controlled */}
        {currentVideo && (
          <video 
            ref={videoRef}
            src={currentVideo} 
            controls={false}
            playsInline
            // @ts-ignore - webkit-playsinline is needed for older iOS
            webkit-playsinline="true"
            preload="auto"
            loop={false}
            muted={isMuted}
            onEnded={handleVideoEnded}
            onClick={handleStopVideo}
            onPlaying={() => {
              console.log("[Video] onPlaying event fired");
              setIsVideoLoading(false);
              setIsVideoActuallyPlaying(true);
            }}
            onPause={() => {
              console.log("[Video] onPause event fired");
              setIsVideoActuallyPlaying(false);
            }}
            className={`w-full h-full object-cover absolute inset-0 z-0 transition-opacity duration-300 pointer-events-auto ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
      
      {/* Gradient for bottom content readability */}
      <div className="absolute bottom-0 left-0 right-0 h-[250px] bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none" />

      {/* Close Button - Top Right (when playing) */}
      {isPlaying && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleStopVideo}
          className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors text-white`}
          data-testid="button-stop-video"
        >
          <X className="w-6 h-6" />
        </motion.button>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isArOpen && currentVideo && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsVideoLoading(true);
              setIsPlaying(true);
              // Track play button press for admin panel
              trackVideoPlay(animal.id);
            }}
            disabled={isVideoLoading}
            className="pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl group"
            data-testid="button-play-video"
          >
            {isVideoLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Play className="fill-white ml-1 w-8 h-8 group-hover:scale-110 transition-transform" />
            )}
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
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-4 pb-4 sm:pb-6 flex flex-col gap-2 sm:gap-3 safe-bottom">
        
        {/* Control Row - Back, Name/Timer, Close/Volume */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button 
            onClick={() => setLocation("/gallery")}
            className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
            data-testid="button-back-to-gallery"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>
          
          {/* Name Block with optional countdown */}
          <div className="flex-1 bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center relative overflow-hidden">
            {/* Countdown progress bar */}
            {isPlaying && !hasRecordedWatch && (
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: `${(watchTime / MIN_WATCH_TIME) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute bottom-0 left-0 h-1.5 bg-primary"
                style={{ minWidth: watchTime > 0 ? '8px' : '0px' }}
              />
            )}
            <h1 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
              {t(`animals.${animal.id}`)}
            </h1>
            <p className="font-sans text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-white/50">
              {animal.scientificName}
            </p>
          </div>
          
          {/* Right Controls - Volume or Close when playing, empty when not */}
          {isPlaying ? (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors text-white"
                data-testid="button-toggle-mute"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          ) : (
            <div className="w-14 h-14" />
          )}
        </div>

        {/* AR Button - Full width */}
        <motion.button 
          onClick={() => {
            trackARView(animal.id);
            setIsArOpen(true);
          }}
          className="w-full bg-[#8B6B58] hover:bg-[#7A5C4A] text-white/90 font-medium py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-between px-4 sm:px-6 group relative overflow-hidden"
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

      {/* Save Progress Modal - disabled, event is over */}
    </div>
  );
}
