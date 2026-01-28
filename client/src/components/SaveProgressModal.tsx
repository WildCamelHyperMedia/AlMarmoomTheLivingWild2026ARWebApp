import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark } from "lucide-react";
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
  const { watchedVideos, points } = useProgress();
  
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#2C1810] rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {language === 'en' ? 'Save Your Progress' : 'احفظ تقدمك'}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <p className="text-white/60 text-sm mb-6">
              {language === 'en' 
                ? 'Enter your details to save your progress and enter the prize draw!' 
                : 'أدخل بياناتك لحفظ تقدمك والدخول في السحب على الجوائز!'}
            </p>

            <div className="space-y-3 mb-4">
              <Input 
                type="text" 
                placeholder={language === 'en' ? "Your Name" : "اسمك"}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-12 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                dir={dir}
                data-testid="input-save-name"
              />

              <Input 
                type="email" 
                placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-12 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                dir="ltr"
                data-testid="input-save-email"
              />
              
              {error && (
                <p className="text-red-400 text-sm text-center" data-testid="text-save-error">{error}</p>
              )}
            </div>

            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-[#b97d42] hover:bg-[#855338] text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-save-progress"
            >
              {isLoading 
                ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') 
                : (language === 'en' ? 'Save & Continue' : 'حفظ ومتابعة')}
            </button>

            <button 
              onClick={onClose}
              className="w-full mt-3 text-white/50 text-sm hover:text-white/80 transition-colors py-2"
              data-testid="button-skip-save"
            >
              {language === 'en' ? 'Maybe Later' : 'ربما لاحقاً'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
