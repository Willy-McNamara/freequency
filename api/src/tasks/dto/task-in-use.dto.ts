export class TaskInUseDto {
  id: number;
  createdAt: Date;
  duration: number;
  notes: string;
  isSessionTask: boolean;
  checklistCompletions: string[];
  taskDefinitionId?: number | null;
  musicianId: number;
  sessionId: number;
  tags: string[];
}
