import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Eye, EyeOff, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language";
import { useUser } from "@/lib/user";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const countryCodes = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "KSA", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
];

type AuthMode = "signup" | "login";
type SignupStep = 1 | 2;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { t, language, dir, setLanguage } = useLanguage();
  const { setUser } = useUser();
  
  const [mode, setMode] = useState<AuthMode>("signup");
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [countryCode, setCountryCode] = useState("+971");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignupStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError(language === 'en' ? "Please fill in all fields" : "يرجى ملء جميع الحقول");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(language === 'en' ? "Please enter a valid email" : "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    
    setError("");
    setSignupStep(2);
  };

  const handleSignup = async () => {
    if (!formData.password || !formData.confirmPassword) {
      setError(language === 'en' ? "Please fill in all fields" : "يرجى ملء جميع الحقول");
      return;
    }
    
    if (formData.password.length < 6) {
      setError(language === 'en' ? "Password must be at least 6 characters" : "يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'en' ? "Passwords do not match" : "كلمتا المرور غير متطابقتين");
      return;
    }
    
    const fullPhone = `${countryCode}${formData.phone}`;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email,
          phone: fullPhone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Failed to create account" : "فشل في إنشاء الحساب"));
      }

      setUser(data.user);
      setLocation(data.user.isAdmin ? "/gallery" : "/intro");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError(language === 'en' ? "Please fill in all fields" : "يرجى ملء جميع الحقول");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (language === 'en' ? "Invalid email or password" : "البريد الإلكتروني أو كلمة المرور غير صحيحة"));
      }

      setUser(data.user);
      setLocation(data.user.isAdmin ? "/gallery" : "/intro");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signup" ? "login" : "signup");
    setSignupStep(1);
    setError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleBack = () => {
    if (mode === "signup" && signupStep === 2) {
      setSignupStep(1);
      setError("");
    } else {
      window.history.back();
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-background text-white flex flex-col items-center px-6 py-8 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

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

      <AnimatePresence mode="wait">
        {mode === "signup" ? (
          signupStep === 1 ? (
            <motion.div 
              key="signup-step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
            >
              <div className="text-center mb-8">
                <h1 className="font-bold text-4xl md:text-5xl tracking-tight mb-4 font-sans">
                  {language === 'en' ? 'Create Account' : 'إنشاء حساب'}
                </h1>
                <p className="text-white/60 text-sm">
                  {language === 'en' ? 'Step 1 of 2 - Your Information' : 'الخطوة 1 من 2 - معلوماتك'}
                </p>
              </div>

              <div className="flex-1"></div>

              <div className="w-full space-y-4 mb-6">
                <Input 
                  type="text" 
                  placeholder={language === 'en' ? "Full Name" : "الاسم الكامل"}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                  dir={dir}
                  data-testid="input-name"
                />

                <Input 
                  type="email" 
                  placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                  dir="ltr"
                  data-testid="input-email"
                />

                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="appearance-none bg-[#3E2D24]/80 border-none text-white h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm pl-4 pr-10 cursor-pointer"
                      data-testid="select-country-code"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#3E2D24]">
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                  </div>
                  <Input 
                    type="tel" 
                    placeholder={language === 'en' ? "Phone Number" : "رقم الهاتف"}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                </div>
                
                {error && (
                  <p className="text-red-400 text-sm text-center" data-testid="text-error">{error}</p>
                )}
              </div>

              <button 
                onClick={handleSignupStep1}
                className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mb-4 shadow-lg"
                data-testid="button-next"
              >
                {language === 'en' ? 'Next' : 'التالي'}
              </button>

              <button 
                onClick={toggleMode}
                className="text-white/60 text-sm hover:text-white transition-colors"
                data-testid="button-toggle-login"
              >
                {language === 'en' ? 'Already have an account? ' : 'لديك حساب بالفعل؟ '}
                <span className="text-[#D4A045] font-semibold">{language === 'en' ? 'Login' : 'تسجيل الدخول'}</span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="signup-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
            >
              <div className="text-center mb-8">
                <h1 className="font-bold text-4xl md:text-5xl tracking-tight mb-4 font-sans">
                  {language === 'en' ? 'Set Password' : 'إنشاء كلمة المرور'}
                </h1>
                <p className="text-white/60 text-sm">
                  {language === 'en' ? 'Step 2 of 2 - Secure your account' : 'الخطوة 2 من 2 - تأمين حسابك'}
                </p>
              </div>

              <div className="flex-1"></div>

              <div className="w-full space-y-4 mb-6">
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder={language === 'en' ? "Password" : "كلمة المرور"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4 pr-12"
                    dir="ltr"
                    data-testid="input-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={language === 'en' ? "Confirm Password" : "تأكيد كلمة المرور"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4 pr-12"
                    dir="ltr"
                    data-testid="input-confirm-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <p className="text-white/40 text-xs text-center">
                  {language === 'en' ? 'Password must be at least 6 characters' : 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'}
                </p>
                
                {error && (
                  <p className="text-red-400 text-sm text-center" data-testid="text-error">{error}</p>
                )}
              </div>

              <button 
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mb-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-signup"
              >
                {isLoading ? (language === 'en' ? 'Creating account...' : 'جاري إنشاء الحساب...') : (language === 'en' ? 'Create Account' : 'إنشاء حساب')}
              </button>

              <p className="text-center text-[10px] text-white/50 leading-relaxed mb-4">
                {language === 'en' 
                  ? 'By signing up, you agree to our Terms of Service and Privacy Policy' 
                  : 'بالتسجيل، فإنك توافق على شروط الخدمة وسياسة الخصوصية'}
              </p>
            </motion.div>
          )
        ) : (
          <motion.div 
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-sm flex-1 flex flex-col items-center z-10"
          >
            <div className="text-center mb-8">
              <h1 className="font-bold text-4xl md:text-5xl tracking-tight mb-4 font-sans">
                {language === 'en' ? 'Welcome Back' : 'مرحباً بعودتك'}
              </h1>
              <p className="text-white/60 text-sm">
                {language === 'en' ? 'Login to continue your journey' : 'سجّل الدخول لمتابعة رحلتك'}
              </p>
            </div>

            <div className="flex-1"></div>

            <div className="w-full space-y-4 mb-6">
              <Input 
                type="email" 
                placeholder={language === 'en' ? "Email Address" : "البريد الإلكتروني"}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                dir="ltr"
                data-testid="input-login-email"
              />

              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder={language === 'en' ? "Password" : "كلمة المرور"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4 pr-12"
                  dir="ltr"
                  data-testid="input-login-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm text-center" data-testid="text-error">{error}</p>
              )}
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mb-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-login"
            >
              {isLoading ? (language === 'en' ? 'Logging in...' : 'جاري تسجيل الدخول...') : (language === 'en' ? 'Login' : 'تسجيل الدخول')}
            </button>

            <button 
              onClick={toggleMode}
              className="text-white/60 text-sm hover:text-white transition-colors"
              data-testid="button-toggle-signup"
            >
              {language === 'en' ? "Don't have an account? " : 'ليس لديك حساب؟ '}
              <span className="text-[#D4A045] font-semibold">{language === 'en' ? 'Sign Up' : 'سجّل الآن'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
