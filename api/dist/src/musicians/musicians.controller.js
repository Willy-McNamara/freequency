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
exports.MusiciansController = void 0;
const common_1 = require("@nestjs/common");
const musicians_service_1 = require("./musicians.service");
const musician_dto_1 = require("./dto/musician.dto");
const jwt_guard_1 = require("../auth/jwt.guard");
let MusiciansController = class MusiciansController {
    constructor(musiciansService) {
        this.musiciansService = musiciansService;
    }
    async getAllDisplayNames() {
        return this.musiciansService.getAllDisplayNames();
    }
    async getAllIdNames() {
        return this.musiciansService.getAllIdNames();
    }
    async getMusicianById(id, req) {
        const currentUserId = req.user?.id;
        return this.musiciansService.getMusicianById(Number(id), currentUserId);
    }
    async getGoalsForMusician(id) {
        return this.musiciansService.getGoalsForMusician(Number(id));
    }
    async createGoalForMusician(id, goalDto) {
        return this.musiciansService.createGoalForMusician(Number(id), goalDto);
    }
    async deleteGoal(id, goalId) {
        await this.musiciansService.deleteGoalForMusician(Number(id), Number(goalId));
    }
    async followMusician(id, req) {
        await this.musiciansService.followMusician(req.user.id, Number(id));
    }
    async unfollowMusician(id, req) {
        await this.musiciansService.unfollowMusician(req.user.id, Number(id));
    }
    async getFollowStatus(id, req) {
        return this.musiciansService.getFollowStatus(req.user.id, Number(id));
    }
    async getFollowCounts(id) {
        return this.musiciansService.getFollowCounts(Number(id));
    }
    async updateProfile(id, profileUpdateDto, req) {
        if (Number(id) !== req.user.id) {
            throw new Error('Unauthorized: Can only update your own profile');
        }
        return this.musiciansService.updateProfile(Number(id), profileUpdateDto);
    }
};
exports.MusiciansController = MusiciansController;
__decorate([
    (0, common_1.Get)('all-display-names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "getAllDisplayNames", null);
__decorate([
    (0, common_1.Get)('all-id-names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "getAllIdNames", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "getMusicianById", null);
__decorate([
    (0, common_1.Get)(':id/goals'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "getGoalsForMusician", null);
__decorate([
    (0, common_1.Post)(':id/goals'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, musician_dto_1.GoalDto]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "createGoalForMusician", null);
__decorate([
    (0, common_1.Delete)(':id/goals/:goalId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('goalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "deleteGoal", null);
__decorate([
    (0, common_1.Post)(':id/follow'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "followMusician", null);
__decorate([
    (0, common_1.Delete)(':id/follow'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "unfollowMusician", null);
__decorate([
    (0, common_1.Get)(':id/follow-status'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "getFollowStatus", null);
__decorate([
    (0, common_1.Get)(':id/follow-counts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "getFollowCounts", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, musician_dto_1.ProfileUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], MusiciansController.prototype, "updateProfile", null);
exports.MusiciansController = MusiciansController = __decorate([
    (0, common_1.Controller)('musicians'),
    __metadata("design:paramtypes", [musicians_service_1.MusiciansService])
], MusiciansController);
//# sourceMappingURL=musicians.controller.js.map