import React from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";

const animalSilhouettes = [
  { id: 1, animal: "flamingo", size: "large", delay: 0.2 },
  { id: 2, animal: "oryx", size: "medium", delay: 0.4 },
  { id: 3, animal: "lizard", size: "small", delay: 0.3 },
  { id: 4, animal: "gazelle", size: "medium", delay: 0.5 },
  { id: 5, animal: "bird", size: "small", delay: 0.6 },
  { id: 6, animal: "owl", size: "medium", delay: 0.35 },
  { id: 7, animal: "fox", size: "small", delay: 0.45 },
  { id: 8, animal: "hare", size: "medium", delay: 0.55 },
];

const AnimalTile = ({ animal, size, delay, index }: { animal: string; size: string; delay: number; index: number }) => {
  const sizes = {
    small: "w-16 h-16",
    medium: "w-20 h-24",
    large: "w-24 h-32"
  };

  const silhouettes: Record<string, JSX.Element> = {
    flamingo: (
      <svg viewBox="0 0 100 150" className="w-full h-full">
        <path d="M50 10 Q55 30 52 50 Q48 70 50 90 L48 140 M52 140 L50 90 M50 50 Q40 45 35 35 Q45 40 50 45" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
    oryx: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <path d="M20 80 L30 60 L50 50 L80 55 L100 70 L95 85 L85 90 L70 88 L50 85 L30 88 L20 80 M50 50 L55 30 L60 20 M50 50 L45 35 L40 25 M80 55 L85 50 L90 45" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
    lizard: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <path d="M10 30 Q20 25 35 28 L70 30 Q85 28 100 35 L110 40 M35 28 L30 20 M35 28 L25 35 M70 30 L75 22 M70 30 L65 38" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
    gazelle: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M25 85 L30 65 L35 55 L50 50 L70 55 L75 70 L80 85 M50 50 L55 35 L52 20 M50 50 L60 40 L65 25 M70 55 L75 50" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
    bird: (
      <svg viewBox="0 0 100 80" className="w-full h-full">
        <path d="M10 40 Q30 35 50 40 Q70 45 85 35 L95 30 M50 40 L45 55 L40 70 M50 40 L55 50" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
    owl: (
      <svg viewBox="0 0 80 100" className="w-full h-full">
        <ellipse cx="40" cy="50" rx="25" ry="35" fill="currentColor"/>
        <circle cx="32" cy="40" r="8" fill="#E8DFD0"/>
        <circle cx="48" cy="40" r="8" fill="#E8DFD0"/>
        <path d="M25 20 L35 35 M55 20 L45 35" stroke="currentColor" strokeWidth="4" fill="none"/>
      </svg>
    ),
    fox: (
      <svg viewBox="0 0 100 80" className="w-full h-full">
        <path d="M15 60 L25 50 L40 45 L60 45 L80 55 L90 65 L75 70 L50 68 L25 70 L15 60 M40 45 L30 25 M60 45 L70 30 M80 55 L95 50" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
    hare: (
      <svg viewBox="0 0 80 100" className="w-full h-full">
        <path d="M30 85 L35 65 L40 55 L50 50 L55 60 L60 80 L55 90 M50 50 L45 35 L40 15 M50 50 L55 30 L60 10 M50 50 L60 45" 
          fill="currentColor" stroke="none"/>
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.6, ease: "easeOut" }}
      className={`${sizes[size as keyof typeof sizes]} bg-[#A67C52] rounded-lg flex items-center justify-center text-[#C4956A] p-2`}
    >
      {silhouettes[animal]}
    </motion.div>
  );
};

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
    setLocation("/intro");
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#E8DFD0]">
      
      {/* Floating Animal Grid Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top Left Cluster */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-8 left-4 flex flex-wrap gap-2 max-w-[180px]"
        >
          <AnimalTile animal="lizard" size="medium" delay={0.2} index={0} />
          <AnimalTile animal="flamingo" size="large" delay={0.4} index={1} />
        </motion.div>

        {/* Top Right Cluster */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-12 right-4 flex flex-col gap-2"
        >
          <AnimalTile animal="bird" size="small" delay={0.3} index={2} />
          <AnimalTile animal="oryx" size="medium" delay={0.5} index={3} />
        </motion.div>

        {/* Middle Left */}
        <motion.div 
          className="absolute top-1/3 left-2 flex flex-col gap-2"
        >
          <AnimalTile animal="gazelle" size="medium" delay={0.6} index={4} />
        </motion.div>

        {/* Middle Right */}
        <motion.div 
          className="absolute top-1/3 right-6 flex flex-col gap-2"
        >
          <AnimalTile animal="owl" size="small" delay={0.45} index={5} />
          <AnimalTile animal="hare" size="medium" delay={0.7} index={6} />
        </motion.div>

        {/* Bottom Decorative Elements */}
        <motion.div 
          className="absolute bottom-48 left-6 flex gap-2"
        >
          <AnimalTile animal="fox" size="small" delay={0.55} index={7} />
        </motion.div>

        {/* Animated Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              y: [0, -50, -100],
              x: [0, Math.random() * 20 - 10]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 rounded-full bg-[#A67C52]"
            style={{ 
              left: `${10 + Math.random() * 80}%`,
              bottom: `${20 + Math.random() * 30}%`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-between px-6 py-10 text-center">
        
        {/* Header Logos */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full flex justify-between items-start"
        >
          <div className="text-left">
            <p className="text-[8px] text-[#8B7355] tracking-wider uppercase">In collaboration with</p>
            <p className="text-[10px] text-[#8B7355] mt-0.5">بالتعاون مع</p>
            <p className="text-xs text-[#5D4E37] font-bold mt-1">Ali Khalifa Bin Thalith</p>
            <p className="text-[10px] text-[#8B7355]">علي خليفة بن ثالث</p>
          </div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Al Marmoom" className="h-8 w-auto" />
            <div className="w-px h-8 bg-[#A67C52]/30" />
            <img src="/dubai-culture-logo.png" alt="Dubai Culture" className="h-6 w-auto" />
          </div>
        </motion.div>

        {/* Center Title Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* Arabic Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-2"
          >
            <h1 className="font-arabic text-5xl text-[#3D2E1F] leading-tight font-bold">
              المرموم:
            </h1>
            <h2 className="font-arabic text-4xl text-[#3D2E1F] leading-tight mt-1">
              حياة البريّة
            </h2>
          </motion.div>

          {/* English Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <h3 className="text-2xl font-bold text-[#3D2E1F] tracking-wide">
              AL MARMOOM:
            </h3>
            <h4 className="text-xl text-[#3D2E1F] font-light">
              The Living Wild
            </h4>
          </motion.div>

          {/* Dates */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex items-center gap-4"
          >
            <div className="text-center">
              <span className="text-3xl font-bold text-[#3D2E1F]">30</span>
              <p className="text-xs text-[#8B7355] uppercase">January</p>
              <p className="text-[10px] text-[#8B7355] font-arabic">يناير</p>
            </div>
            <span className="text-2xl text-[#A67C52]">—</span>
            <div className="text-center">
              <span className="text-3xl font-bold text-[#3D2E1F]">8</span>
              <p className="text-xs text-[#8B7355] uppercase">February</p>
              <p className="text-[10px] text-[#8B7355] font-arabic">فبراير</p>
            </div>
            <span className="text-3xl font-bold text-[#A67C52] ml-2">2026</span>
          </motion.div>

          {/* Open at all times badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-4 bg-[#A67C52]/10 px-4 py-2 rounded-full"
          >
            <p className="text-[10px] text-[#8B7355] uppercase tracking-wider">
              Open at all times • مفتوح على مدار الساعة
            </p>
          </motion.div>
        </motion.div>

        {/* Language Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full max-w-sm space-y-3"
        >
          {/* Arabic Option */}
          <button 
            onClick={() => handleLanguageSelect("ar")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-[#A67C52] p-4 text-right transition-all hover:bg-[#8B6914] active:scale-95 shadow-lg"
            data-testid="button-arabic"
          >
            <ArrowRight className="h-5 w-5 text-white/80 rotate-180 group-hover:-translate-x-1 transition-all" />
            <span className="font-arabic text-xl text-white font-bold">ابدأ بالعربية</span>
          </button>

          {/* English Option */}
          <button 
            onClick={() => handleLanguageSelect("en")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-[#3D2E1F] p-4 text-left transition-all hover:bg-[#2A1F15] active:scale-95 shadow-lg"
            data-testid="button-english"
          >
            <span className="text-xl text-white font-bold">Start in English</span>
            <ArrowRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Al Marmoom Footer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-[10px] text-[#8B7355] tracking-widest uppercase text-center mt-6"
          >
            Al Marmoom Desert Conservation Reserve
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
