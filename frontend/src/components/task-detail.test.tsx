import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { TaskDetail } from "./task-detail";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the icons
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Bookmark: () => <div data-testid="bookmark-icon">Bookmark</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  BookmarkIcon: () => <div data-testid="bookmark-icon">BookmarkIcon</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
}));

// Mock the Separator component
vi.mock("./ui/separator", () => ({
  Separator: ({
    orientation,
    className,
  }: {
    orientation: string;
    className: string;
  }) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      className={className}
    >
      Separator
    </div>
  ),
}));

// Mock the RichTextRenderer component
vi.mock("./rich-text", () => ({
  RichTextRenderer: ({ content }: { content: string }) => (
    <div data-testid="rich-text-renderer">{content}</div>
  ),
}));

// Mock the TagList component
vi.mock("./TagList", () => ({
  TagList: ({ tags }: { tags: string[] }) => (
    <div data-testid="tag-list">
      {tags.map((tag, index) => (
        <span key={index} data-testid={`tag-${index}`}>
          {tag}
        </span>
      ))}
    </div>
  ),
}));

// Mock the Section component
vi.mock("./layout/Section", () => ({
  Section: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="section" className={className}>
      {children}
    </div>
  ),
}));

// Mock the Button component
vi.mock("./ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

const mockTask = {
  id: 2,
  title: "Child Task",
  description: "This is a child task description",
  instrument: "Guitar",
  user: {
    id: 2,
    displayName: "Child User",
    avatarUrl: undefined,
  },
  tags: [
    { id: 1, label: "guitar", color: "#ff0000" },
    { id: 2, label: "practice", color: "#00ff00" },
  ],
  checklist: ["Step 1", "Step 2"],
  savedCount: 5,
  usedCount: 10,
  isSaved: false,
};

const mockTaskWithParent = {
  ...mockTask,
  parentTask: {
    id: 1,
    title: "Parent Task",
    description: "This is a parent task description",
    instrument: "Piano",
    user: {
      id: 1,
      displayName: "Parent User",
      avatarUrl: undefined,
    },
    tags: [
      { id: 3, label: "piano", color: "#0000ff" },
      { id: 4, label: "beginner", color: "#ffff00" },
    ],
    checklist: ["Parent Step 1", "Parent Step 2"],
    savedCount: 15,
    usedCount: 25,
  },
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("TaskDetail", () => {
  const mockOnBack = vi.fn();
  const mockOnModifyTask = vi.fn();
  const mockOnUseInCurrentSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders task details correctly", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    expect(screen.getByText("Child Task")).toBeInTheDocument();
    expect(
      screen.getByText("This is a child task description")
    ).toBeInTheDocument();
    expect(screen.getByText("by Child User")).toBeInTheDocument();
    expect(screen.getByText("Saved 5 times")).toBeInTheDocument();
    expect(screen.getByText("Used 10 times")).toBeInTheDocument();
  });

  it("renders parent task information when parent exists", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTaskWithParent}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    expect(screen.getByText("Child Task")).toBeInTheDocument();
    expect(screen.getByText("by Child User")).toBeInTheDocument();
    expect(screen.getByText("based on")).toBeInTheDocument();
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("does not render parent task information when no parent exists", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    expect(screen.getByText("Child Task")).toBeInTheDocument();
    expect(screen.getByText("by Child User")).toBeInTheDocument();
    expect(screen.queryByText("parent task")).not.toBeInTheDocument();
    expect(screen.queryByTestId("separator")).not.toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    const backButton = screen.getByText("Back to Task Library");
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("calls onModifyTask when modify button is clicked", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    const modifyButton = screen.getByText("Make it your own");
    fireEvent.click(modifyButton);

    expect(mockOnModifyTask).toHaveBeenCalledWith(mockTask);
  });

  it("passes parent task ID when modifying a task with parent", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTaskWithParent}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    const modifyButton = screen.getByText("Make it your own");
    fireEvent.click(modifyButton);

    expect(mockOnModifyTask).toHaveBeenCalledWith(mockTaskWithParent);
  });

  it("navigates to user profile when user name is clicked", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    const userName = screen.getByText("by Child User");
    fireEvent.click(userName);

    expect(mockNavigate).toHaveBeenCalledWith("/profile?user=2");
  });

  it("navigates to parent task when 'based on' text is clicked", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTaskWithParent}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    const parentTaskText = screen.getByText("based on");
    fireEvent.click(parentTaskText);

    expect(mockNavigate).toHaveBeenCalledWith("/task-library?task=1");
  });

  it("shows use in current session button when hasActiveSession is true", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
        hasActiveSession={true}
        onUseInCurrentSession={mockOnUseInCurrentSession}
      />
    );

    const useButton = screen.getByText("Use in current session");
    expect(useButton).toBeInTheDocument();
  });

  it("does not show use in current session button when hasActiveSession is false", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
        hasActiveSession={false}
      />
    );

    expect(
      screen.queryByText("Use in current session")
    ).not.toBeInTheDocument();
  });

  it("calls onUseInCurrentSession when use button is clicked", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
        hasActiveSession={true}
        onUseInCurrentSession={mockOnUseInCurrentSession}
      />
    );

    const useButton = screen.getByText("Use in current session");
    fireEvent.click(useButton);

    expect(mockOnUseInCurrentSession).toHaveBeenCalledWith(mockTask);
  });

  it("renders checklist items when checklist exists", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("renders tags correctly", () => {
    renderWithRouter(
      <TaskDetail
        task={mockTask}
        onBack={mockOnBack}
        onModifyTask={mockOnModifyTask}
      />
    );

    expect(screen.getByTestId("tag-list")).toBeInTheDocument();
    expect(screen.getByTestId("tag-0")).toHaveTextContent("guitar");
    expect(screen.getByTestId("tag-1")).toHaveTextContent("practice");
  });
});
