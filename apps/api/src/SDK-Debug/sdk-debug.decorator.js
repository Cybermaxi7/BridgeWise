"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkDebug = SdkDebug;
exports.SdkDebugSuppress = SdkDebugSuppress;
const common_1 = require("@nestjs/common");
const sdk_debug_constants_1 = require("./sdk-debug.constants");
/**
 * @SdkDebug() — attach debug metadata to a controller or route handler.
 * The interceptor reads this metadata and enriches log entries accordingly.
 *
 * @example
 * \@SdkDebug({ event: 'sdk.payment.create', label: 'CreatePayment' })
 * \@Post('payments')
 * createPayment() { ... }
 */
function SdkDebug(options = {}) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(sdk_debug_constants_1.SDK_DEBUG_METADATA_KEY, options));
}
/**
 * @SdkDebugSuppress() — completely suppress debug output for this route.
 */
function SdkDebugSuppress() {
    return SdkDebug({ suppress: true });
}
//# sourceMappingURL=sdk-debug.decorator.js.map