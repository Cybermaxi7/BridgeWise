"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCssVariables = generateCssVariables;
exports.generateDarkModeVariables = generateDarkModeVariables;
exports.variablesToCssString = variablesToCssString;
exports.generateFullCssBundle = generateFullCssBundle;
/**
 * Converts a camelCase key to a CSS custom property name.
 * e.g. "primaryHover" → "--color-primary-hover"
 */
function camelToKebab(str) {
    return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}
function sectionPrefix(section) {
    const map = {
        colors: '--color',
        typography: '--font',
        spacing: '--spacing',
        borderRadius: '--radius',
        shadows: '--shadow',
        transitions: '--transition',
        breakpoints: '--bp',
        zIndex: '--z',
    };
    return map[section] ?? `--${camelToKebab(section)}`;
}
function generateCssVariables(config) {
    const vars = {};
    const sections = [
        'colors',
        'typography',
        'spacing',
        'borderRadius',
        'shadows',
        'transitions',
        'breakpoints',
        'zIndex',
    ];
    for (const section of sections) {
        const sectionData = config[section];
        if (!sectionData || typeof sectionData !== 'object')
            continue;
        const prefix = sectionPrefix(section);
        for (const [key, value] of Object.entries(sectionData)) {
            if (value === undefined || value === null)
                continue;
            const varName = `${prefix}-${camelToKebab(key)}`;
            vars[varName] = String(value);
        }
    }
    // Custom CSS variables pass-through
    if (config.customCssVariables) {
        for (const [key, value] of Object.entries(config.customCssVariables)) {
            const cssKey = key.startsWith('--') ? key : `--custom-${camelToKebab(key)}`;
            vars[cssKey] = value;
        }
    }
    return vars;
}
function generateDarkModeVariables(config) {
    if (!config.darkModeEnabled || !config.darkModeColors)
        return undefined;
    const vars = {};
    for (const [key, value] of Object.entries(config.darkModeColors)) {
        if (value === undefined || value === null)
            continue;
        vars[`--color-${camelToKebab(key)}`] = String(value);
    }
    return vars;
}
function variablesToCssString(vars, selector = ':root') {
    const declarations = Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
    return `${selector} {\n${declarations}\n}`;
}
function generateFullCssBundle(config) {
    const rootVars = generateCssVariables(config);
    const rootCss = variablesToCssString(rootVars, ':root');
    const darkVars = generateDarkModeVariables(config);
    const darkCss = darkVars
        ? `\n\n@media (prefers-color-scheme: dark) {\n${variablesToCssString(darkVars, '  :root')}\n}`
        : '';
    return rootCss + darkCss;
}
//# sourceMappingURL=css-generator.util.js.map