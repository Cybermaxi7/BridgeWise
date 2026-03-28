import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { ExportTransactionsDto } from './dto/export-transactions.dto';

export interface ExportTransactionData {
  id: string;
  type: string;
  status: string;
  sourceChain?: string;
  destinationChain?: string;
  bridgeName?: string;
  amount?: number;
  fee?: number;
  txHash?: string;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class TransactionsExportService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  /**
   * Get transactions with filters for export
   */
  async getTransactionsForExport(
    filters: ExportTransactionsDto,
  ): Promise<ExportTransactionData[]> {
    const where: any = {};

    // Apply filters
    if (filters.account) {
      where.metadata = { account: filters.account };
    }

    if (filters.sourceChain) {
      where.metadata = {
        ...where.metadata,
        sourceChain: filters.sourceChain,
      };
    }

    if (filters.destinationChain) {
      where.metadata = {
        ...where.metadata,
        destinationChain: filters.destinationChain,
      };
    }

    if (filters.bridgeName) {
      where.metadata = {
        ...where.metadata,
        bridgeName: filters.bridgeName,
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(
        new Date(filters.startDate),
        new Date(filters.endDate),
      );
    }

    const transactions = await this.transactionRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return transactions.map((tx) => this.mapToExportData(tx));
  }

  /**
   * Convert transactions to CSV format
   */
  convertToCSV(data: ExportTransactionData[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Type',
      'Status',
      'Source Chain',
      'Destination Chain',
      'Bridge Name',
      'Amount',
      'Fee',
      'TX Hash',
      'Created At',
      'Completed At',
    ];

    const rows = data.map((item) =>
      [
        this.escapeCsvValue(item.id),
        this.escapeCsvValue(item.type),
        this.escapeCsvValue(item.status),
        this.escapeCsvValue(item.sourceChain || ''),
        this.escapeCsvValue(item.destinationChain || ''),
        this.escapeCsvValue(item.bridgeName || ''),
        this.escapeCsvValue(item.amount?.toString() || ''),
        this.escapeCsvValue(item.fee?.toString() || ''),
        this.escapeCsvValue(item.txHash || ''),
        this.escapeCsvValue(this.formatDate(item.createdAt)),
        this.escapeCsvValue(item.completedAt ? this.formatDate(item.completedAt) : ''),
      ].join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert transactions to JSON format
   */
  convertToJSON(data: ExportTransactionData[]): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Map database transaction to export data format
   */
  private mapToExportData(tx: Transaction): ExportTransactionData {
    const metadata = tx.metadata || {};
    
    return {
      id: tx.id,
      type: tx.type,
      status: tx.status,
      sourceChain: metadata.sourceChain,
      destinationChain: metadata.destinationChain,
      bridgeName: metadata.bridgeName,
      amount: metadata.amount ? parseFloat(metadata.amount) : undefined,
      fee: metadata.fee ? parseFloat(metadata.fee) : undefined,
      txHash: metadata.txHash,
      createdAt: tx.createdAt,
      completedAt: tx.completedAt,
    };
  }

  /**
   * Escape special characters for CSV
   */
  private escapeCsvValue(value: string | number | undefined): string {
    if (value === undefined || value === null) {
      return '';
    }

    const stringValue = value.toString();
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Format date for export
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }
}
