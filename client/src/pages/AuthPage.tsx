import { motion } from "framer-motion";
import { ArrowLeft, Globe, User, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { language, dir, setLanguage } = useLanguage();
  const { setUser } = useUser();
  
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name.trim()) {
      setError(language === 'en' ? "Please enter your name" : "يرجى إدخال اسمك");
      return;
    }
    
    if (!formData.email.trim()) {
      setError(language === 'en' ? "Please enter your email" : "يرجى إدخال بريدك الإلكتروني");
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
          name: formData.name.trim(), 
          email: formData.email.trim().toLowerCase(),
          watchedVideos: [],
          points: 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Failed to register" : "فشل في التسجيل"));
      }

      setUser(data.user, data.token, data.expiresAt);
      setLocation("/gallery");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setLocation("/intro");
  };

  const handleSkip = () => {
    setLocation("/gallery");
  };

  return (
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-6 py-8 relative overflow-hidden">
      
      {/* Desert Dunes Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/desert-dunes.jpg')" }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      <div className="w-full flex justify-between items-center mb-8 z-10">
        <button 
          onClick={handleBack}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-sm"
          data-testid="button-language"
        >
          <Globe className="h-4 w-4 text-white/60" />
          <span className="text-white/80">{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#D4A045] to-[#8B6914] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,160,69,0.4)]"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="font-bold text-3xl md:text-4xl tracking-tight mb-2 font-sans">
            {language === 'en' ? 'Join the Experience' : 'انضم إلى التجربة'}
          </h1>
          <p className="text-white/60 text-sm">
            {language === 'en' ? 'Enter your details to track your progress' : 'أدخل بياناتك لتتبع تقدمك'}
          </p>
        </div>

        {/* Form */}
        <div className="w-full space-y-4 mb-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input 
              type="text" 
              placeholder={language === 'en' ? "Your Name" : "اسمك"}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#D4A045]/50 backdrop-blur-sm pl-12 pr-4 text-lg"
              dir={dir}
              data-testid="input-name"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input 
              type="email" 
              placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#D4A045]/50 backdrop-blur-sm pl-12 pr-4 text-lg"
              dir="ltr"
              data-testid="input-email"
            />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-xl" 
              data-testid="text-error"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Register Button */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#D4A045] to-[#B8860B] text-white font-bold py-4 rounded-2xl transition-all mb-4 shadow-[0_4px_30px_rgba(212,160,69,0.4)] hover:shadow-[0_4px_40px_rgba(212,160,69,0.6)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          data-testid="button-register"
        >
          {isLoading 
            ? (language === 'en' ? 'Registering...' : 'جاري التسجيل...') 
            : (language === 'en' ? 'Register' : 'تسجيل')
          }
        </motion.button>

        {/* Skip Link */}
        <button 
          onClick={handleSkip}
          className="text-white/40 hover:text-white/70 text-sm transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
          data-testid="button-skip"
        >
          {language === 'en' ? 'Skip for now' : 'تخطي الآن'}
        </button>

        {/* Info text */}
        <p className="text-center text-[11px] text-white/40 leading-relaxed mt-8 max-w-xs">
          {language === 'en' 
            ? 'Registration helps you save progress and compete for prizes. No password needed!' 
            : 'التسجيل يساعدك على حفظ تقدمك والمنافسة على الجوائز. لا حاجة لكلمة مرور!'}
        </p>
      </motion.div>
    </div>
  );
}
