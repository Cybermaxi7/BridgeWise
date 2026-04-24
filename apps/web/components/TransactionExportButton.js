'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionExportButton = void 0;
const react_1 = __importStar(require("react"));
const useTransactionExport_1 = require("../hooks/useTransactionExport");
/**
 * Transaction Export Button Component
 * Provides UI for exporting transaction history as CSV or JSON
 */
const TransactionExportButton = ({ filters, className = '', onSuccess, onError, disabled = false, iconOnly = false, }) => {
    const [showDropdown, setShowDropdown] = (0, react_1.useState)(false);
    const { export: exportData, loading, error, clearError } = (0, useTransactionExport_1.useTransactionExport)({
        onSuccess,
        onError,
    });
    const handleExport = async (format) => {
        try {
            await exportData(format, filters);
            setShowDropdown(false);
        }
        catch (err) {
            // Error is handled by the hook's onError callback
        }
    };
    const toggleDropdown = () => {
        if (!disabled && !loading) {
            setShowDropdown(!showDropdown);
            if (error) {
                clearError();
            }
        }
    };
    // Close dropdown when clicking outside
    const handleBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setShowDropdown(false);
        }
    };
    return (<div className={`relative inline-block text-left ${className}`} onBlur={handleBlur}>
      {/* Main Export Button */}
      <button type="button" onClick={toggleDropdown} disabled={disabled || loading} className={`
          inline-flex items-center justify-center rounded-md px-4 py-2 
          text-sm font-medium transition-colors
          ${disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `} aria-expanded={showDropdown} aria-haspopup="true">
        {/* Download Icon */}
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        
        {iconOnly ? null : loading ? 'Exporting...' : 'Export'}
        
        {/* Dropdown Arrow */}
        {!iconOnly && (<svg className={`ml-2 h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>)}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (<div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="export-menu">
          <div className="py-1">
            <button type="button" onClick={() => handleExport('csv')} disabled={loading} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" role="menuitem">
              <div className="flex items-center">
                <span className="font-medium">CSV Format</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Spreadsheet-compatible format
              </div>
            </button>
            
            <button type="button" onClick={() => handleExport('json')} disabled={loading} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" role="menuitem">
              <div className="flex items-center">
                <span className="font-medium">JSON Format</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Machine-readable format
              </div>
            </button>
          </div>
        </div>)}

      {/* Error Message */}
      {error && (<div className="absolute right-0 mt-2 w-64 p-3 bg-red-50 border border-red-200 rounded-md shadow-sm z-50">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Export Failed</p>
              <p className="text-xs text-red-600 mt-1">{error.message}</p>
            </div>
            <button type="button" onClick={clearError} className="ml-2 text-red-400 hover:text-red-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>)}
    </div>);
};
exports.TransactionExportButton = TransactionExportButton;
exports.default = exports.TransactionExportButton;
//# sourceMappingURL=TransactionExportButton.js.map