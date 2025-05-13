import React, { createContext, useContext, ReactNode, useState } from 'react';
import en_US from 'antd/lib/locale/en_US';
import vi_VN from 'antd/lib/locale/vi_VN';
import ar_EG from 'antd/lib/locale/ar_EG';
import az_AZ from 'antd/lib/locale/az_AZ';
import en from './locale/en';
import vi from './locale/vi';
import fr from './locale/fr';
import de from './locale/de';
import ja from './locale/ja';
import zh from './locale/zh';
import es from './locale/es';
import ru from './locale/ru';
import it from './locale/it';
import pt from './locale/pt';
import ko from './locale/ko';
import th from './locale/th';
import id from './locale/id';
import tr from './locale/tr';
import pl from './locale/pl';
import nl from './locale/nl';
import sv from './locale/sv';
import fi from './locale/fi';
import no from './locale/no';
import da from './locale/da';
import cs from './locale/cs';
import hu from './locale/hu';
import ro from './locale/ro';
import el from './locale/el';
import he from './locale/he';
import uk from './locale/uk';
import ms from './locale/ms';
import hi from './locale/hi';
import bn from './locale/bn';
import ta from './locale/ta';
import ur from './locale/ur';
import fa from './locale/fa';
import ka from './locale/ka';
import az from './locale/az';
import kk from './locale/kk';
import uz from './locale/uz';
import ky from './locale/ky';
import tg from './locale/tg';
import tk from './locale/tk';
import mn from './locale/mn';
import ps from './locale/ps';
import sd from './locale/sd';
import si from './locale/si';
import ne from './locale/ne';
import my from './locale/my';
import km from './locale/km';
import lo from './locale/lo';
import { supportedLocales } from './supportedLocales';

// Deep merge function to combine English defaults with language-specific translations
function deepMerge(target: any, source: any): any {
  const output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Map our locales to Ant Design locales
const antLocales: any = {
  en: en_US,
  vi: vi_VN,
  ar: ar_EG,
  az: az_AZ,
};

const messages: any = {
  en: en,
  vi: vi,
  fr: fr,
  de: de,
  ja: ja,
  zh: zh,
  es: es,
  ru: ru,
  it: it,
  pt: pt,
  ko: ko,
  th: th,
  id: id,
  tr: tr,
  pl: pl,
  nl: nl,
  sv: sv,
  fi: fi,
  no: no,
  da: da,
  cs: cs,
  hu: hu,
  ro: ro,
  el: el,
  he: he,
  uk: uk,
  ms: ms,
  hi: hi,
  bn: bn,
  ta: ta,
  ur: ur,
  fa: fa,
  ka: ka,
  az: az,
  kk: kk,
  uz: uz,
  ky: ky,
  tg: tg,
  tk: tk,
  mn: mn,
  ps: ps,
  sd: sd,
  si: si,
  ne: ne,
  my: my,
  km: km,
  lo: lo,
};

const processedMessages: any = Object.keys(messages).reduce((acc: any, key: string) => {
  if (key === 'en') {
    acc[key] = messages[key];
  } else {
    acc[key] = deepMerge(deepMerge({}, en), messages[key]);
  }
  return acc;
}, {});

type LocaleType = {
  name: string;
  messages: any;
  antd: any;
};

export const locales: { [key: string]: LocaleType } = supportedLocales.reduce((acc: any, curr: any) => {
  const { key } = curr;
  acc[key] = {
    name: curr.label,
    messages: processedMessages[key] || processedMessages.en,
    antd: antLocales[key] || en_US,
  };
  return acc;
}, {});

type LocaleContextType = {
  locale: string;
  messages: any;
  antdLocale: any;
  changeLocale: (locale: string) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  messages: en,
  antdLocale: en_US,
  changeLocale: () => {},
});

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState('en');
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
      }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (key: string = '') => {
  const { locale, messages, antdLocale, changeLocale } = useContext(LocaleContext);

  const t = React.useCallback(
    (keys: string, vars: Record<string, string | number> = {}) => {
      const pathKeys = `${key}.${keys}`.split('.').filter((p) => p.length > 0);

      let translation = pathKeys.reduce((obj, k) => {
        return obj && typeof obj === 'object' && obj.hasOwnProperty(k) ? obj[k] : undefined;
      }, messages);

      if (typeof translation === 'string' && Object.keys(vars).length > 0) {
        Object.keys(vars).forEach((varKey) => {
          const regex = new RegExp(`{${varKey}}`, 'g');
          translation = translation.replace(regex, String(vars[varKey]));
        });
      }

      return translation !== undefined ? translation : pathKeys.join('.');
    },
    [key, messages]
  );

  return { locale, messages, antdLocale, changeLocale, t };
};
