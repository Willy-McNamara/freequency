import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PracticeTaskList } from "./practice-task-list";

// Mock the icons
vi.mock("lucide-react", () => ({
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Pencil: () => <div data-testid="pencil-icon">Pencil</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
}));

describe("PracticeTaskList", () => {
  const mockOnAddNew = vi.fn();
  const mockOnEditTask = vi.fn();
  const mockOnDeleteTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders with title", () => {
    render(<PracticeTaskList tasks={[]} />);

    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("renders add new task button", () => {
    render(<PracticeTaskList tasks={[]} onAddNew={mockOnAddNew} />);

    expect(screen.getByText("Add new task")).toBeInTheDocument();
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  it("calls onAddNew when add button is clicked", () => {
    render(<PracticeTaskList tasks={[]} onAddNew={mockOnAddNew} />);

    const addButton = screen.getByText("Add new task");
    fireEvent.click(addButton);

    expect(mockOnAddNew).toHaveBeenCalled();
  });

  it("renders tasks when provided", () => {
    const tasks = [
      { id: "1", title: "Practice scales" },
      { id: "2", title: "Learn new song" },
    ];

    render(<PracticeTaskList tasks={tasks} />);

    expect(screen.getByText("Practice scales")).toBeInTheDocument();
    expect(screen.getByText("Learn new song")).toBeInTheDocument();
  });

  it("renders edit and delete buttons for each task", () => {
    const tasks = [{ id: "1", title: "Practice scales" }];

    render(
      <PracticeTaskList
        tasks={tasks}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const editButtons = screen.getAllByLabelText("Edit task");
    const deleteButtons = screen.getAllByLabelText("Delete task");

    expect(editButtons).toHaveLength(1);
    expect(deleteButtons).toHaveLength(1);
  });

  it("calls onEditTask when edit button is clicked", () => {
    const tasks = [{ id: "1", title: "Practice scales" }];

    render(<PracticeTaskList tasks={tasks} onEditTask={mockOnEditTask} />);

    const editButton = screen.getByLabelText("Edit task");
    fireEvent.click(editButton);

    expect(mockOnEditTask).toHaveBeenCalledWith("1");
  });

  it("calls onDeleteTask when delete button is clicked", () => {
    const tasks = [{ id: "1", title: "Practice scales" }];

    render(<PracticeTaskList tasks={tasks} onDeleteTask={mockOnDeleteTask} />);

    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    expect(mockOnDeleteTask).toHaveBeenCalledWith("1");
  });

  it("calls onEditTask when task title is clicked", () => {
    const tasks = [{ id: "1", title: "Practice scales" }];

    render(<PracticeTaskList tasks={tasks} onEditTask={mockOnEditTask} />);

    const taskButton = screen.getByText("Practice scales");
    fireEvent.click(taskButton);

    expect(mockOnEditTask).toHaveBeenCalledWith("1");
  });

  it("applies custom className", () => {
    const { container } = render(
      <PracticeTaskList tasks={[]} className="custom-class" />
    );

    // The className is applied to the inner div with the border
    const innerDiv = container.querySelector(".border-dotted") as HTMLElement;
    expect(innerDiv).toHaveClass("custom-class");
  });

  it("handles multiple tasks correctly", () => {
    const tasks = [
      { id: "1", title: "Task 1" },
      { id: "2", title: "Task 2" },
      { id: "3", title: "Task 3" },
    ];

    render(
      <PracticeTaskList
        tasks={tasks}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();

    const editButtons = screen.getAllByLabelText("Edit task");
    const deleteButtons = screen.getAllByLabelText("Delete task");

    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it("handles empty tasks array", () => {
    render(<PracticeTaskList tasks={[]} />);

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.queryByText("Practice scales")).not.toBeInTheDocument();
  });

  it("shows edit/delete buttons even when callbacks are not provided", () => {
    const tasks = [{ id: "1", title: "Practice scales" }];

    render(<PracticeTaskList tasks={tasks} />);

    // Buttons are always rendered, they just call optional callbacks
    expect(screen.getByLabelText("Edit task")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete task")).toBeInTheDocument();
  });
});
