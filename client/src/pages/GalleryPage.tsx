import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Shield, Bookmark, Star, QrCode, Lock, Trophy, Crown, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { watchedVideos, points, isUnlocked, isCollectionComplete, unlockedCount, totalAnimals } = useProgress();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasSeenCompletion, setHasSeenCompletion] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
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
        setShowSwipeHint(false);
      });
    }
  }, [emblaApi]);

  // Auto-hide swipe hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, chunkSize]);

  // Show completion celebration when all animals unlocked (only once)
  useEffect(() => {
    if (isCollectionComplete && !hasSeenCompletion) {
      const seenKey = user ? `completion_seen_${user.id}` : 'completion_seen_guest';
      const alreadySeen = localStorage.getItem(seenKey);
      if (!alreadySeen) {
        setShowCompletionModal(true);
        localStorage.setItem(seenKey, 'true');
      }
      setHasSeenCompletion(true);
    }
  }, [isCollectionComplete, hasSeenCompletion, user]);

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
    localStorage.removeItem("unlockedAnimals");
    localStorage.removeItem("points");
    localStorage.removeItem("completion_seen_guest");
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
        className="px-6 mb-6 z-10 relative"
      >
        <div className="flex justify-between items-end mb-4">
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
        </div>

        {/* Completion Badge or Progress */}
        {isCollectionComplete ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-2xl p-3 flex items-center gap-3 shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">
                {language === 'en' ? 'Collection Master!' : 'سيد المجموعة!'}
              </p>
              <p className="text-white/80 text-xs">
                {language === 'en' ? 'You unlocked all 24 animals' : 'لقد فتحت جميع الحيوانات الـ 24'}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
        ) : (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/10">
            <div className="flex-1">
              <p className="text-white/60 text-xs mb-1">
                {language === 'en' ? 'Collection Progress' : 'تقدم المجموعة'}
              </p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalAnimals) * 100}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
            <span className="text-white font-bold text-lg">
              {unlockedCount}/{totalAnimals}
            </span>
          </div>
        )}
      </motion.div>

      {/* Carousel */}
      <div className="flex-1 overflow-hidden touch-pan-y relative" ref={emblaRef} dir={dir}>
        <div className="flex h-full touch-pan-y backface-hidden will-change-transform">
          {chunks.map((chunk, pageIndex) => (
            <div className="flex-[0_0_100%] min-w-0 pl-6 pr-6 relative overflow-y-auto" key={pageIndex}>
              <div className="grid grid-cols-2 gap-6 pb-4">
                {chunk.map((animal, animalIndex) => {
                  const watched = watchedVideos.includes(animal.id);
                  const unlocked = isUnlocked(animal.id);
                  
                  return (
                    <motion.div 
                      key={animal.id} 
                      className="relative"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: animalIndex * 0.05,
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      {unlocked ? (
                        <Link href={`/animal/${animal.id}`}>
                          <motion.div 
                            className="flex flex-col items-center gap-3 text-center cursor-pointer group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-primary/50 transition-colors duration-300 group-hover:shadow-[0_0_30px_rgba(185,125,66,0.3)]">
                              <img 
                                src={animal.optimizedImage} 
                                alt={t(`animals.${animal.id}`)}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
                                loading={pageIndex === 0 ? "eager" : "lazy"}
                                decoding="async"
                                onError={(e) => { e.currentTarget.src = animal.image; }}
                              />
                              {watched && (
                                <motion.div 
                                  className="absolute top-1 right-1 bg-primary rounded-full p-1"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                  <Star className="w-3 h-3 text-white fill-white" />
                                </motion.div>
                              )}
                            </div>
                            <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-white/80 h-8 flex items-center justify-center group-hover:text-primary transition-colors duration-300">
                              {t(`animals.${animal.id}`)}
                            </span>
                          </motion.div>
                        </Link>
                      ) : (
                        <motion.div 
                          className="flex flex-col items-center gap-3 text-center cursor-pointer group"
                          onClick={() => setLocation("/scan")}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-white/20 transition-all duration-300">
                            <img 
                              src={animal.optimizedImage} 
                              alt={t(`animals.${animal.id}`)}
                              className="w-full h-full object-cover grayscale blur-sm opacity-50 group-hover:opacity-60 transition-opacity duration-300"
                              loading={pageIndex === 0 ? "eager" : "lazy"}
                              decoding="async"
                              onError={(e) => { e.currentTarget.src = animal.image; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Lock className="w-8 h-8 text-white/70" />
                              </motion.div>
                            </div>
                          </div>
                          <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-white/40 h-8 flex items-center justify-center group-hover:text-white/60 transition-colors duration-300">
                            {language === 'en' ? 'Scan to Unlock' : 'امسح للفتح'}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Swipe Hint Animation */}
        <AnimatePresence>
          {showSwipeHint && chunks.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              {/* Left/Right Edge Indicators */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/40 to-transparent flex items-center justify-start pl-2">
                <motion.div
                  animate={{ x: [-5, 5, -5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronLeft className="w-8 h-8 text-white/60" />
                </motion.div>
              </div>
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/40 to-transparent flex items-center justify-end pr-2">
                <motion.div
                  animate={{ x: [5, -5, 5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronRight className="w-8 h-8 text-white/60" />
                </motion.div>
              </div>

              {/* Bottom Text Hint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2"
              >
                <motion.div
                  animate={{ x: [-8, 8, -8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4 text-primary" />
                  <span className="text-white/80 text-xs font-medium">
                    {language === 'en' ? 'Swipe for more' : 'اسحب للمزيد'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Scanner Button - Large Bottom Center */}
      <div className="flex justify-center py-4 relative z-20 shrink-0">
        <motion.button
          onClick={() => setLocation("/scan")}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#b97d42] to-[#855338] text-white rounded-full shadow-lg shadow-[#b97d42]/30 relative overflow-hidden"
          whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(185,125,66,0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          data-testid="button-qr-scan"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
          />
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <QrCode className="h-6 w-6 relative z-10" />
          </motion.div>
          <span className="font-semibold text-base relative z-10">
            {language === 'en' ? 'Scan to Unlock Animals' : 'امسح لفتح الحيوانات'}
          </span>
        </motion.button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 py-2 relative z-20 shrink-0">
        {chunks.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer border border-transparent hover:border-white/50 ${
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

      {/* Collection Complete Celebration Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCompletionModal(false)}
            />

            {/* Celebration Card */}
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCompletionModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Trophy Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white font-serif mb-2"
                >
                  {language === 'en' ? 'Congratulations!' : 'تهانينا!'}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-lg mb-6"
                >
                  {language === 'en' 
                    ? "You've unlocked all 24 animals!" 
                    : "لقد فتحت جميع الحيوانات الـ 24!"}
                </motion.p>

                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 mb-6"
                >
                  <Crown className="w-8 h-8 text-white" />
                  <div className="text-left">
                    <p className="text-white font-bold">
                      {language === 'en' ? 'Collection Master' : 'سيد المجموعة'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {language === 'en' ? 'Badge Earned!' : 'تم الحصول على الشارة!'}
                    </p>
                  </div>
                </motion.div>

                {/* Message */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/80 text-sm leading-relaxed mb-6"
                >
                  {language === 'en' 
                    ? "You are now one of the elite explorers who have discovered every animal in The Living Wild collection. Your badge will always be displayed on your profile!"
                    : "أنت الآن من المستكشفين النخبة الذين اكتشفوا كل حيوان في مجموعة الحياة البرية. ستظهر شارتك دائمًا على ملفك الشخصي!"}
                </motion.p>

                {/* Close Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full bg-white text-[#FF8C00] font-bold py-4 rounded-xl text-lg transition-all active:scale-[0.98] shadow-lg"
                >
                  {language === 'en' ? 'Amazing!' : 'رائع!'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
