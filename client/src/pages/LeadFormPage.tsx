import { useState } from "react";
import { asset } from "@/lib/assetBase";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";

export default function LeadFormPage() {
  const { language, dir } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCode: "+971"
  });

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

  const content = {
    en: {
      title: "SCAN & WIN!",
      description: "Visit the 'Drive-Thru Photography Exhibition at Al Marmoom', and scan & unlock as many QR codes next to each photograph for your chance to WIN amazing prizes.",
      subDescription: "Parkers guests can also WIN 'Al Marmoom' merchandise.",
      namePlaceholder: "Your Name",
      emailPlaceholder: "Your Email",
      phonePlaceholder: "Your Phone Number",
      submit: "Register Now",
      successTitle: "Registration Complete!",
      successMessage: "Thank you for registering. Good luck!"
    },
    ar: {
      title: "امسح واربح!",
      description: "زوروا معرض 'المرموم: حياة البرية' الذي يمرّ عبره الزوّار بالسيارة، وامسحوا أكبر عدد ممكن من رموز QR الموجودة بجانب كل صورة لفرصة الفوز بجوائز مميزة.",
      subDescription: "سيحصل جميع ضيوف 'باركرز' أيضاً على فرصة للفوز بمنتجات 'المرموم'.",
      namePlaceholder: "اسمك",
      emailPlaceholder: "بريدك الإلكتروني",
      phonePlaceholder: "رقم هاتفك",
      submit: "سجّل الآن",
      successTitle: "تم التسجيل بنجاح!",
      successMessage: "شكراً لتسجيلك. حظاً موفقاً!"
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone ? `${formData.phoneCode}${formData.phone}` : ""
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setIsSuccess(true);
    } catch (error: any) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-[100dvh] w-full bg-background text-white flex flex-col items-center px-4 py-6 relative overflow-auto safe-top safe-bottom"
      dir={dir}
    >
      {/* Desert Dunes Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: `url('${asset("/images/desert-dunes.jpg")}')` }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      {/* Content */}
      <div className="w-full max-w-md mx-auto z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <img src={asset("/logo.png")} alt="Al Marmoom" className="w-32 h-auto mx-auto" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-[#b97d42]/20 px-4 py-2 rounded-full mb-4">
                  <Gift className="w-5 h-5 text-[#b97d42]" />
                  <span className="text-[#b97d42] font-bold text-lg">{t.title}</span>
                </div>
              </motion.div>

              {/* Description Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#fef3dc] rounded-2xl p-5 mb-6"
              >
                <p className="text-[#30221b] text-sm leading-relaxed mb-4">
                  {t.description}
                </p>
                <p className="text-[#5b3e34] text-sm leading-relaxed font-medium">
                  {t.subDescription}
                </p>
              </motion.div>

              {/* Registration Form */}
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#b97d42] transition-colors"
                  data-testid="input-lead-name"
                />
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#b97d42] transition-colors"
                  data-testid="input-lead-email"
                />
                <div className="flex gap-2">
                  <select
                    value={formData.phoneCode}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                    className="px-3 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#b97d42] transition-colors appearance-none cursor-pointer min-w-[90px]"
                    data-testid="select-lead-phone-code"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#30221b]">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#b97d42] transition-colors"
                    data-testid="input-lead-phone"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#b97d42] hover:bg-[#855338] text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  data-testid="button-submit-lead"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                      />
                      <span className="relative z-10">{t.submit}</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">{t.successTitle}</h2>
              <p className="text-white/70">{t.successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Partner Logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <img src={asset("/dubai-culture-logo.png")} alt="Dubai Culture" className="h-6 w-auto opacity-60 grayscale" />
        </motion.div>
      </div>
    </div>
  );
}
