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
  // Navigation props
  currentIndex: 0,
  onCurrentIndexChange: vi.fn(),
  periodLabel: "Jan 15 - Jan 21, 2024",
  canGoBack: true,
  canGoForward: false,
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

  it("renders tag breakdown cards when tags are present", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", () => {
    render(<TotalStatsView {...mockProps} />);
    const backButton = screen.getByText("← Back");
    fireEvent.click(backButton);
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it("renders tag totals with correct formatting", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Total: 120 min")).toBeInTheDocument();
    expect(screen.getByText("Total: 80 min")).toBeInTheDocument();
  });

  it('shows "No practice data" message when no data is available', () => {
    render(<TotalStatsView {...mockProps} tagTotals={[]} pieData={[]} />);
    expect(
      screen.getByText(
        "No practice data available for the selected time period."
      )
    ).toBeInTheDocument();
  });

  it("displays correct tag percentages", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("renders time navigation with period label", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByText("Jan 15 - Jan 21, 2024")).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(<TotalStatsView {...mockProps} />);
    expect(screen.getByLabelText("Previous")).toBeInTheDocument();
    expect(screen.getByLabelText("Next")).toBeInTheDocument();
  });

  it("disables navigation buttons when appropriate", () => {
    render(
      <TotalStatsView {...mockProps} canGoBack={false} canGoForward={false} />
    );
    const prevButton = screen.getByLabelText("Previous");
    const nextButton = screen.getByLabelText("Next");
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("calls onCurrentIndexChange when navigation buttons are clicked", () => {
    render(
      <TotalStatsView {...mockProps} canGoBack={true} canGoForward={true} />
    );
    const prevButton = screen.getByLabelText("Previous");
    const nextButton = screen.getByLabelText("Next");

    fireEvent.click(prevButton);
    expect(mockProps.onCurrentIndexChange).toHaveBeenCalledWith(1);

    fireEvent.click(nextButton);
    expect(mockProps.onCurrentIndexChange).toHaveBeenCalledWith(0);
  });
});
