"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireFeature = exports.FEATURE_FLAG_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.FEATURE_FLAG_KEY = 'featureFlag';
/**
 * Marks a controller or route handler as requiring a specific feature flag.
 * When the flag is disabled the request returns 403 Forbidden.
 *
 * @example
 * @RequireFeature('enableBridgeCompare')
 * @Get()
 * getBridgeRoutes() { ... }
 */
const RequireFeature = (flag) => (0, common_1.SetMetadata)(exports.FEATURE_FLAG_KEY, flag);
exports.RequireFeature = RequireFeature;
//# sourceMappingURL=require-feature.decorator.js.map