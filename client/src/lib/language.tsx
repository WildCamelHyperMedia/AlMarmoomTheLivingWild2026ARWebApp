import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations = {
  en: {
    "app.title": "Al Marmoom",
    "signup.title": "SIGN UP TO WIN\nA SIGNED PHOTO BOOK BY\nALI BIN THALITH.",
    "signup.fullName": "Full Name",
    "signup.mobile": "Mobile Number",
    "signup.continue": "Continue",
    "signup.terms": "By continuing, you agree to our Terms of Service\nand Privacy Policy.",
    "gallery.featured": "Featured",
    "gallery.rare": "Rare Sighting",
    "gallery.title": "The Cream-colored Courser",
    "gallery.desc": "A native resident of the Arabian desert, perfectly camouflaged against the dunes. Experience its habitat in VR.",
    "gallery.enterVr": "ENTER VR EXPERIENCE",
    "gallery.more": "More from the Exhibition",
    "gallery.viewAll": "View All",
    "gallery.comingSoon": "Coming Soon"
  },
  ar: {
    "app.title": "المرموم",
    "signup.title": "سجل لفرصة الفوز\nبكتاب صور موقع من\nعلي بن ثالث.",
    "signup.fullName": "الاسم الكامل",
    "signup.mobile": "رقم الهاتف المتحرك",
    "signup.continue": "متابعة",
    "signup.terms": "بالمتابعة، أنت توافق على شروط الخدمة\nوسياسة الخصوصية.",
    "gallery.featured": "متميز",
    "gallery.rare": "مشهد نادر",
    "gallery.title": "الدراج الكريم",
    "gallery.desc": "ساكن أصلي في الصحراء العربية، مموه تماماً مع الكثبان الرملية. جرب بيئته في الواقع الافتراضي.",
    "gallery.enterVr": "ادخل تجربة الواقع الافتراضي",
    "gallery.more": "المزيد من المعرض",
    "gallery.viewAll": "عرض الكل",
    "gallery.comingSoon": "قريباً"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={language === "ar" ? "font-arabic" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
