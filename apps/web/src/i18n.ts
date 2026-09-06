import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const storedLang = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: storedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// تحديث اتجاه الصفحة عند تغيير اللغة
i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  localStorage.setItem("language", lng);
});

// تعيين الاتجاه الأولي
document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";

export default i18n;
