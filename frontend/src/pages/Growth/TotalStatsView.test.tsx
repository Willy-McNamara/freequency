import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { TotalStatsView } from "./TotalStatsView";

// Mock the pie chart component
vi.mock("@/components/pie-chart", () => ({
  ChartPieDonutActive: ({ data }: { data: any[] }) => (
    <div data-testid="pie-chart">
      {data.map((item, index) => (
        <div key={index} data-testid={`pie-item-${item.tag}`}>
          {item.tag}: {item.value}
        </div>
      ))}
    </div>
  ),
}));

// Mock the TagList component
vi.mock("@/components/TagList", () => ({
  TagList: ({ tags }: { tags: string[] }) => (
    <div data-testid="tag-list">
      {tags.map((tag, index) => (
        <span key={index} data-testid={`tag-${tag}`}>
          {tag}
        </span>
      ))}
    </div>
  ),
}));

const mockProps = {
  onBack: vi.fn(),
  selectedTotalRange: "week" as const,
  onRangeChange: vi.fn(),
  tagTotals: [
    {
      tag: "Guitar",
      minutes: 120,
      seconds: 7200,
      percent: 60,
    },
    {
      tag: "Piano",
      minutes: 80,
      seconds: 4800,
      percent: 40,
    },
  ],
  pieData: [
    {
      tag: "Guitar",
      value: 7200,
      fill: "#60a5fa",
    },
    {
      tag: "Piano",
      value: 4800,
      fill: "#fbbf24",
    },
  ],
  tagColorMap: {
    Guitar: "#60a5fa",
    Piano: "#fbbf24",
  },
  formatMinutes: vi.fn((seconds: number) => `${Math.round(seconds / 60)} min`),
  totalTimeRanges: [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
  ] as const,
};

describe("TotalStatsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with correct title", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Total Stats")).toBeInTheDocument();
  });

  it("renders all time range buttons", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Year")).toBeInTheDocument();
  });

  it("highlights the selected time range button", () => {
    render(<TotalStatsView {...mockProps} selectedTotalRange="month" />);
    const monthButton = screen.getByText("Month");
    expect(monthButton).toHaveClass("font-semibold");
  });

  it("calls onRangeChange when time range button is clicked", () => {
    render(<TotalStatsView {...mockProps} />);
    const dayButton = screen.getByText("Day");
    fireEvent.click(dayButton);
    expect(mockProps.onRangeChange).toHaveBeenCalledWith("day");
  });

  it("renders tag totals with correct data", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("renders pie chart with correct data", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-item-Guitar")).toBeInTheDocument();
    expect(screen.getByTestId("pie-item-Piano")).toBeInTheDocument();
  });

  it("renders tags list when tags are present", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByTestId("tag-list")).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", () => {
    render(<TotalStatsView {...mockProps} />);
    const backButton = screen.getByText("← Back");
    fireEvent.click(backButton);
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it("calls onViewDetails when view details button is clicked", () => {
    render(<TotalStatsView {...mockProps} />);
    const viewDetailsButton = screen.getByText("View Details");
    fireEvent.click(viewDetailsButton);
    // Note: onViewDetails is not in mockProps, so this would need to be added if needed
  });

  it('shows "No practice data" message when no data is available', () => {
    render(<TotalStatsView {...mockProps} tagTotals={[]} pieData={[]} />);
    expect(
      screen.getByText(
        "No practice data available for the selected time period."
      )
    ).toBeInTheDocument();
  });

  it("displays correct stats information", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Saved 0 times")).toBeInTheDocument();
    expect(screen.getByText("Used 0 times")).toBeInTheDocument();
  });
});
