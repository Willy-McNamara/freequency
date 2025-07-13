import { MusiciansService } from './musicians.service';
import { MusicianFrontendDTO, GoalDto } from './dto/musician.dto';
export declare class MusiciansController {
    private readonly musiciansService;
    constructor(musiciansService: MusiciansService);
    getAllDisplayNames(): Promise<string[]>;
    getMusicianById(id: string): Promise<MusicianFrontendDTO>;
    getGoalsForMusician(id: string): Promise<GoalDto[]>;
    createGoalForMusician(id: string, goalDto: GoalDto): Promise<GoalDto>;
    deleteGoalForMusician(id: string, goalId: string): Promise<{
        success: boolean;
    }>;
}
