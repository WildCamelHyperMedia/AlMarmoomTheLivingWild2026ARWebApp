import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
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

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const { t, language, dir } = useLanguage();
  const { setUser } = useUser();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });
  const [countryCode, setCountryCode] = useState("+971");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!formData.name || !formData.phone) {
      setError("Please fill in all fields");
      return;
    }
    
    const fullPhone = `${countryCode}${formData.phone}`;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, phone: fullPhone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setUser(data.user);
      setLocation("/intro");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
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
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
              dir={dir}
              data-testid="input-name"
            />
          </div>

          <div className="space-y-1">
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
                placeholder={t("signup.mobile")}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="flex-1 bg-[#3E2D24]/80 border-none text-white placeholder:text-white/60 h-14 rounded-xl focus:ring-1 focus:ring-primary/50 backdrop-blur-sm px-4"
                dir="ltr"
                data-testid="input-phone"
              />
            </div>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        <button 
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-[#D4A045] hover:bg-[#c4923e] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mb-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-continue"
        >
          {isLoading ? (language === 'en' ? 'Creating account...' : 'جاري إنشاء الحساب...') : t("signup.continue")}
        </button>

        <p className="text-center text-[10px] text-white/50 leading-relaxed whitespace-pre-line mb-8">
          {t("signup.terms")}
        </p>
      </motion.div>
    </div>
  );
}
