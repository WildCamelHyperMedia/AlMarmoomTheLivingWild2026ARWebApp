import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, User, Mail, Loader2, Phone, Camera, Book, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { useProgress } from "@/lib/progress";
import { trackRegistration } from "@/lib/activityTracker";

interface SaveProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SaveProgressModal({ isOpen, onClose, onSuccess }: SaveProgressModalProps) {
  const { language, dir, t } = useLanguage();
  const { setUser } = useUser();
  const { watchedVideos, points, unlockedCount, unlockedAnimals } = useProgress();
  
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", phoneCode: "+971" });

  const countryCodes = [
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+966", country: "KSA", flag: "🇸🇦" },
    { code: "+974", country: "Qatar", flag: "🇶🇦" },
    { code: "+973", country: "Bahrain", flag: "🇧🇭" },
    { code: "+968", country: "Oman", flag: "🇴🇲" },
    { code: "+965", country: "Kuwait", flag: "🇰🇼" },
    { code: "+962", country: "Jordan", flag: "🇯🇴" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+92", country: "Pakistan", flag: "🇵🇰" },
    { code: "+63", country: "Philippines", flag: "🇵🇭" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
  ];
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
          phone: formData.phone ? `${formData.phoneCode}${formData.phone}` : "",
          watchedVideos: watchedVideos,
          unlockedAnimals: unlockedAnimals,
          points: points
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Failed to save progress" : "فشل في حفظ التقدم"));
      }

      setUser(data.user, data.token, data.expiresAt);
      // Track guest registration for analytics
      trackRegistration(formData.email);
      localStorage.removeItem("watchedVideos");
      localStorage.removeItem("unlockedAnimals");
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[#fef3dc] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Top Bar */}
            <div className="h-2 bg-gradient-to-r from-[#b97d42] via-[#d3bea5] to-[#b97d42]" />
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#30221b]/10 hover:bg-[#30221b]/20 flex items-center justify-center transition-colors z-10"
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4 text-[#30221b]" />
            </button>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 12 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#30221b] flex items-center justify-center shadow-lg"
              >
                <Gift className="w-8 h-8 text-[#b97d42]" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-[#30221b] mb-2"
              >
                {t("intro.popup.title")}
              </motion.h2>

              {/* Discovery Count */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-[#5b3e34] text-sm mb-3"
              >
                {language === 'en' 
                  ? `${unlockedCount} Animal${unlockedCount !== 1 ? 's' : ''} Discovered. Save Your Journey.`
                  : `تم اكتشاف ${unlockedCount} حيوان. احفظ رحلتك.`
                }
              </motion.p>

              {/* Message */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#5b3e34] text-sm leading-relaxed mb-4"
              >
                {t("intro.popup.message")}
              </motion.p>

              {/* Prize List */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 mb-5"
              >
                {/* Prize 1 */}
                <div className="flex items-center gap-3 bg-[#f5e6d3] border border-[#d3c4b0] rounded-xl p-3">
                  <div className="w-9 h-9 rounded-lg bg-[#30221b] flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4 text-[#b97d42]" />
                  </div>
                  <span className="text-[#30221b] font-medium text-left text-sm">{t("intro.popup.prize1")}</span>
                </div>

                {/* Prize 2 */}
                <div className="flex items-center gap-3 bg-[#f5e6d3] border border-[#d3c4b0] rounded-xl p-3">
                  <div className="w-9 h-9 rounded-lg bg-[#30221b] flex items-center justify-center flex-shrink-0">
                    <Book className="w-4 h-4 text-[#b97d42]" />
                  </div>
                  <span className="text-[#30221b] font-medium text-left text-sm">{t("intro.popup.prize2")}</span>
                </div>

                {/* Prize 3 */}
                <div className="flex items-center gap-3 bg-[#f5e6d3] border border-[#d3c4b0] rounded-xl p-3">
                  <div className="w-9 h-9 rounded-lg bg-[#30221b] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#b97d42]" />
                  </div>
                  <span className="text-[#30221b] font-medium text-left text-sm">{t("intro.popup.prize3")}</span>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 mb-4"
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="w-5 h-5 text-[#5b3e34]/50" />
                  </div>
                  <Input 
                    type="text" 
                    placeholder={language === 'en' ? "Your Name" : "اسمك"}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white border border-[#d3c4b0] text-[#30221b] placeholder:text-[#5b3e34]/50 h-12 rounded-xl focus:ring-2 focus:ring-[#b97d42]/50 focus:border-[#b97d42]/50 pl-12 pr-4 text-base transition-all"
                    dir={dir}
                    data-testid="input-save-name"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-[#5b3e34]/50" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white border border-[#d3c4b0] text-[#30221b] placeholder:text-[#5b3e34]/50 h-12 rounded-xl focus:ring-2 focus:ring-[#b97d42]/50 focus:border-[#b97d42]/50 pl-12 pr-4 text-base transition-all"
                    dir="ltr"
                    data-testid="input-save-email"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={formData.phoneCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneCode: e.target.value }))}
                    className="bg-white border border-[#d3c4b0] text-[#30221b] h-12 rounded-xl focus:ring-2 focus:ring-[#b97d42]/50 focus:border-[#b97d42]/50 px-2 appearance-none cursor-pointer text-sm min-w-[80px]"
                    data-testid="select-save-phone-code"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Phone className="w-5 h-5 text-[#5b3e34]/50" />
                    </div>
                    <Input 
                      type="tel" 
                      placeholder={language === 'en' ? "Phone Number" : "رقم الهاتف"}
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                      className="bg-white border border-[#d3c4b0] text-[#30221b] placeholder:text-[#5b3e34]/50 h-12 rounded-xl focus:ring-2 focus:ring-[#b97d42]/50 focus:border-[#b97d42]/50 pl-12 pr-4 text-base transition-all"
                      dir="ltr"
                      data-testid="input-save-phone"
                    />
                  </div>
                </div>
                
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-600 text-sm text-center bg-red-100 py-2 px-3 rounded-lg" 
                      data-testid="text-save-error"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Register Button */}
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-[#b97d42] hover:bg-[#855338] text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(185,125,66,0.5)" }}
                whileTap={{ scale: 0.97 }}
                data-testid="button-save-progress"
              >
                {!isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    t("intro.popup.register")
                  )}
                </span>
              </motion.button>

              {/* Skip link */}
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onClose}
                className="w-full mt-3 text-[#5b3e34] hover:text-[#30221b] font-medium py-2 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-skip-save"
              >
                {t("intro.popup.skip")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
