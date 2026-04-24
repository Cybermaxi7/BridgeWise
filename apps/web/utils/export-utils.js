"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = downloadFile;
exports.downloadCSV = downloadCSV;
exports.downloadJSON = downloadJSON;
/**
 * Download a file with the given content
 * @param content - The file content (string for CSV/JSON)
 * @param filename - The filename to download
 * @param mimeType - The MIME type of the file
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    // Create a blob from the content
    const blob = new Blob([content], { type: mimeType });
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    // Append to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
/**
 * Download transaction history as CSV
 * @param content - CSV content as string
 * @param filename - Optional custom filename (default: transactions_YYYY-MM-DD.csv)
 */
function downloadCSV(content, filename) {
    const defaultFilename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(content, filename || defaultFilename, 'text/csv;charset=utf-8;');
}
/**
 * Download transaction history as JSON
 * @param content - JSON content as string
 * @param filename - Optional custom filename (default: transactions_YYYY-MM-DD.json)
 */
function downloadJSON(content, filename) {
    const defaultFilename = `transactions_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(content, filename || defaultFilename, 'application/json;charset=utf-8;');
}
//# sourceMappingURL=export-utils.js.map