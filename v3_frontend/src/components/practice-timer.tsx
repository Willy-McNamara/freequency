import * as React from "react";
import { Play, Pause } from "lucide-react";

export interface PracticeTimerProps {
  className?: string;
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
>(({ className }, ref) => {
  const [seconds, setSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const intervalRef = React.useRef<number | null>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      start: () => setRunning(true),
      pause: () => setRunning(false),
      reset: () => setSeconds(0),
      getTime: () => seconds,
    }),
    [seconds]
  );

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      className={
        "flex items-center gap-2 font-mono text-lg " + (className || "")
      }
    >
      <button
        type="button"
        aria-label={running ? "Pause timer" : "Start timer"}
        onClick={() => setRunning((r) => !r)}
        className="focus:outline-none"
      >
        {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <span>{formatted}</span>
    </div>
  );
});

PracticeTimer.displayName = "PracticeTimer";
