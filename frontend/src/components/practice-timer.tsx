import * as React from "react";
import { Play, Pause } from "lucide-react";

export interface PracticeTimerProps {
  className?: string;
  value?: number;
  onChange?: (seconds: number) => void;
  runningValue?: boolean;
  onRunningChange?: (running: boolean) => void;
}

export interface PracticeTimerRef {
  start: () => void;
  pause: () => void;
  reset: () => void;
  getTime: () => number;
}

export const PracticeTimer = React.forwardRef<
  PracticeTimerRef,
  PracticeTimerProps
>(({ className, value, onChange, runningValue, onRunningChange }, ref) => {
  // New state: accumulated (seconds), startTime (ms or null)
  const [accumulated, setAccumulated] = React.useState<number>(value || 0);
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [tick, setTick] = React.useState(0); // <-- new state for re-render
  const running = runningValue ?? false;
  const intervalRef = React.useRef<number | null>(null);

  // Calculate elapsed time
  const getElapsed = React.useCallback(() => {
    if (running && startTime !== null) {
      return accumulated + Math.floor((Date.now() - startTime) / 1000);
    }
    return accumulated;
  }, [accumulated, startTime, running, tick]);

  // Expose imperative methods
  React.useImperativeHandle(ref, () => ({
    start: () => onRunningChange?.(true),
    pause: () => onRunningChange?.(false),
    reset: () => {
      setAccumulated(0);
      setStartTime(null);
      setTick(0);
      onChange?.(0);
    },
    getTime: () => getElapsed(),
  }));

  // Handle running/paused state
  React.useEffect(() => {
    if (running) {
      // When starting, set startTime if not already set
      if (startTime === null) {
        setStartTime(Date.now());
      }
      intervalRef.current = window.setInterval(() => {
        setTick((t) => t + 1); // force re-render
        if (onChange) onChange(getElapsed());
      }, 1000);
    } else {
      // When pausing, add elapsed to accumulated and clear startTime
      if (startTime !== null) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setAccumulated((prev) => prev + elapsed);
        setStartTime(null);
        if (onChange) onChange(accumulated + elapsed);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [running]);

  // Sync with value prop (external reset)
  React.useEffect(() => {
    if (typeof value === "number" && value !== getElapsed()) {
      setAccumulated(value);
      setStartTime(null);
    }
    // eslint-disable-next-line
  }, [value]);

  // Notify parent of changes (for initial mount and manual changes)
  React.useEffect(() => {
    if (onChange) onChange(getElapsed());
    // eslint-disable-next-line
  }, [accumulated, startTime]);

  const elapsed = getElapsed();
  const minutes = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      className={
        "flex items-center justify-center font-mono text-lg " +
        (className || "")
      }
    >
      <button
        type="button"
        aria-label={running ? "Pause timer" : "Start timer"}
        onClick={() => onRunningChange?.(!running)}
        className="focus:outline-none px-2"
      >
        {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <span className="px-2">{formatted}</span>
    </div>
  );
});

PracticeTimer.displayName = "PracticeTimer";
