"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvBuilderUtil = void 0;
const common_1 = require("@nestjs/common");
let CsvBuilderUtil = class CsvBuilderUtil {
    constructor() {
        this.DEFAULT_NULL = '';
    }
    /**
     * Build a complete CSV string from an array of records.
     */
    build(records, options) {
        const lines = [];
        if (options.includeHeader) {
            lines.push(this.buildHeader(options.columns, options.delimiter));
        }
        for (const record of records) {
            lines.push(this.buildRow(record, options));
        }
        return lines.join('\n');
    }
    /**
     * Stream records as CSV lines (generator for memory-efficient large exports).
     */
    *stream(records, options) {
        if (options.includeHeader) {
            yield this.buildHeader(options.columns, options.delimiter) + '\n';
        }
        for (const record of records) {
            yield this.buildRow(record, options) + '\n';
        }
    }
    /**
     * Build the header row.
     */
    buildHeader(columns, delimiter) {
        return columns.map((col) => this.escapeField(col.header, delimiter)).join(delimiter);
    }
    /**
     * Build a single data row.
     */
    buildRow(record, options) {
        const { columns, delimiter, nullPlaceholder } = options;
        return columns
            .map((col) => {
            const rawValue = this.getNestedValue(record, col.key);
            let formatted;
            if (rawValue === null || rawValue === undefined) {
                formatted = nullPlaceholder ?? this.DEFAULT_NULL;
            }
            else if (col.formatter) {
                formatted = col.formatter(rawValue, record);
            }
            else {
                formatted = this.defaultFormat(rawValue);
            }
            return this.escapeField(formatted, delimiter);
        })
            .join(delimiter);
    }
    /**
     * Escape a CSV field value (wrap in quotes if it contains delimiter, quotes, or newlines).
     */
    escapeField(value, delimiter) {
        const needsQuoting = value.includes(delimiter) ||
            value.includes('"') ||
            value.includes('\n') ||
            value.includes('\r');
        if (needsQuoting) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
    /**
     * Access deeply nested object properties via dot-notation key.
     * e.g. 'metadata.baseFee'
     */
    getNestedValue(obj, key) {
        return key.split('.').reduce((acc, part) => {
            if (acc !== null && acc !== undefined && typeof acc === 'object') {
                return acc[part];
            }
            return undefined;
        }, obj);
    }
    /**
     * Default formatter: converts values to strings.
     */
    defaultFormat(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }
    /**
     * Calculate estimated file size in bytes for a CSV string.
     */
    estimateSize(csv) {
        return Buffer.byteLength(csv, 'utf8');
    }
    /**
     * Format a date according to the requested format.
     */
    formatDate(date, format, timezone = 'UTC') {
        const d = typeof date === 'string' ? new Date(date) : date;
        switch (format) {
            case 'unix':
                return String(Math.floor(d.getTime() / 1000));
            case 'locale':
                return d.toLocaleString('en-US', { timeZone: timezone });
            case 'iso':
            default:
                return d.toISOString();
        }
    }
};
exports.CsvBuilderUtil = CsvBuilderUtil;
exports.CsvBuilderUtil = CsvBuilderUtil = __decorate([
    (0, common_1.Injectable)()
], CsvBuilderUtil);
//# sourceMappingURL=csv-builder.util.js.map