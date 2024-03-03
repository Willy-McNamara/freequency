"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const sessions_service_1 = require("./sessions/sessions.service");
const musicians_service_1 = require("./musicians/musicians.service");
let AppController = class AppController {
    constructor(appService, musiciansService, sessionsService) {
        this.appService = appService;
        this.musiciansService = musiciansService;
        this.sessionsService = sessionsService;
    }
    async initialRender(req) {
        console.log('logging req.user in initialRender, this is the return of jwtGuard', req.user);
        const musicianData = await this.musiciansService.getMusicianById(4);
        const sessionsData = await this.sessionsService.getAllSessions();
        const combinedData = this.appService.formatRenderPayload(musicianData, sessionsData);
        return combinedData;
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('/initialRender'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "initialRender", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        musicians_service_1.MusiciansService,
        sessions_service_1.SessionsService])
], AppController);
//# sourceMappingURL=app.controller.js.map