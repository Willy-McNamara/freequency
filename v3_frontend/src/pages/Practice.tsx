import React, { useState } from "react";
import { RichTextEditor } from "@/components/rich-text";
import { PracticeTaskList } from "@/components/practice-task-list";
import { PracticeTagList } from "@/components/practice-tag-list";
import { PracticeTimer, PracticeTimerRef } from "@/components/practice-timer";

const getDefaultSessionTitle = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const now = new Date();
  const day = days[now.getDay()];
  const hour = now.getHours();
  let period = "Morning";
  if (hour >= 12 && hour < 18) period = "Afternoon";
  else if (hour >= 18 || hour < 5) period = "Evening";
  return `${day} ${period} Piano Session`;
};

const Practice: React.FC = () => {
  const [sessionTitle, setSessionTitle] = useState(getDefaultSessionTitle());
  const maxLength = 40;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow upper/lowercase letters and spaces
    value = value.replace(/[^a-zA-Z ]/g, "");
    if (value.length > maxLength) value = value.slice(0, maxLength);
    setSessionTitle(value);
  };

  return (
    <div className="w-[100vh]">
      <div className="flex flex-col items-center justify-center my-4">
        <PracticeTimer ref={React.useRef<PracticeTimerRef>(null)} />
        <input
          type="text"
          value={sessionTitle}
          onChange={handleTitleChange}
          maxLength={maxLength}
          className="font-bold text-base mb-1 text-center bg-transparent border-b border-muted focus:border-primary outline-none w-full max-w-xs"
          aria-label="Session title"
        />
      </div>
      <RichTextEditor />
      <PracticeTaskList
        tasks={[
          { id: "1", title: "Learn scales" },
          { id: "2", title: "Practice arpeggios" },
        ]}
        onAddNew={() => alert("Add new task clicked!")}
        onEditTask={(id) => alert(`Edit task ${id}`)}
      />
      <PracticeTagList
        tags={[
          { id: "tag1", label: "Warmup" },
          { id: "tag2", label: "Scales" },
          { id: "tag3", label: "Sight Reading" },
        ]}
        onAddTag={() => alert("Add tag clicked!")}
      />
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Save Session
        </button>
      </div>
    </div>
  );
};

export default Practice;
