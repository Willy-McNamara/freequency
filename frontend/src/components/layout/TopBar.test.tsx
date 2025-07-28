import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TopBar } from "./TopBar";
import { BrowserRouter } from "react-router-dom";

// Mock the auth context
const mockLogout = vi.fn();
const mockUser = {
  id: "1",
  email: "test@example.com",
  displayName: "Test User",
  name: "Test User",
};

// Mock the auth context value
const mockAuthValue = {
  user: mockUser,
  logout: mockLogout,
  login: vi.fn(),
  isLoading: false,
};

// Mock the AuthProvider to return our mock values
vi.mock("../auth/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthValue,
}));

// Mock the HamburgerMenu component
vi.mock("../HamburgerMenu", () => ({
  HamburgerMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="hamburger-menu">{children}</div>
  ),
}));

// Mock the Avatar component
vi.mock("../ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}));

// Mock the Button component
vi.mock("../ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock the NavLink component
vi.mock("react-router", () => ({
  NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid={`nav-link-${to}`} href={to}>
      {children}
    </a>
  ),
}));

// Mock the LogOut icon
vi.mock("lucide-react", () => ({
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
}));

// Mock the logo image
vi.mock("/logo.svg", () => "mocked-logo.svg");

const renderTopBar = () => {
  return render(
    <BrowserRouter>
      <TopBar />
    </BrowserRouter>
  );
};

describe("TopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the TopBar component", () => {
    renderTopBar();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("displays user information when user is logged in", () => {
    renderTopBar();

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("displays navigation links", () => {
    renderTopBar();

    expect(screen.getByTestId("nav-link-/")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-/practice")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-/task-library")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-/growth")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-/profile")).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-link-/about")).toHaveLength(2); // One in menu, one in logo
  });

  it("displays the logo", () => {
    renderTopBar();

    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.svg");
  });

  it("handles logout when logout button is clicked", async () => {
    renderTopBar();

    const logoutButton = screen.getByTestId("button");
    expect(logoutButton).toHaveTextContent("Logout");

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it("displays hamburger menu", () => {
    renderTopBar();

    expect(screen.getByTestId("hamburger-menu")).toBeInTheDocument();
  });

  it("displays logout icon", () => {
    renderTopBar();

    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });
});
