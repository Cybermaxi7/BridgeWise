"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTransactions = exportTransactions;
exports.previewExportTransactions = previewExportTransactions;
const export_utils_1 = require("../utils/export-utils");
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
/**
 * Export transaction history from the API
 */
async function exportTransactions(format, filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.account) {
        queryParams.append('account', filters.account);
    }
    if (filters.sourceChain) {
        queryParams.append('sourceChain', filters.sourceChain);
    }
    if (filters.destinationChain) {
        queryParams.append('destinationChain', filters.destinationChain);
    }
    if (filters.bridgeName) {
        queryParams.append('bridgeName', filters.bridgeName);
    }
    if (filters.status) {
        queryParams.append('status', filters.status);
    }
    if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
    }
    const response = await fetch(`${API_BASE_URL}/transactions/export/${format}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to export transactions: ${response.statusText}`);
    }
    // Get the content based on format
    const content = format === 'csv'
        ? await response.text()
        : await response.text(); // JSON as text to preserve formatting
    // Download the file
    if (format === 'csv') {
        (0, export_utils_1.downloadCSV)(content);
    }
    else {
        (0, export_utils_1.downloadJSON)(content);
    }
}
/**
 * Preview transaction data without downloading
 */
async function previewExportTransactions(format, filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.account) {
        queryParams.append('account', filters.account);
    }
    if (filters.sourceChain) {
        queryParams.append('sourceChain', filters.sourceChain);
    }
    if (filters.destinationChain) {
        queryParams.append('destinationChain', filters.destinationChain);
    }
    if (filters.bridgeName) {
        queryParams.append('bridgeName', filters.bridgeName);
    }
    if (filters.status) {
        queryParams.append('status', filters.status);
    }
    if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
    }
    const response = await fetch(`${API_BASE_URL}/transactions/export/${format}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to preview transactions: ${response.statusText}`);
    }
    return response.text();
}
//# sourceMappingURL=transaction-export.service.js.map