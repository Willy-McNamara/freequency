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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const sessions_service_1 = require("./sessions.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let SessionsController = class SessionsController {
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    async getSessionsOnRender() {
        return this.sessionsService.getFiveSessions();
    }
    async getNextChunk(body) {
        return this.sessionsService.getSessionsChunk(body.cursor);
    }
    async createSession(body, req) {
        const newSession = {
            title: body.title,
            notes: body.notes,
            instruments: body.instruments,
            duration: body.duration,
            isPublic: body.isPublic,
            musicianId: req.user.id,
        };
        return this.sessionsService.createSession(newSession);
    }
    async addComment(body, req) {
        console.log('req.user.id:', req.user.id);
        const newComment = {
            text: body.text,
            musicianId: req.user.id,
            sessionId: body.sessionId,
        };
        console.log('addComment route hit. logging body:', newComment);
        return this.sessionsService.addComment(newComment);
    }
    async addGasUp(body, req) {
        console.log('req.user.id:', req.user.id);
        const newGasUp = {
            gasserId: req.user.id,
            musicianId: body.musicianId,
            sessionId: body.sessionId,
        };
        console.log('addGasUp route hit. logging body:', newGasUp);
        return this.sessionsService.addGasUp(newGasUp);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessionsOnRender", null);
__decorate([
    (0, common_1.Post)('nextChunk'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getNextChunk", null);
__decorate([
    (0, common_1.Post)('newSession'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('addComment'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)('addGasUp'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "addGasUp", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map