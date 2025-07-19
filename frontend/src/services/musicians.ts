import { apiConfig } from "../config/api";
import { Goal } from "../pages/Growth/utils";

export async function createGoal(
  musicianId: number,
  goal: Omit<Goal, "id" | "createdAt">
): Promise<Goal> {
  const res = await fetch(apiConfig.endpoints.musicians.goals(musicianId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

export async function deleteGoal(
  musicianId: number,
  goalId: string | number
): Promise<void> {
  const res = await fetch(
    `${apiConfig.endpoints.musicians.goals(musicianId)}/${goalId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to delete goal");
}
