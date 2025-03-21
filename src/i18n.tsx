import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend, { HttpBackendOptions } from "i18next-http-backend";
import { API_PREFIX } from "api/apiHelpers";
// import * as jsonEn from './locales/en.json';

type TTranslations = { [key: string]: any };

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources: TTranslations = {
  // en: jsonEn,
};

const fallbackLng = "en";
const defaultLng = localStorage.getItem("i18nextLng") ?? fallbackLng;

i18n
  // Enables the i18next backend
  .use(HttpBackend)
  // Enable automatic language detection
  .use(LanguageDetector)
  // Enables the hook initialization module
  .use(initReactI18next) // passes i18n down to react-i18next
  .init<HttpBackendOptions>({
    lng: defaultLng, // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    backend: {
      // translation file path
      // the returned path will interpolate lng, ns if provided like giving a static path
      loadPath: `${API_PREFIX}/api/v1/localization/web/{{lng}}`,
      parse: (data: string, languages?: string | string[]): TTranslations => {
        const mergeDeep = (target: any, source: any): any => {
          for (const key in source) {
            if (
              source[key] &&
              typeof source[key] === "object" &&
              !Array.isArray(source[key])
            ) {
              target[key] = mergeDeep(target[key] || {}, source[key]);
            } else {
              target[key] = source[key];
            }
          }
          return target;
        };

        if (data && languages) {
          const parsedData = JSON.parse(data);

          if (typeof languages === "string") {
            const baseTranslations = resources[languages] || {};

            console.log(mergeDeep({ ...baseTranslations }, parsedData));

            return mergeDeep({ ...baseTranslations }, parsedData);
          }

          if (Array.isArray(languages)) {
            const mergedTranslations = languages.reduce((acc) => {
              return mergeDeep(acc, resources[defaultLng] || {});
            }, {});

            return mergeDeep(mergedTranslations, parsedData);
          }
        }

        return resources[defaultLng] || {};
      },
    },
    fallbackLng: defaultLng,
    debug: false,
    react: {
      useSuspense: true,
    },
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    interpolation: {
      escapeValue: false, // react already safes from xss
      formatSeparator: ",",
    },
  });

export default i18n;
