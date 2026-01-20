import { motion } from "framer-motion";
import { ArrowLeft, Lock, Globe } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect, useMemo } from "react";
import { animals } from "@/lib/data";
import { useProgress } from "@/lib/progress";

function useResponsiveChunkSize() {
  const [chunkSize, setChunkSize] = useState(6);

  useEffect(() => {
    const updateChunkSize = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      if (height < 700) {
        setChunkSize(6);
      } else if (height < 850) {
        setChunkSize(9);
      } else if (width >= 768) {
        setChunkSize(12);
      } else {
        setChunkSize(9);
      }
    };

    updateChunkSize();
    window.addEventListener("resize", updateChunkSize);
    return () => window.removeEventListener("resize", updateChunkSize);
  }, []);

  return chunkSize;
}

export default function GalleryPage() {
  const { t, dir } = useLanguage();
  const { isUnlocked, watchedCount } = useProgress();
  const chunkSize = useResponsiveChunkSize();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    direction: dir,
    duration: 20,
    skipSnaps: false,
    dragFree: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, chunkSize]);

  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < animals.length; i += chunkSize) {
      result.push(animals.slice(i, i + chunkSize));
    }
    return result;
  }, [chunkSize]);

  return (
    <div className="h-[100dvh] w-full bg-background text-white pb-20 relative overflow-y-auto flex flex-col">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 z-10 relative">
        <Link href="/intro">
          <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}>
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-8 z-10 relative flex justify-between items-end"
      >
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
          {t("gallery.title")}
        </h1>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/50 font-sans tracking-widest uppercase mb-1">
            {t("gallery.watched")}
          </span>
          <div className="flex items-baseline gap-1">
             <span className="font-serif text-2xl font-bold text-primary">
               {watchedCount}
             </span>
             <span className="text-sm text-white/50">
               / {animals.length}
             </span>
          </div>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="flex-1 overflow-hidden touch-pan-y" ref={emblaRef} dir={dir}>
        <div className="flex h-full touch-pan-y backface-hidden will-change-transform">
          {chunks.map((chunk, pageIndex) => (
            <div className="flex-[0_0_100%] min-w-0 pl-6 pr-6 relative overflow-y-auto" key={pageIndex}>
              <div className="grid grid-cols-3 gap-y-6 gap-x-4 pb-4">
                {chunk.map((animal) => {
                  const unlocked = isUnlocked(animal.id);
                  
                  return (
                    <div key={animal.id} className="relative">
                      {unlocked ? (
                        <Link href={`/animal/${animal.id}`}>
                          <div className="flex flex-col items-center gap-3 text-center cursor-pointer group">
                            <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-primary/50 transition-colors duration-300">
                              <img 
                                src={animal.image} 
                                alt={t(`animals.${animal.id}`)}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
                                loading={pageIndex === 0 ? "eager" : "lazy"}
                                decoding="async"
                              />
                            </div>
                            <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-white/80 h-8 flex items-center justify-center group-hover:text-primary transition-colors duration-300">
                              {t(`animals.${animal.id}`)}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-primary/20 bg-black/40">
                            <img 
                              src={animal.image} 
                              alt={t(`animals.${animal.id}`)}
                              className="w-full h-full object-cover blur-[2px] brightness-[0.4] sepia-[0.3]"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-primary/10" />
                              <Lock className="w-8 h-8 text-[#D4A045] drop-shadow-[0_0_8px_rgba(212,160,69,0.6)]" />
                            </div>
                          </div>
                          <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-primary/40 h-8 flex items-center justify-center">
                            {t(`animals.${animal.id}`)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 py-4 relative z-20 shrink-0">
        {chunks.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 cursor-pointer border border-transparent hover:border-white/50 ${
              index === selectedIndex ? "bg-white scale-110" : "bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      {/* Launch 3D World Button */}
      <div className="px-6 pb-6 relative z-20 shrink-0">
        <Link href="/world3d">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-gradient-to-r from-[#D4A045] to-[#E8B84A] hover:from-[#C4923E] hover:to-[#D4A045] text-white font-medium py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg"
            data-testid="button-launch-3d"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm tracking-widest uppercase font-bold">
              {t("gallery.launch3d") || "Launch 3D World"}
            </span>
          </motion.button>
        </Link>
      </div>

    </div>
  );
}
