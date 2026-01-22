import { motion } from "framer-motion";
import { ArrowLeft, Play, ScanLine, ArrowRight, X, Camera, Volume2, VolumeX } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useLanguage } from "@/lib/language";
import { animals } from "@/lib/data";
import { useState, useRef, useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { AnimatePresence } from "framer-motion";

const voiceoverMap: Record<string, { en: string; ar: string }> = {
  eurasian_stone_curlew: {
    en: "/videos/stone_curlew_en.mp3",
    ar: "/videos/stone_curlew_ar.mp3"
  }
};

export default function AnimalDetailPage() {
  const [, params] = useRoute("/animal/:id");
  const { t, dir, language } = useLanguage();
  const { unlockNext, watchedCount } = useProgress();
  const animal = animals.find((a) => a.id === params?.id);
  // Auto-play if video exists
  const [isPlaying, setIsPlaying] = useState(!!animal?.video);
  const [isArOpen, setIsArOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showNotification, setShowNotification] = useState<"keepGoing" | "entered" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceoverRef = useRef<HTMLAudioElement>(null);

  // Handle video completion
  const handleVideoEnded = () => {
    if (animal) {
      unlockNext(animal.id);
      
      // Check milestones (using watchedCount + 1 because the update in context might not be reflected immediately in this render cycle)
      // Actually, relying on the prop updated value is safer in a useEffect, but for simplicity:
      // We know we just watched one.
      const newCount = watchedCount + 1;
      
      if (newCount === 1) {
        setShowNotification("keepGoing");
      } else if (newCount === 10) {
        setShowNotification("entered");
      }
    }
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
            controls={false} // Hide default controls for seamless look
            playsInline
            loop={false}
            muted={isMuted}
            onEnded={handleVideoEnded}
            onClick={() => setIsPlaying(false)} // Click to stop/pause
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
          <button className={`p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}>
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
        </Link>
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
              />
           </div>

           <button 
              onClick={() => setIsPlaying(false)}
              className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
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

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNotification(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#3E2D24] border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl"
            >
              <h3 className="font-serif text-2xl font-bold text-[#D4A045] mb-4">
                {t(`notification.${showNotification}.title`)}
              </h3>
              <p className="text-white/80 leading-relaxed mb-8">
                {t(`notification.${showNotification}.message`)}
              </p>
              <button
                onClick={() => setShowNotification(null)}
                className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                {t("notification.button")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

        {/* AR Button */}
        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsArOpen(true)}
          className="w-full bg-[#8B6B58] hover:bg-[#7A5C4A] text-white/90 font-medium py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-between px-6 group"
        >
          <ScanLine className="w-5 h-5 opacity-70" />
          <span className="text-sm tracking-widest uppercase flex-1 text-center">
            {t("detail.enterAr")}
          </span>
          <ArrowRight className={`w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </motion.button>

      </div>

    </div>
  );
}
