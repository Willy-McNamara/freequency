import React, { JSX } from "react";
import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import { MessageSquareIcon, ThumbsUpIcon } from "lucide-react";

export const FeedPost = (): JSX.Element => {
  // Mock data ahead of passing in actual post data

  // User data
  const userData = {
    initials: "DN",
    displayName: "Display Name",
    tags: [
      { name: "piano", active: true },
      { name: "jazz", active: false },
    ],
  };

  const sessionData = {
    date: "January 1st, 2025",
    title: "session title",
    description:
      "Description here. Lorem epsum lorem epsum blah blah blah blah blah blah balh Lorem epsum lorem epsum blah blah blah blah blah blah balh Lorem epsum lorem epsum blah blah blah blah blah blah balh",
  };

  // Data for engagement metrics
  const engagementData = [
    {
      icon: <ThumbsUpIcon className="h-4 w-4" />,
      count: 5,
      label: "gas ups",
    },
    {
      icon: <MessageSquareIcon className="h-4 w-4" />,
      count: 3,
      label: "comments",
    },
  ];

  return (
    <>
      <div className="flex flex-col items-start gap-2.5 mb-2">
        <div className="flex items-center w-full">
          <Avatar className="h-10 w-10 bg-slate-200 rounded-[20px]">
            <AvatarFallback className="font-p text-slate-900">
              {userData.initials}
            </AvatarFallback>
          </Avatar>

          <span className="ml-[11px] font-large text-black">
            {userData.displayName}
          </span>
        </div>

        <div className="flex items-center gap-[17px]">
          {userData.tags.map((tag, index) => (
            <Badge
              key={index}
              className={`h-5 px-3 py-2 rounded-md ${
                tag.active
                  ? "bg-slate-700 text-slate-50"
                  : "bg-slate-200 text-[#0f172a]"
              }`}
              variant="outline"
            >
              <span className="font-small">{tag.name}</span>
            </Badge>
          ))}
        </div>
      </div>
      {/* splicing in metadata */}
      {/* media would go here */}
      <div className="flex flex-col items-start text-left gap-2 w-full mb-2">
        <p className="font-subtle text-black text-[14px] leading-[20px] font-normal">
          {sessionData.date}
        </p>

        <h4 className="font-h-4 text-black text-[20px] leading-[28px] font-semibold tracking-[-0.1px]">
          {sessionData.title}
        </h4>

        <p className="font-['Inter',Helvetica] text-black text-sm font-normal leading-6">
          {sessionData.description}
        </p>
      </div>
      {/* splicing in like/comment section */}
      <div className="flex items-center gap-[18px]">
        {engagementData.map((item, index) => (
          <div key={index} className="flex items-center gap-[11px]">
            {item.icon}
            <div className="font-bold text-sm text-black leading-[14px] whitespace-nowrap">
              <span className="font-small text-[length:var(--small-font-size)] tracking-[var(--small-letter-spacing)] leading-[var(--small-line-height)]">
                {item.count}
              </span>
              <span className="font-normal"> {item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
