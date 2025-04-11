import { createContext, useContext, ReactNode, useState } from "react";
import enUS from "antd/lib/locale/en_US";
import viVN from "antd/lib/locale/vi_VN";
import en from "./en";
import vi from "./vi";

// Map our locales to Ant Design locales
export const locales = {
  en: {
    name: "English",
    messages: en,
    antd: enUS,
  },
  vi: {
    name: "Tiếng Việt",
    messages: vi,
    antd: viVN,
  },
};

type LocaleContextType = {
  locale: string;
  messages: typeof en;
  antdLocale: typeof enUS;
  changeLocale: (locale: string) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  messages: en,
  antdLocale: enUS,
  changeLocale: () => {},
});

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState("en");
  const currentLocale = locales[locale as keyof typeof locales];

  const changeLocale = (newLocale: string) => {
    if (locales[newLocale as keyof typeof locales]) {
      setLocale(newLocale);
    }
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        messages: currentLocale.messages,
        antdLocale: currentLocale.antd,
        changeLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
