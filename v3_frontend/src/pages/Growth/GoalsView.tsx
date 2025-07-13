import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";

interface Goal {
  id: string;
  tag: string;
  type: "duration" | "frequency";
  target: number;
  timeFrame: "daily" | "weekly" | "monthly" | "annually";
  createdAt: string;
}

interface GoalsViewProps {
  onBack: () => void;
  goals: Goal[];
  userTags: Array<{ id: number; label: string; color?: string }>;
  isGoalModalOpen: boolean;
  onGoalModalOpenChange: (open: boolean) => void;
  editingGoal: Goal | null;
  newGoal: Omit<Goal, "id" | "createdAt">;
  onNewGoalChange: (goal: Omit<Goal, "id" | "createdAt">) => void;
  onEditingGoalChange: (goal: Goal | null) => void;
  onDeleteGoal: (goalId: string) => void;
  onCreateGoal: () => void;
  onEditGoal: () => void;
  formatGoalSummary: (goal: Goal) => string;
  calculateGoalProgress: (goal: Goal, allTasksInUse: any[]) => number;
  allTasksInUse: any[];
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  onBack,
  goals,
  userTags,
  isGoalModalOpen,
  onGoalModalOpenChange,
  editingGoal,
  newGoal,
  onNewGoalChange,
  onEditingGoalChange,
  onDeleteGoal,
  onCreateGoal,
  onEditGoal,
  formatGoalSummary,
  calculateGoalProgress,
  allTasksInUse,
}) => {
  const openCreateModal = () => {
    onEditingGoalChange(null);
    onGoalModalOpenChange(true);
  };

  const openEditModal = (goal: Goal) => {
    onEditingGoalChange(goal);
    onGoalModalOpenChange(true);
  };

  return (
    <div className="w-[75vw] mx-auto">
      <div className="flex justify-start mb-2">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-sm text-muted-foreground"
        >
          &larr; Back
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-4">Goals</h1>
      {/* Add Goal Button */}
      <div className="flex justify-center mb-6">
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Goal
        </Button>
      </div>
      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal, allTasksInUse);
          const progressPercentage = Math.min(
            (progress / goal.target) * 100,
            100
          );
          const isComplete = progress >= goal.target;
          return (
            <Card
              key={goal.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => openEditModal(goal)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {formatGoalSummary(goal)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Progress: {progress} / {goal.target}{" "}
                        {goal.type === "duration" ? "minutes" : "sessions"}
                      </span>
                      <span
                        className={`font-semibold ${
                          isComplete ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(goal);
                      }}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGoal(goal.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isComplete ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Goal Modal */}
      <Dialog open={isGoalModalOpen} onOpenChange={onGoalModalOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Tag Selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tag</label>
              <select
                className="w-full p-2 border rounded-md"
                value={editingGoal?.tag || newGoal.tag}
                onChange={(e) => {
                  if (editingGoal) {
                    onEditingGoalChange({
                      ...editingGoal,
                      tag: e.target.value,
                    });
                  } else {
                    onNewGoalChange({ ...newGoal, tag: e.target.value });
                  }
                }}
              >
                <option value="All Tags">All Tags</option>
                {userTags.map((tag) => (
                  <option key={tag.id} value={tag.label}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Goal Type */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Goal Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={editingGoal?.type || newGoal.type}
                onChange={(e) => {
                  if (editingGoal) {
                    onEditingGoalChange({
                      ...editingGoal,
                      type: e.target.value as "duration" | "frequency",
                    });
                  } else {
                    onNewGoalChange({
                      ...newGoal,
                      type: e.target.value as "duration" | "frequency",
                    });
                  }
                }}
              >
                <option value="duration">Duration (minutes)</option>
                <option value="frequency">Frequency (sessions)</option>
              </select>
            </div>
            {/* Target Amount */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Target Amount</label>
              <Input
                type="number"
                min="1"
                value={editingGoal?.target || newGoal.target}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (editingGoal) {
                    onEditingGoalChange({ ...editingGoal, target: value });
                  } else {
                    onNewGoalChange({ ...newGoal, target: value });
                  }
                }}
              />
            </div>
            {/* Time Frame */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Time Frame</label>
              <select
                className="w-full p-2 border rounded-md"
                value={editingGoal?.timeFrame || newGoal.timeFrame}
                onChange={(e) => {
                  if (editingGoal) {
                    onEditingGoalChange({
                      ...editingGoal,
                      timeFrame: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "annually",
                    });
                  } else {
                    onNewGoalChange({
                      ...newGoal,
                      timeFrame: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "annually",
                    });
                  }
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onGoalModalOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={editingGoal ? onEditGoal : onCreateGoal}
              disabled={
                editingGoal
                  ? !editingGoal.target || editingGoal.target <= 0
                  : !newGoal.target || newGoal.target <= 0
              }
            >
              {editingGoal ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
