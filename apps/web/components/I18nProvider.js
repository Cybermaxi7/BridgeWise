'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nProvider = I18nProvider;
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const i18n_1 = __importDefault(require("../i18n"));
function I18nProvider({ children }) {
    (0, react_1.useEffect)(() => {
        const storedLanguage = window.localStorage.getItem('bridgewise-language');
        if (storedLanguage && storedLanguage !== i18n_1.default.language) {
            i18n_1.default.changeLanguage(storedLanguage);
        }
    }, []);
    return <react_i18next_1.I18nextProvider i18n={i18n_1.default}>{children}</react_i18next_1.I18nextProvider>;
}
//# sourceMappingURL=I18nProvider.js.map