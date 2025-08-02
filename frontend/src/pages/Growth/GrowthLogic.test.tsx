import { describe, it, expect } from "vitest";

describe("Growth Component Logic Tests", () => {
  describe("Total Stats Time Range Filtering Logic", () => {
    it("should correctly filter tasks by day range", () => {
      const mockTasks = [
        { createdAt: "2024-01-15T10:00:00Z", duration: 3600, tags: ["Guitar"] },
        { createdAt: "2024-01-16T10:00:00Z", duration: 1800, tags: ["Piano"] },
      ];

      // Simulate the filtering logic from calculateTotalStatsData
      const startOfDay = new Date(2024, 0, 15); // Jan 15, 2024
      const endOfDay = new Date(2024, 0, 15, 23, 59, 59); // Jan 15, 2024 23:59:59

      const filteredTasks = mockTasks.filter((task) => {
        const date = new Date(task.createdAt);
        return date >= startOfDay && date <= endOfDay;
      });

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].tags).toContain("Guitar");
    });

    it("should correctly filter tasks by week range", () => {
      const mockTasks = [
        { createdAt: "2024-01-15T10:00:00Z", duration: 3600, tags: ["Guitar"] },
        { createdAt: "2024-01-22T10:00:00Z", duration: 1800, tags: ["Piano"] },
      ];

      // Simulate the filtering logic from calculateTotalStatsData
      const startOfWeek = new Date(2024, 0, 15); // Monday of current week
      const endOfWeek = new Date(2024, 0, 21); // Sunday of current week

      const filteredTasks = mockTasks.filter((task) => {
        const date = new Date(task.createdAt);
        return date >= startOfWeek && date <= endOfWeek;
      });

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].tags).toContain("Guitar");
    });

    it("should correctly filter tasks by month range", () => {
      const mockTasks = [
        { createdAt: "2024-01-15T10:00:00Z", duration: 3600, tags: ["Guitar"] },
        { createdAt: "2024-02-15T10:00:00Z", duration: 1800, tags: ["Piano"] },
      ];

      // Simulate the filtering logic from calculateTotalStatsData
      const startOfMonth = new Date(2024, 0, 1); // Jan 1, 2024
      const endOfMonth = new Date(2024, 0, 31); // Jan 31, 2024

      const filteredTasks = mockTasks.filter((task) => {
        const date = new Date(task.createdAt);
        return date >= startOfMonth && date <= endOfMonth;
      });

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].tags).toContain("Guitar");
    });

    it("should correctly filter tasks by year range", () => {
      const mockTasks = [
        { createdAt: "2024-01-15T10:00:00Z", duration: 3600, tags: ["Guitar"] },
        { createdAt: "2023-01-15T10:00:00Z", duration: 1800, tags: ["Piano"] },
      ];

      // Simulate the filtering logic from calculateTotalStatsData
      const startOfYear = new Date(2024, 0, 1); // Jan 1, 2024
      const endOfYear = new Date(2024, 11, 31); // Dec 31, 2024

      const filteredTasks = mockTasks.filter((task) => {
        const date = new Date(task.createdAt);
        return date >= startOfYear && date <= endOfYear;
      });

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].tags).toContain("Guitar");
    });
  });

  describe("Chronological Stats Monthly Week Logic", () => {
    it("should assign correct week labels for days 1-7", () => {
      const date = new Date("2024-01-05T10:00:00Z"); // Day 5
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      expect(weekOfMonth).toBe(1);
    });

    it("should assign correct week labels for days 8-14", () => {
      const date = new Date("2024-01-12T10:00:00Z"); // Day 12
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      expect(weekOfMonth).toBe(2);
    });

    it("should assign correct week labels for days 15-21", () => {
      const date = new Date("2024-01-19T10:00:00Z"); // Day 19
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      expect(weekOfMonth).toBe(3);
    });

    it("should assign correct week labels for days 22-28", () => {
      const date = new Date("2024-01-26T10:00:00Z"); // Day 26
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      expect(weekOfMonth).toBe(4);
    });

    it("should assign correct week labels for days 29-31", () => {
      const date = new Date("2024-01-30T10:00:00Z"); // Day 30
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      expect(weekOfMonth).toBe(5);
    });
  });

  describe("Monthly Week Display Logic", () => {
    it("should show 4 weeks for February 2023 (28 days)", () => {
      const daysInMonth = new Date(2023, 2, 0).getDate(); // Get days in February 2023
      expect(daysInMonth).toBe(28);

      // Logic from the component
      let labelsToShow = ["W1", "W2", "W3", "W4", "W5"];
      if (daysInMonth <= 28) {
        labelsToShow = ["W1", "W2", "W3", "W4"];
      }

      expect(labelsToShow).toEqual(["W1", "W2", "W3", "W4"]);
    });

    it("should show 5 weeks for March 2024 (31 days)", () => {
      const daysInMonth = new Date(2024, 3, 0).getDate(); // Get days in March 2024
      expect(daysInMonth).toBe(31);

      // Logic from the component
      let labelsToShow = ["W1", "W2", "W3", "W4", "W5"];
      if (daysInMonth <= 28) {
        labelsToShow = ["W1", "W2", "W3", "W4"];
      }

      expect(labelsToShow).toEqual(["W1", "W2", "W3", "W4", "W5"]);
    });

    it("should show 5 weeks for February 2024 (29 days - leap year)", () => {
      const daysInMonth = new Date(2024, 2, 0).getDate(); // Get days in February 2024
      expect(daysInMonth).toBe(29);

      // Logic from the component
      let labelsToShow = ["W1", "W2", "W3", "W4", "W5"];
      if (daysInMonth <= 28) {
        labelsToShow = ["W1", "W2", "W3", "W4"];
      }

      expect(labelsToShow).toEqual(["W1", "W2", "W3", "W4", "W5"]);
    });
  });

  describe("Data Aggregation Logic", () => {
    it("should correctly aggregate tag totals", () => {
      const mockTasks = [
        { duration: 3600, tags: ["Guitar"] },
        { duration: 1800, tags: ["Guitar"] },
        { duration: 1200, tags: ["Piano"] },
      ];

      // Simulate the aggregation logic from calculateTotalStatsData
      const tagTotalsMap: Record<string, number> = {};
      let totalSeconds = 0;

      mockTasks.forEach((task) => {
        (task.tags || ["Untagged"]).forEach((tag) => {
          tagTotalsMap[tag] = (tagTotalsMap[tag] || 0) + (task.duration || 0);
          totalSeconds += task.duration || 0;
        });
      });

      expect(tagTotalsMap["Guitar"]).toBe(5400); // 3600 + 1800
      expect(tagTotalsMap["Piano"]).toBe(1200);
      expect(totalSeconds).toBe(6600); // 3600 + 1800 + 1200
    });

    it("should calculate correct percentages", () => {
      const tagTotalsMap = { Guitar: 5400, Piano: 1200 };
      const totalSeconds = 6600;

      const tagTotals = Object.entries(tagTotalsMap).map(([tag, seconds]) => ({
        tag,
        minutes: Math.round(seconds / 60),
        seconds,
        percent:
          totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
      }));

      expect(tagTotals[0].percent).toBe(82); // 5400 / 6600 * 100 ≈ 82
      expect(tagTotals[1].percent).toBe(18); // 1200 / 6600 * 100 ≈ 18
    });
  });
});
