import { apiClient } from "./auth";
import { Goal } from "../pages/Growth/utils";

export async function createGoal(
  musicianId: number,
  goal: Omit<Goal, "id" | "createdAt">
): Promise<Goal> {
  const response = await apiClient.post<Goal>(
    `/musicians/${musicianId}/goals`,
    goal
  );
  if (response.error) {
    throw new Error(response.error);
  }
  if (!response.data) {
    throw new Error("No data received from server");
  }
  return response.data;
}

export async function deleteGoal(
  musicianId: number,
  goalId: string | number
): Promise<void> {
  const response = await apiClient.delete<void>(
    `/musicians/${musicianId}/goals/${goalId}`
  );
  if (response.error) {
    throw new Error(response.error);
  }
}
