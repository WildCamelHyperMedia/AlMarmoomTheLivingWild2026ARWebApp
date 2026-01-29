import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Gift, Shield, User, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { useProgress } from "@/lib/progress";

interface SaveProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SaveProgressModal({ isOpen, onClose, onSuccess }: SaveProgressModalProps) {
  const { language, dir } = useLanguage();
  const { setUser } = useUser();
  const { watchedVideos, points, unlockedCount } = useProgress();
  
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setError(language === 'en' ? "Please fill in all fields" : "يرجى ملء جميع الحقول");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(language === 'en' ? "Please enter a valid email" : "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/guest-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email,
          watchedVideos: watchedVideos,
          points: points
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Failed to save progress" : "فشل في حفظ التقدم"));
      }

      setUser(data.user, data.token, data.expiresAt);
      localStorage.removeItem("watchedVideos");
      localStorage.removeItem("points");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      textEn: "Enter the exclusive prize draw",
      textAr: "ادخل السحب الحصري على الجوائز"
    },
    {
      icon: Shield,
      textEn: "Keep your progress safe forever",
      textAr: "احتفظ بتقدمك بشكل آمن للأبد"
    },
    {
      icon: Sparkles,
      textEn: "Unlock special achievements",
      textAr: "افتح الإنجازات الخاصة"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Card */}
            <div className="bg-gradient-to-b from-[#1a1210] to-[#0d0908] rounded-3xl border border-[#3d2a20] shadow-2xl overflow-hidden">
              
              {/* Header with gradient accent */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#b97d42]/30 via-[#d4a574]/20 to-[#b97d42]/30" />
                <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5" />
                
                <div className="relative px-6 pt-6 pb-4">
                  {/* Close button */}
                  <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    data-testid="button-close-modal"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>

                  {/* Icon and title */}
                  <div className="flex flex-col items-center text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b97d42] to-[#855338] flex items-center justify-center mb-4 shadow-lg shadow-[#b97d42]/30"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h2 className="text-2xl font-bold text-white font-serif mb-1">
                      {language === 'en' ? 'Save Your Journey' : 'احفظ رحلتك'}
                    </h2>
                    <p className="text-white/50 text-sm">
                      {language === 'en' 
                        ? `${unlockedCount} animals discovered • ${points} points earned` 
                        : `${unlockedCount} حيوانات مكتشفة • ${points} نقاط مكتسبة`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="px-6 py-4 space-y-2">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#b97d42]/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-4 h-4 text-[#b97d42]" />
                    </div>
                    <span className="text-white/70">
                      {language === 'en' ? benefit.textEn : benefit.textAr}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Form */}
              <div className="px-6 pb-6 pt-2">
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-5 h-5 text-white/30" />
                    </div>
                    <Input 
                      type="text" 
                      placeholder={language === 'en' ? "Your Name" : "اسمك"}
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 h-14 rounded-xl focus:ring-2 focus:ring-[#b97d42]/50 focus:border-[#b97d42]/50 pl-12 pr-4 text-base transition-all"
                      dir={dir}
                      data-testid="input-save-name"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="w-5 h-5 text-white/30" />
                    </div>
                    <Input 
                      type="email" 
                      placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 h-14 rounded-xl focus:ring-2 focus:ring-[#b97d42]/50 focus:border-[#b97d42]/50 pl-12 pr-4 text-base transition-all"
                      dir="ltr"
                      data-testid="input-save-email"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-3 rounded-lg" 
                        data-testid="text-save-error"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Save Button */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#b97d42] via-[#d4a574] to-[#b97d42] bg-[length:200%_100%] hover:bg-right text-white font-bold py-4 rounded-xl transition-all duration-500 shadow-lg shadow-[#b97d42]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-save-progress"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    <>
                      {language === 'en' ? 'Save & Continue' : 'حفظ ومتابعة'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                {/* Skip link */}
                <button 
                  onClick={onClose}
                  className="w-full mt-4 text-white/40 text-sm hover:text-white/60 transition-colors py-2"
                  data-testid="button-skip-save"
                >
                  {language === 'en' ? 'Continue as Guest' : 'تابع كضيف'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
