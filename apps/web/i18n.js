"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const en_json_1 = __importDefault(require("./locales/en.json"));
const fr_json_1 = __importDefault(require("./locales/fr.json"));
const resources = {
    en: {
        translation: en_json_1.default,
    },
    fr: {
        translation: fr_json_1.default,
    },
};
if (!i18next_1.default.isInitialized) {
    i18next_1.default
        .use(react_i18next_1.initReactI18next)
        .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr'],
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    })
        .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('i18next init failed', error);
    });
}
exports.default = i18next_1.default;
//# sourceMappingURL=i18n.js.map