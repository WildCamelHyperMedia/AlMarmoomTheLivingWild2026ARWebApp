import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, User, Mail, Lock, Shield, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type AuthMode = "register" | "login" | "admin";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { language, dir, setLanguage } = useLanguage();
  const { setUser } = useUser();
  
  const [mode, setMode] = useState<AuthMode>("register");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", password: "" });
    setError("");
  };

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
          phone: formData.phone.trim(),
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

  const handleLogin = async () => {
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
      const response = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name.trim(), 
          email: formData.email.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Login failed" : "فشل تسجيل الدخول"));
      }

      setUser(data.user, data.token, data.expiresAt);
      setLocation("/gallery");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!formData.email.trim()) {
      setError(language === 'en' ? "Please enter email" : "يرجى إدخال البريد الإلكتروني");
      return;
    }
    
    if (!formData.password) {
      setError(language === 'en' ? "Please enter password" : "يرجى إدخال كلمة المرور");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Invalid credentials" : "بيانات غير صحيحة"));
      }

      setUser(data.user, data.token, data.expiresAt);
      setLocation("/admin");
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

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-6 py-6 relative overflow-hidden">
      
      {/* Desert Dunes Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/desert-dunes.jpg')" }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-6 z-10"
      >
        <motion.button 
          onClick={handleBack}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.9 }}
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6" />
        </motion.button>
        <motion.button 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-language"
        >
          <Globe className="h-4 w-4 text-white/60" />
          <span className="text-white/80">{language === 'en' ? 'العربية' : 'English'}</span>
        </motion.button>
      </motion.div>

      {/* Mode Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm z-10 mb-6"
      >
        <div className="flex bg-[#5b3e34]/50 rounded-2xl p-1 backdrop-blur-sm">
          <motion.button
            onClick={() => switchMode("register")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
              mode === "register" 
                ? "bg-[#b97d42] text-white shadow-lg" 
                : "text-white/60 hover:text-white/80"
            }`}
            whileHover={{ scale: mode !== "register" ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
            data-testid="tab-register"
          >
            {language === 'en' ? 'Register' : 'تسجيل جديد'}
            {mode === "register" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#b97d42] rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
          <motion.button
            onClick={() => switchMode("login")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
              mode === "login" 
                ? "bg-[#b97d42] text-white shadow-lg" 
                : "text-white/60 hover:text-white/80"
            }`}
            whileHover={{ scale: mode !== "login" ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
            data-testid="tab-login"
          >
            {language === 'en' ? 'Login' : 'تسجيل الدخول'}
            {mode === "login" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#b97d42] rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Register Form */}
        {mode === "register" && (
          <motion.div 
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#b97d42] to-[#855338] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(185,125,66,0.4)]"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="font-bold text-2xl tracking-tight mb-1">
                {language === 'en' ? 'Create Account' : 'إنشاء حساب'}
              </h1>
              <p className="text-white/50 text-sm">
                {language === 'en' ? 'Track your progress and win prizes' : 'تتبع تقدمك واربح جوائز'}
              </p>
            </div>

            <div className="w-full space-y-3 mb-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  type="text" 
                  placeholder={language === 'en' ? "Your Name" : "اسمك"}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#b97d42]/50 backdrop-blur-sm pl-12 pr-4"
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
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#b97d42]/50 backdrop-blur-sm pl-12 pr-4"
                  dir="ltr"
                  data-testid="input-email"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  type="tel" 
                  placeholder={language === 'en' ? "Phone Number" : "رقم الهاتف"}
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#b97d42]/50 backdrop-blur-sm pl-12 pr-4"
                  dir="ltr"
                  data-testid="input-phone"
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

            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(185,125,66,0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#b97d42] to-[#855338] text-white font-bold py-4 rounded-2xl transition-all mb-3 shadow-[0_4px_30px_rgba(185,125,66,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              data-testid="button-register"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <span className="relative z-10">
                {isLoading 
                  ? (language === 'en' ? 'Registering...' : 'جاري التسجيل...') 
                  : (language === 'en' ? 'Register' : 'تسجيل')
                }
              </span>
            </motion.button>

            <button 
              onClick={handleSkip}
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
              data-testid="button-skip"
            >
              {language === 'en' ? 'Skip for now' : 'تخطي الآن'}
            </button>
          </motion.div>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#b97d42] to-[#855338] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(185,125,66,0.4)]"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="font-bold text-2xl tracking-tight mb-1">
                {language === 'en' ? 'Welcome Back' : 'مرحباً بعودتك'}
              </h1>
              <p className="text-white/50 text-sm">
                {language === 'en' ? 'Enter your name and email to continue' : 'أدخل اسمك وبريدك للمتابعة'}
              </p>
            </div>

            <div className="w-full space-y-3 mb-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  type="text" 
                  placeholder={language === 'en' ? "Your Name" : "اسمك"}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#b97d42]/50 backdrop-blur-sm pl-12 pr-4"
                  dir={dir}
                  data-testid="input-login-name"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  type="email" 
                  placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-[#b97d42]/50 backdrop-blur-sm pl-12 pr-4"
                  dir="ltr"
                  data-testid="input-login-email"
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

            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(185,125,66,0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#b97d42] to-[#855338] text-white font-bold py-4 rounded-2xl transition-all mb-3 shadow-[0_4px_30px_rgba(185,125,66,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              data-testid="button-login"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <span className="relative z-10">
                {isLoading 
                  ? (language === 'en' ? 'Logging in...' : 'جاري الدخول...') 
                  : (language === 'en' ? 'Login' : 'دخول')
                }
              </span>
            </motion.button>

            <button 
              onClick={handleSkip}
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
              data-testid="button-skip"
            >
              {language === 'en' ? 'Skip for now' : 'تخطي الآن'}
            </button>
          </motion.div>
        )}

        {/* Admin Login Form */}
        {mode === "admin" && (
          <motion.div 
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#6B7280] to-[#374151] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(107,114,128,0.4)]"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="font-bold text-2xl tracking-tight mb-1">
                {language === 'en' ? 'Admin Login' : 'دخول المدير'}
              </h1>
              <p className="text-white/50 text-sm">
                {language === 'en' ? 'Staff access only' : 'للموظفين فقط'}
              </p>
            </div>

            <div className="w-full space-y-3 mb-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  type="email" 
                  placeholder={language === 'en' ? "Admin Email" : "بريد المدير"}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-white/20 backdrop-blur-sm pl-12 pr-4"
                  dir="ltr"
                  data-testid="input-admin-email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  type="password" 
                  placeholder={language === 'en' ? "Password" : "كلمة المرور"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-[#5b3e34]/80 border-none text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-2 focus:ring-white/20 backdrop-blur-sm pl-12 pr-4"
                  dir="ltr"
                  data-testid="input-admin-password"
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

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleAdminLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#6B7280] to-[#374151] text-white font-bold py-4 rounded-2xl transition-all mb-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-admin-login"
            >
              {isLoading 
                ? (language === 'en' ? 'Logging in...' : 'جاري الدخول...') 
                : (language === 'en' ? 'Admin Login' : 'دخول المدير')
              }
            </motion.button>

            <button 
              onClick={() => switchMode("register")}
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
              data-testid="button-back-to-user"
            >
              {language === 'en' ? 'Back to user login' : 'العودة لتسجيل المستخدم'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Staff Button - Bottom */}
      {mode !== "admin" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => switchMode("admin")}
          className="z-10 mt-auto mb-4 flex items-center gap-2 text-white/30 hover:text-white/50 text-xs transition-colors"
          data-testid="button-admin-access"
        >
          <Shield className="w-4 h-4" />
          {language === 'en' ? 'Staff Login' : 'دخول الموظفين'}
        </motion.button>
      )}
    </div>
  );
}
