"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerZeroModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const layerzero_service_1 = require("../services/layerzero.service");
const layerzero_controller_1 = require("../controllers/layerzero.controller");
let LayerZeroModule = class LayerZeroModule {
};
exports.LayerZeroModule = LayerZeroModule;
exports.LayerZeroModule = LayerZeroModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [layerzero_controller_1.LayerZeroController],
        providers: [layerzero_service_1.LayerZeroService],
        exports: [layerzero_service_1.LayerZeroService],
    })
], LayerZeroModule);
//# sourceMappingURL=layerzero.module.js.map