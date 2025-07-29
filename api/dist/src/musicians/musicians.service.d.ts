import { PrismaService } from '../prisma/prisma.service';
import { CreateMusicianDto, MusicianDto, MusicianFrontendDTO, MusicianJwtDto, MusicianUpdateDto, GoalDto, ProfileUpdateDto } from './dto/musician.dto';
export declare class MusiciansService {
    private prisma;
    constructor(prisma: PrismaService);
    getMusicianById(id: number, currentUserId?: number): Promise<MusicianFrontendDTO | null>;
    getGoalsForMusician(musicianId: number): Promise<GoalDto[]>;
    createMusician(createMusicianDto: CreateMusicianDto): Promise<MusicianDto>;
    findOrCreateMusician(loginInfo: CreateMusicianDto): Promise<MusicianJwtDto>;
    formatMusicianForJwt(musician: any): MusicianJwtDto;
    updateMusician(musicianUpdateDto: MusicianUpdateDto): Promise<MusicianFrontendDTO>;
    updateProfile(musicianId: number, profileUpdateDto: ProfileUpdateDto): Promise<MusicianFrontendDTO>;
    formatMusicianForFrontend(musician: any): MusicianFrontendDTO;
    getAllDisplayNames(): Promise<string[]>;
    getAllIdNames(): Promise<{
        id: number;
        displayName: string;
        avatarUrl: string | null;
    }[]>;
    createGoalForMusician(musicianId: number, goalDto: GoalDto): Promise<GoalDto>;
    deleteGoalForMusician(musicianId: number, goalId: number): Promise<void>;
    updateGoalForMusician(musicianId: number, goalId: number, goalDto: GoalDto): Promise<GoalDto>;
    followMusician(followerId: number, followingId: number): Promise<void>;
    unfollowMusician(followerId: number, followingId: number): Promise<void>;
    getFollowStatus(followerId: number, followingId: number): Promise<{
        isFollowing: boolean;
    }>;
    getFollowCounts(musicianId: number): Promise<{
        followerCount: number;
        followingCount: number;
    }>;
}
