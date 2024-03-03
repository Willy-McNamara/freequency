"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusiciansModule = void 0;
const common_1 = require("@nestjs/common");
const musicians_service_1 = require("./musicians.service");
const musicians_controller_1 = require("./musicians.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let MusiciansModule = class MusiciansModule {
};
exports.MusiciansModule = MusiciansModule;
exports.MusiciansModule = MusiciansModule = __decorate([
    (0, common_1.Module)({
        controllers: [musicians_controller_1.MusiciansController],
        providers: [musicians_service_1.MusiciansService, prisma_service_1.PrismaService, jwt_1.JwtService],
    })
], MusiciansModule);
//# sourceMappingURL=musicians.module.js.map