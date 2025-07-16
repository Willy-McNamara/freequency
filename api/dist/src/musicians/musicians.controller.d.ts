import { MusiciansService } from './musicians.service';
import { MusicianFrontendDTO, ProfileUpdateDto, GoalDto } from './dto/musician.dto';
export declare class MusiciansController {
    private readonly musiciansService;
    constructor(musiciansService: MusiciansService);
    getAllDisplayNames(): Promise<string[]>;
    getAllIdNames(): Promise<{
        id: number;
        displayName: string;
    }[]>;
    getMusicianById(id: string, req: any): Promise<MusicianFrontendDTO | null>;
    getGoalsForMusician(id: string): Promise<GoalDto[]>;
    createGoalForMusician(id: string, goalDto: GoalDto): Promise<GoalDto>;
    deleteGoal(id: string, goalId: string): Promise<void>;
    followMusician(id: string, req: any): Promise<void>;
    unfollowMusician(id: string, req: any): Promise<void>;
    getFollowStatus(id: string, req: any): Promise<{
        isFollowing: boolean;
    }>;
    getFollowCounts(id: string): Promise<{
        followerCount: number;
        followingCount: number;
    }>;
    updateProfile(id: string, profileUpdateDto: ProfileUpdateDto, req: any): Promise<MusicianFrontendDTO>;
}
