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
    "app.title": "The Living Wild",
    "signup.header": "SIGN UP",
    "signup.title": "SIGN UP TO WIN\nA SIGNED PHOTO BOOK BY\nALI BIN THALITH.",
    "signup.fullName": "Full Name",
    "signup.mobile": "Mobile Number",
    "signup.continue": "Continue",
    "signup.terms": "By continuing, you agree to our Terms of Service\nand Privacy Policy.",
    "intro.start": "START JOURNEY",
    "intro.signup": "SIGNUP",
    "intro.win": "Win a Book",
    "intro.by": "Intro By",
    "intro.photographer": "Ali Bin Thalith",
    "intro.popup.title": "SCAN & WIN!",
    "intro.popup.message": "Simply scan the QR codes on all 24 photos here by renowned Emirati photographer H.E. Ali bin Thalith for a chance to win:",
    "intro.popup.prize1": "A GoPro",
    "intro.popup.prize2": "A signed book by Ali",
    "intro.popup.prize3": "A one-day photography tour with Ali",
    "intro.popup.register": "Register Now",
    "intro.popup.skip": "Skip",
    "gallery.featured": "Featured",
    "gallery.rare": "Rare Sighting",
    "gallery.title": "DISCOVER WILDLIFE",
    "detail.enterAr": "ENTER AR EXPERIENCE",
    "animals.white_tailed_lapwing": "White Tailed Lapwing",
    "animals.water_rail": "Water Rail",
    "animals.blue_throated_wagtail": "Blue Throated Wagtail",
    "animals.purple_sunbird": "Purple Sunbird",
    "animals.eurasian_stone_curlew": "Eurasian Stone Curlew",
    "animals.houbara_bustard": "Houbara Bustard",
    "animals.little_grebe": "Little Grebe",
    "animals.western_great_egret": "Western Great Egret",
    "animals.desert_hare": "Desert Hare",
    "animals.hoopoe": "Hoopoe",
    "animals.yellow_wagtail": "Yellow Wagtail",
    "animals.grey_headed_swamphen": "Grey-headed Swamphen",
    "animals.iraqi_sandgrouse": "Iraqi Sandgrouse",
    "animals.desert_eagle_owl": "Desert Eagle Owl",
    "animals.little_owl": "Little Owl",
    "animals.ruppells_fox": "Ruppell's Fox",
    "animals.gerbillus_cheesmani": "Gerbillus Cheesmani",
    "animals.hedgehog": "Hedgehog",
    "animals.desert_monitor": "Desert Monitor",
    "animals.arabian_oryx": "Arabian Oryx",
    "animals.dorcas_gazelle": "Dorcas Gazelle",
    "animals.frog_headed_lizard": "Frog Headed Lizard",
    "animals.sandfish_lizard": "Sandfish Lizard",
    "animals.spiny_tailed_lizard": "Spiny Tailed Lizard",
    "animals.green_bee_eater": "Green Bee Eater",
    "notification.keepGoing.title": "Keep going!",
    "notification.keepGoing.message": "Watch 10 videos to enter the draw for a signed photo book by Ali Bin Thalith.",
    "notification.entered.title": "You're in!",
    "notification.entered.message": "You've entered the draw. Watch 10 more videos for a chance to win a private photography session with Ali Bin Thalith.",
    "notification.button": "Continue Journey",
    "gallery.watched": "Videos Watched",
    "aiGuide.title": "Ask the Wildlife Guide",
    "aiGuide.placeholder": "Ask a question about this animal...",
    "aiGuide.send": "Send",
    "aiGuide.thinking": "Thinking...",
    "aiGuide.error": "Sorry, I couldn't answer that. Please try again."
  },
  ar: {
    "app.title": "الحياة البرية",
    "signup.header": "سجل الآن",
    "signup.title": "سجل لفرصة الفوز\nبكتاب صور موقع من\nعلي بن ثالث.",
    "signup.fullName": "الاسم الكامل",
    "signup.mobile": "رقم الهاتف المتحرك",
    "signup.continue": "متابعة",
    "signup.terms": "بالمتابعة، أنت توافق على شروط الخدمة\nوسياسة الخصوصية.",
    "intro.start": "ابدأ الرحلة",
    "intro.signup": "التسجيل",
    "intro.win": "اربح كتاباً",
    "intro.by": "مقدمة من",
    "intro.photographer": "علي بن ثالث",
    "intro.popup.title": "امسح واربح!",
    "intro.popup.message": "ما عليك سوى مسح رموز QR على جميع الصور الـ 24 هنا للمصور الإماراتي الشهير معالي علي بن ثالث للحصول على فرصة للفوز بـ:",
    "intro.popup.prize1": "كاميرا GoPro",
    "intro.popup.prize2": "كتاب موقع من علي",
    "intro.popup.prize3": "جولة تصوير ليوم واحد مع علي",
    "intro.popup.register": "سجل الآن",
    "intro.popup.skip": "تخطي",
    "gallery.featured": "متميز",
    "gallery.rare": "مشهد نادر",
    "gallery.title": "اكتشف الحياة البرية",
    "gallery.desc": "ساكن أصلي في الصحراء العربية، مموه تماماً مع الكثبان الرملية. جرب بيئته في الواقع الافتراضي.",
    "gallery.enterVr": "ادخل تجربة الواقع الافتراضي",
    "gallery.more": "المزيد من المعرض",
    "gallery.viewAll": "عرض الكل",
    "gallery.comingSoon": "قريباً",
    "detail.enterAr": "ادخل تجربة الواقع المعزز",
    "animals.white_tailed_lapwing": "القطقاط أبيض الذيل",
    "animals.water_rail": "مرعة الماء",
    "animals.blue_throated_wagtail": "الذعرة زرقاء الحنجرة",
    "animals.purple_sunbird": "تمير أرجواني",
    "animals.eurasian_stone_curlew": "الكروان الصحراوي",
    "animals.houbara_bustard": "الحبارى",
    "animals.little_grebe": "الغطاس الصغير",
    "animals.western_great_egret": "البلشون الأبيض",
    "animals.desert_hare": "الأرنب البري",
    "animals.hoopoe": "الهدهد",
    "animals.yellow_wagtail": "الذعرة الصفراء",
    "animals.grey_headed_swamphen": "دجاجة السلطان الرمادية",
    "animals.iraqi_sandgrouse": "القطا العراقي",
    "animals.desert_eagle_owl": "بومة النسر الصحراوية",
    "animals.little_owl": "البومة الصغيرة",
    "animals.ruppells_fox": "ثعلب روبل",
    "animals.gerbillus_cheesmani": "عضل تشيزمان",
    "animals.hedgehog": "القنفذ",
    "animals.desert_monitor": "الورل الصحراوي",
    "animals.arabian_oryx": "المها العربي",
    "animals.dorcas_gazelle": "غزال الدوركاس",
    "animals.frog_headed_lizard": "سحلية رأس الضفدع",
    "animals.sandfish_lizard": "سحلية السمكة الرملية",
    "animals.spiny_tailed_lizard": "الضب",
    "animals.green_bee_eater": "الوروار الأخضر",
    "notification.keepGoing.title": "استمر!",
    "notification.keepGoing.message": "شاهد 10 مقاطع فيديو للدخول في السحب على كتاب صور موقع من علي بن ثالث.",
    "notification.entered.title": "أنت مشارك!",
    "notification.entered.message": "لقد دخلت في السحب. شاهد 10 مقاطع فيديو إضافية لفرصة الفوز بجلسة تصوير خاصة مع علي بن ثالث.",
    "notification.button": "أكمل الرحلة",
    "gallery.watched": "مقاطع الفيديو المشاهدة",
    "aiGuide.title": "اسأل مرشد الحياة البرية",
    "aiGuide.placeholder": "اطرح سؤالاً عن هذا الحيوان...",
    "aiGuide.send": "إرسال",
    "aiGuide.thinking": "جارٍ التفكير...",
    "aiGuide.error": "عذراً، لم أتمكن من الإجابة. حاول مرة أخرى."
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
