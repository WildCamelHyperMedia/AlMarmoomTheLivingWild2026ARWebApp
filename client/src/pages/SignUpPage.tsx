import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const { t, language, dir } = useLanguage();

  const handleContinue = () => {
    setLocation("/intro");
  };

  return (
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-6 py-8 relative overflow-hidden">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-12 z-10">
        <button 
          onClick={() => window.history.back()}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
      >
        {/* Title Section - Grouped together at the top */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-5xl md:text-6xl tracking-tight mb-6 font-sans">
            {t("signup.header")}
          </h1>
          <h2 className="text-center font-sans text-xs md:text-sm font-bold tracking-[0.15em] leading-relaxed whitespace-pre-line text-white uppercase">
            {t("signup.title")}
          </h2>
        </div>

        {/* Spacer to push form down slightly if needed, or keep it centered */}
        <div className="flex-1"></div>

        <div className="w-full space-y-4 mb-8">
          <div className="space-y-1">
            <Input 
              type="text" 
              placeholder={t("signup.fullName")}
              className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
              dir={dir}
            />
          </div>

          <div className="space-y-1">
             <Select>
              <SelectTrigger className="bg-[#3E2D24]/80 border-none text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm w-full text-start px-4" dir={dir}>
                <SelectValue placeholder={t("signup.mobile")} />
              </SelectTrigger>
              <SelectContent className="bg-[#3E2D24] border-white/10 text-white">
                <SelectItem value="ae">+971 (UAE)</SelectItem>
                <SelectItem value="sa">+966 (KSA)</SelectItem>
                <SelectItem value="uk">+44 (UK)</SelectItem>
                <SelectItem value="us">+1 (USA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mb-6 shadow-lg"
        >
          {t("signup.continue")}
        </button>

        <p className="text-center text-[10px] text-white/50 leading-relaxed whitespace-pre-line mb-8">
          {t("signup.terms")}
        </p>
      </motion.div>
    </div>
  );
}
