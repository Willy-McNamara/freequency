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
const platform_express_1 = require("@nestjs/platform-express");
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
    async getSession(req, id) {
        return this.sessionsService.getSession(parseInt(id));
    }
    async getSessions(req, cursor, users, instruments, tags, saved, following) {
        let userIdList = users
            ? users
                .split(',')
                .map((id) => parseInt(id, 10))
                .filter((id) => !isNaN(id))
            : [];
        if (following === 'true') {
            const followedUserIds = await this.sessionsService.getFollowedUserIds(req.user.id);
            userIdList = Array.from(new Set([...userIdList, ...followedUserIds]));
        }
        return this.sessionsService.getSessionsWithFilters({
            userIds: userIdList,
            instruments: instruments ? instruments.split(',') : [],
            tags: tags ? tags.split(',') : [],
            saved: saved === 'true',
        }, cursor);
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
    async getSignedUrl(body, req) {
        const { size, type, fileName } = body;
        const filePayload = {
            size,
            type,
            musicianId: req.user.id,
        };
        const signedUrl = await this.s3service.getSignedURL(filePayload, fileName);
        if (signedUrl.startsWith('File size') ||
            signedUrl.startsWith('File type')) {
            throw new Error(signedUrl);
        }
        return { signedUrl };
    }
    async connectMedia(body, req) {
        const { fileName, sessionId } = body;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        let mediaType;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
            mediaType = 'image';
        }
        else if (['mp3', 'wav', 'm4a', 'ogg', 'webm'].includes(fileExtension || '')) {
            mediaType = 'audio';
        }
        else if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(fileExtension || '')) {
            mediaType = 'video';
        }
        else {
            throw new Error('Unsupported file type');
        }
        const newMedia = await this.mediaService.addMediaItem(fileName, req.user.id, mediaType, sessionId);
        return newMedia;
    }
    async uploadMedia(file, body, req) {
        const { sessionId } = body;
        const timestamp = Date.now();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `media/${req.user.id}/${timestamp}.${fileExtension}`;
        const url = await this.s3service.uploadFile(file.buffer, fileName, file.mimetype, req.user.id);
        if (sessionId) {
            await this.connectMedia({
                fileName,
                sessionId: parseInt(sessionId),
            }, req);
        }
        return {
            url,
            fileName: file.originalname,
        };
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSession", null);
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
], SessionsController.prototype, "getSessions", null);
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
__decorate([
    (0, common_1.Post)('signed-url'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSignedUrl", null);
__decorate([
    (0, common_1.Post)('connect-media'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "connectMedia", null);
__decorate([
    (0, common_1.Post)('upload-media'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "uploadMedia", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService,
        s3_service_1.S3Service,
        media_service_1.MediaService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map