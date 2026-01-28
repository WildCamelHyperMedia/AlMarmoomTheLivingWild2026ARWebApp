import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Shield, Bookmark, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect, useMemo } from "react";
import { animals } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { useUser } from "@/lib/user";
import SaveProgressModal from "@/components/SaveProgressModal";

const ANIMALS_PER_PAGE = 8;

export default function GalleryPage() {
  const [, setLocation] = useLocation();
  const { t, dir, language } = useLanguage();
  const { user, logout, isLoading } = useUser();
  const { watchedVideos, points } = useProgress();
  const chunkSize = ANIMALS_PER_PAGE;
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    direction: dir,
    duration: 20,
    skipSnaps: false,
    dragFree: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);

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

  const handleLogout = () => {
    logout();
    localStorage.removeItem("watchedVideos");
    localStorage.removeItem("points");
    setLocation("/");
  };

  const handleSaveSuccess = () => {
    setShowSaveModal(false);
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-background text-white pb-20 relative overflow-y-auto flex flex-col">
      
      {/* Desert Dunes Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/desert-dunes.jpg')" }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 z-10 relative">
        <button 
          onClick={() => setLocation("/intro")}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        
        <div className="flex items-center gap-2">
          {user?.isAdmin && (
            <button 
              onClick={() => setLocation("/admin")}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              data-testid="button-admin"
              title={language === 'en' ? 'Admin Dashboard' : 'لوحة الإدارة'}
            >
              <Shield className="h-5 w-5 text-[#b97d42]" />
            </button>
          )}
          {!user && (
            <>
              <button 
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
                data-testid="button-save-progress-header"
              >
                <Bookmark className="h-4 w-4 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {language === 'en' ? 'Save' : 'حفظ'}
                </span>
              </button>
              <button 
                onClick={() => setLocation("/auth")}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                data-testid="button-login"
                title={language === 'en' ? 'Login' : 'تسجيل الدخول'}
              >
                <Shield className="h-5 w-5 text-white/40 hover:text-white/60" />
              </button>
            </>
          )}
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
        </div>
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
            {language === 'en' ? 'Points' : 'النقاط'}
          </span>
          <div className="flex items-baseline gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="font-serif text-2xl font-bold text-primary">
              {points}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="flex-1 overflow-hidden touch-pan-y" ref={emblaRef} dir={dir}>
        <div className="flex h-full touch-pan-y backface-hidden will-change-transform">
          {chunks.map((chunk, pageIndex) => (
            <div className="flex-[0_0_100%] min-w-0 pl-6 pr-6 relative overflow-y-auto" key={pageIndex}>
              <div className="grid grid-cols-2 gap-6 pb-4">
                {chunk.map((animal) => {
                  const watched = watchedVideos.includes(animal.id);
                  
                  return (
                    <div key={animal.id} className="relative">
                      <Link href={`/animal/${animal.id}`}>
                        <div className="flex flex-col items-center gap-3 text-center cursor-pointer group">
                          <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-primary/50 transition-colors duration-300">
                            <img 
                              src={animal.optimizedImage} 
                              alt={t(`animals.${animal.id}`)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
                              loading={pageIndex === 0 ? "eager" : "lazy"}
                              decoding="async"
                              onError={(e) => { e.currentTarget.src = animal.image; }}
                            />
                            {watched && (
                              <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                                <Star className="w-3 h-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-white/80 h-8 flex items-center justify-center group-hover:text-primary transition-colors duration-300">
                            {t(`animals.${animal.id}`)}
                          </span>
                        </div>
                      </Link>
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

      <SaveProgressModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}
