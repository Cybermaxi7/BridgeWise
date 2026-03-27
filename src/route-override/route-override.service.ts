import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteOverride, OverrideType } from './entities/route-override.entity';
import {
  CreateRouteOverrideDto,
  UpdateRouteOverrideDto,
} from './dto/route-override.dto';
import { NormalizedQuote } from '../bridge-compare/interfaces';

@Injectable()
export class RouteOverrideService {
  private readonly logger = new Logger(RouteOverrideService.name);

  constructor(
    @InjectRepository(RouteOverride)
    private readonly overrideRepo: Repository<RouteOverride>,
  ) {}

  async create(dto: CreateRouteOverrideDto): Promise<RouteOverride> {
    const existing = await this.overrideRepo.findOne({
      where: {
        bridgeId: dto.bridgeId,
        sourceChain: dto.sourceChain,
        destinationChain: dto.destinationChain,
        sourceToken: dto.sourceToken,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Override already exists for ${dto.bridgeId} on ${dto.sourceChain}→${dto.destinationChain} (${dto.sourceToken}). Use PATCH to update it.`,
      );
    }

    const override = this.overrideRepo.create({
      ...dto,
      scoreAdjustment: dto.scoreAdjustment ?? 0,
    });

    const saved = await this.overrideRepo.save(override);
    this.logger.log(
      `Created override [${saved.overrideType}] for ${saved.bridgeId} on ${saved.sourceChain}→${saved.destinationChain}`,
    );
    return saved;
  }

  async findAll(): Promise<RouteOverride[]> {
    return this.overrideRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<RouteOverride> {
    const override = await this.overrideRepo.findOne({ where: { id } });
    if (!override) throw new NotFoundException(`Override ${id} not found`);
    return override;
  }

  async update(
    id: string,
    dto: UpdateRouteOverrideDto,
  ): Promise<RouteOverride> {
    const override = await this.findOne(id);
    Object.assign(override, dto);
    const saved = await this.overrideRepo.save(override);
    this.logger.log(`Updated override ${id}`);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const override = await this.findOne(id);
    await this.overrideRepo.remove(override);
    this.logger.log(`Deleted override ${id}`);
  }

  /**
   * Fetch active overrides matching a specific route and apply them to the
   * ranked quotes list. Called by RankingService after normal scoring.
   */
  async applyOverrides(
    quotes: NormalizedQuote[],
    sourceChain: string,
    destinationChain: string,
    sourceToken: string,
  ): Promise<NormalizedQuote[]> {
    const overrides = await this.overrideRepo.find({
      where: { sourceChain, destinationChain, sourceToken, isActive: true },
    });

    if (!overrides.length) return quotes;

    this.logger.debug(
      `Applying ${overrides.length} override(s) for ${sourceChain}→${destinationChain} (${sourceToken})`,
    );

    // Build lookup maps for O(1) access
    const excludedIds = new Set<string>();
    const adjustments = new Map<string, number>();
    const forcedFirst = new Set<string>();

    for (const ov of overrides) {
      switch (ov.overrideType) {
        case OverrideType.EXCLUDE:
          excludedIds.add(ov.bridgeId);
          break;
        case OverrideType.SCORE_ADJUSTMENT:
          adjustments.set(ov.bridgeId, Number(ov.scoreAdjustment));
          break;
        case OverrideType.FORCE_FIRST:
          forcedFirst.add(ov.bridgeId);
          break;
      }
    }

    // 1. Filter out excluded bridges
    let result = quotes.filter((q) => !excludedIds.has(q.bridgeId));

    // 2. Apply score adjustments (clamped to 0-100)
    result = result.map((q) => {
      const adj = adjustments.get(q.bridgeId);
      if (adj === undefined) return q;
      return {
        ...q,
        compositeScore: Math.min(100, Math.max(0, q.compositeScore + adj)),
      };
    });

    // 3. Re-sort by compositeScore after adjustments
    result.sort((a, b) => b.compositeScore - a.compositeScore);

    // 4. Promote force_first bridges to the top (preserving their relative order)
    const forced = result.filter((q) => forcedFirst.has(q.bridgeId));
    const rest = result.filter((q) => !forcedFirst.has(q.bridgeId));
    result = [...forced, ...rest];

    // 5. Re-assign ranking positions
    return result.map((q, i) => ({ ...q, rankingPosition: i + 1 }));
  }
}
