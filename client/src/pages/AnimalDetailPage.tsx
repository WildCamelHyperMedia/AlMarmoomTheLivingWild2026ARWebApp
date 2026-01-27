import { motion } from "framer-motion";
import { ArrowLeft, Play, ScanLine, ArrowRight, X, Volume2, VolumeX, MessageCircle, Send, Loader2 } from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { animals } from "@/lib/data";
import { useState, useRef, useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { useUser } from "@/lib/user";
import { AnimatePresence } from "framer-motion";
import SaveProgressModal from "@/components/SaveProgressModal";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
  const { t, dir, language } = useLanguage();
  const { user, isLoading: userLoading } = useUser();
  const { recordVideoWatch, hasWatched } = useProgress();

  const animal = animals.find((a) => a.id === params?.id);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isArOpen, setIsArOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [hasRecordedWatch, setHasRecordedWatch] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceoverRef = useRef<HTMLAudioElement>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAnimalIdRef = useRef<string | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when animal changes
  useEffect(() => {
    if (animal && animal.id !== currentAnimalIdRef.current) {
      currentAnimalIdRef.current = animal.id;
      setWatchTime(0);
      setHasRecordedWatch(hasWatched(animal.id));
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
                  // Prompt guest to save progress
                  if (!user) {
                    setTimeout(() => {
                      setShowSaveModal(true);
                    }, 500);
                  }
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
  useEffect(() => {
    if (animal?.video) {
      setIsPlaying(true);
    }
  }, [animal?.video]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isAiLoading || !animal) return;
    
    // Guests can't use AI guide - need to save progress first
    if (!user) {
      setChatMessages(prev => [...prev, 
        { role: "user", content: chatInput.trim() },
        { role: "assistant", content: language === 'en' 
          ? "Please save your progress first to use the AI Wildlife Guide." 
          : "يرجى حفظ تقدمك أولاً لاستخدام مرشد الحياة البرية." }
      ]);
      setChatInput("");
      return;
    }
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsAiLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/animal-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          animalId: animal.id,
          animalName: t(`animals.${animal.id}`),
          scientificName: animal.scientificName,
          question: userMessage,
          language
        })
      });
      
      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "assistant", content: t("aiGuide.error") }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle video completion
  const handleVideoEnded = () => {
    setIsPlaying(false);
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
      
      {/* Background Media (Full Screen) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
        
        {/* Render either video or image as background */}
        {isPlaying && animal.video ? (
          <video 
            ref={videoRef}
            src={animal.video} 
            autoPlay 
            controls={false}
            playsInline
            loop={false}
            muted={isMuted}
            onEnded={handleVideoEnded}
            onClick={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={animal.image} 
            alt={t(`animals.${animal.id}`)}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
        <Link href="/gallery">
          <button 
            className={`p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
            data-testid="button-back-to-gallery"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
        </Link>
        
        {/* Watch progress indicator */}
        {isPlaying && !hasRecordedWatch && (
          <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
            <span className="text-xs text-white/70">
              {watchTime < MIN_WATCH_TIME 
                ? `${MIN_WATCH_TIME - watchTime}s ${language === 'en' ? 'to earn points' : 'لكسب النقاط'}`
                : language === 'en' ? 'Points earned!' : 'تم كسب النقاط!'}
            </span>
          </div>
        )}
      </div>

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

      {/* Stop/Close Button for Video */}
      {isPlaying && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
           {/* Volume Controls */}
           <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full p-2 pr-4">
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 rounded-full text-white hover:bg-white/10 transition-colors"
                data-testid="button-toggle-mute"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-24 accent-white h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                data-testid="input-volume"
              />
           </div>

           <button 
              onClick={() => setIsPlaying(false)}
              className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
              data-testid="button-stop-video"
            >
              <X className="w-6 h-6" />
            </button>
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
              allow="camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; microphone; web-share"
              allowFullScreen
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

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 flex flex-col gap-6">
        
        {/* Name Block */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center"
        >
          <h1 className="font-serif text-2xl font-bold text-white mb-1">
            {t(`animals.${animal.id}`)}
          </h1>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-white/60">
            {animal.scientificName}
          </p>
        </motion.div>

        {/* Action Buttons Row */}
        <div className="flex gap-3">
          {/* AR Button */}
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setIsArOpen(true)}
            className="flex-1 bg-[#8B6B58] hover:bg-[#7A5C4A] text-white/90 font-medium py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-between px-6 group"
            data-testid="button-enter-ar"
          >
            <ScanLine className="w-5 h-5 opacity-70" />
            <span className="text-sm tracking-widest uppercase flex-1 text-center">
              {t("detail.enterAr")}
            </span>
            <ArrowRight className={`w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </motion.button>
          
          {/* AI Guide Button */}
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-[#8B6B58] hover:bg-[#7A5C4A] text-white/90 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center group"
            data-testid="button-open-ai-guide"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
          </motion.button>
        </div>

      </div>

      {/* AI Wildlife Guide Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#2A1F1A]"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#3E2D24]">
              <h2 className="font-serif text-lg font-bold text-[#D4A045]">
                {t("aiGuide.title")}
              </h2>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                data-testid="button-close-ai-guide"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Animal Info */}
            <div className="flex items-center gap-4 p-4 bg-black/20 border-b border-white/5">
              <img 
                src={animal.image} 
                alt={t(`animals.${animal.id}`)}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="text-white font-medium">{t(`animals.${animal.id}`)}</p>
                <p className="text-white/50 text-xs italic">{animal.scientificName}</p>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.length === 0 && (
                <div className="text-center text-white/40 py-8">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t("aiGuide.placeholder")}</p>
                </div>
              )}
              
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? (dir === 'rtl' ? 'justify-start' : 'justify-end') : (dir === 'rtl' ? 'justify-end' : 'justify-start')}`}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-[#D4A045] text-white' 
                        : 'bg-[#3E2D24] text-white/90 border border-white/10'
                    }`}
                    data-testid={`chat-message-${msg.role}-${idx}`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isAiLoading && (
                <div className={`flex ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-[#3E2D24] text-white/70 px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t("aiGuide.thinking")}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-white/10 bg-[#3E2D24]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder={t("aiGuide.placeholder")}
                  className="flex-1 bg-black/30 text-white placeholder-white/40 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#D4A045]/50"
                  data-testid="input-ai-question"
                  disabled={isAiLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isAiLoading || !chatInput.trim()}
                  className="w-12 h-12 bg-[#D4A045] hover:bg-[#c4923e] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center"
                  data-testid="button-send-ai-question"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
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
