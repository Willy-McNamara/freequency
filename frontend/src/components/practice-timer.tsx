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
  const [seconds, setSeconds] = React.useState(value || 0);
  const running = runningValue ?? false;
  const intervalRef = React.useRef<number | null>(null);

  React.useImperativeHandle(ref, () => ({
    start: () => onRunningChange?.(true),
    pause: () => onRunningChange?.(false),
    reset: () => onChange?.(0),
    getTime: () => seconds,
  }));

  React.useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Sync with value prop
  React.useEffect(() => {
    if (typeof value === "number" && value !== seconds) {
      setSeconds(value);
    }
    // eslint-disable-next-line
  }, [value]);

  // Notify parent of changes
  React.useEffect(() => {
    if (onChange) onChange(seconds);
  }, [seconds, onChange]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
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
