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

      {/* Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 z-10"
      >
        <img src="/logo.png" alt="Al Marmoom" className="w-48 h-auto mx-auto" />
      </motion.div>

      {/* Main Form Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm flex-1 flex flex-col justify-center z-10"
      >
        <h2 className="text-center font-serif text-lg md:text-xl tracking-wider leading-relaxed mb-12 whitespace-pre-line text-primary/90">
          {t("signup.title")}
        </h2>

        <div className="space-y-4 mb-8">
          <div className="space-y-1">
            <Input 
              type="text" 
              placeholder={t("signup.fullName")}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-primary/50 focus:ring-primary/20 backdrop-blur-sm"
              dir={dir}
            />
          </div>

          <div className="space-y-1">
             <Select>
              <SelectTrigger className="bg-white/5 border-white/10 text-white/40 h-12 rounded-lg focus:ring-primary/20 backdrop-blur-sm w-full text-start" dir={dir}>
                <SelectValue placeholder={t("signup.mobile")} />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 text-white">
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
          className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-4 rounded-xl transition-all active:scale-[0.98] mb-6"
        >
          {t("signup.continue")}
        </button>

        <p className="text-center text-[10px] text-white/40 leading-relaxed whitespace-pre-line">
          {t("signup.terms")}
        </p>
      </motion.div>
    </div>
  );
}
