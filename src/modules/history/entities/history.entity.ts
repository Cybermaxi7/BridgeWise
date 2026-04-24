import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('transfer_history')
export class TransferHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  fromChainId: number;

  @Column()
  toChainId: number;

  @Column()
  fromTokenAddress: string;

  @Column()
  toTokenAddress: string;

  @Column({ type: 'decimal', precision: 78, scale: 0 }) // Using decimal for large numbers
  amountIn: string;

  @Column({ type: 'decimal', precision: 78, scale: 0 })
  amountOut: string;

  @Column()
  transactionHash: string;

  @Column()
  status: 'success' | 'failed' | 'pending';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  slippagePercentage?: number;

  @Column({ type: 'decimal', precision: 78, scale: 0, nullable: true })
  estimatedLoss?: string;

  @CreateDateColumn()
  timestamp: Date;
}
