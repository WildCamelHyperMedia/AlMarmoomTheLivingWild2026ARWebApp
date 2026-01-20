import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect, useMemo } from "react";
import { animals } from "@/lib/data";

export default function GalleryPage() {
  const { t, dir } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    direction: dir,
    duration: 20, // Faster snap
    skipSnaps: false,
    dragFree: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  // Load progress
  useEffect(() => {
    const watched = JSON.parse(localStorage.getItem("watchedAnimals") || "[]");
    setWatchedCount(watched.length);
  }, []);

  // Chunk animals into groups of 12 for pagination
  const chunks = useMemo(() => {
    const chunkSize = 12;
    const result = [];
    for (let i = 0; i < animals.length; i += chunkSize) {
      result.push(animals.slice(i, i + chunkSize));
    }
    return result;
  }, []);

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

        {/* Watch Counter */}
        <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-sm font-medium text-white/90 tracking-widest font-sans">
            {watchedCount} / {animals.length}
          </span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-8 z-10 relative"
      >
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
          {t("gallery.title")}
        </h1>
      </motion.div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef} dir={dir}>
        <div className="flex touch-pan-y backface-hidden will-change-transform">
          {chunks.map((chunk, pageIndex) => (
            <div className="flex-[0_0_100%] min-w-0 pl-6 pr-6 relative" key={pageIndex}>
              <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                {chunk.map((animal, index) => {
                  const globalIndex = pageIndex * 12 + index;
                  // First animal (index 0) is always unlocked
                  // Subsequent animals unlock if globalIndex <= watchedCount
                  // Example: 0 watched. Index 0 unlocked (0 <= 0). Index 1 locked (1 > 0).
                  // Example: 1 watched. Index 0 unlocked. Index 1 unlocked (1 <= 1). Index 2 locked (2 > 1).
                  const isLocked = globalIndex > watchedCount;

                  return (
                    <div key={animal.id} className="relative">
                      {isLocked ? (
                        <div className="flex flex-col items-center gap-3 text-center opacity-60 pointer-events-none select-none grayscale">
                          <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white/5 shadow-none">
                            <img 
                              src={animal.image} 
                              alt={t(`animals.${animal.id}`)}
                              className="w-full h-full object-cover"
                              loading={pageIndex === 0 ? "eager" : "lazy"}
                            />
                            {/* Lock Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <Lock className="w-8 h-8 text-[#D4A045]" />
                            </div>
                          </div>
                          <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-white/50 h-8 flex items-center justify-center">
                            {t(`animals.${animal.id}`)}
                          </span>
                        </div>
                      ) : (
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
      <div className="flex justify-center gap-3 mt-12">
        {chunks.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "bg-white scale-110" : "bg-white/20"
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
