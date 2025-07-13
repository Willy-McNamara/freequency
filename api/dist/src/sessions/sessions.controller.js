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
const s3_service_1 = require("../s3/s3.service");
const media_service_1 = require("../media/media.service");
let SessionsController = class SessionsController {
    constructor(sessionsService, s3service, mediaService) {
        this.sessionsService = sessionsService;
        this.s3service = s3service;
        this.mediaService = mediaService;
    }
    async getSessionsOnRender(req, cursor, users, instruments, tags, saved, following) {
        console.log('Sessions endpoint called with filters:', {
            cursor,
            users,
            instruments,
            tags,
            saved,
            following,
        });
        if (following === 'true') {
            return this.sessionsService.getSessionsFromFollowedUsers(req.user.id, cursor);
        }
        const filters = {
            users: users ? users.split(',') : [],
            instruments: instruments ? instruments.split(',') : [],
            tags: tags ? tags.split(',') : [],
            saved: saved === 'true',
        };
        const result = await this.sessionsService.getSessionsWithFilters(filters, cursor);
        console.log('Sessions result:', {
            count: result.sessions.length,
            hasNextCursor: !!result.nextCursor,
        });
        return result;
    }
    async createSessionWithoutAudio(body, req) {
        const createSession = {
            title: body.title,
            notes: body.notes,
            instruments: body.instruments,
            tags: body.tags,
            duration: body.duration,
            isPublic: true,
            musicianId: req.user.id,
            tasks: body.tasks || [],
        };
        const newSession = await this.sessionsService.createSession(createSession);
        return newSession;
    }
    async addComment(body, req) {
        const newComment = {
            text: body.text,
            musicianId: req.user.id,
            sessionId: body.sessionId,
        };
        return this.sessionsService.addComment(newComment);
    }
    async addGasUp(body, req) {
        const newGasUp = {
            gasserId: req.user.id,
            musicianId: body.musicianId,
            sessionId: body.sessionId,
        };
        return this.sessionsService.addGasUp(newGasUp);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('users')),
    __param(3, (0, common_1.Query)('instruments')),
    __param(4, (0, common_1.Query)('tags')),
    __param(5, (0, common_1.Query)('saved')),
    __param(6, (0, common_1.Query)('following')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessionsOnRender", null);
__decorate([
    (0, common_1.Post)('newSessionWithoutAudio'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "createSessionWithoutAudio", null);
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
    __metadata("design:paramtypes", [sessions_service_1.SessionsService,
        s3_service_1.S3Service,
        media_service_1.MediaService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map