import React, { JSX } from "react";
import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import { MessageSquareIcon, ThumbsUpIcon } from "lucide-react";

export const FeedPost = ({ postData }): JSX.Element => {
  // Mock data ahead of passing in actual post data

  console.log(postData);

  // breaking out the data like this is not necessary, this is a remnant of my fast development using Anima. Will want to circle back and clean this up.

  const sessionData = {
    date: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(postData.createdAt)),
    title: postData.title,
    description: postData.notes,
  };

  // Data for engagement metrics
  const engagementData = [
    {
      icon: <ThumbsUpIcon className="h-4 w-4" />,
      count: postData.gasUps.length,
      label: "gas ups",
    },
    {
      icon: <MessageSquareIcon className="h-4 w-4" />,
      count: postData.comments.length,
      label: "comments",
    },
  ];

  return (
    <>
      <div className="flex flex-col items-start gap-2.5 mb-2">
        <div className="flex items-center w-full">
          <Avatar className="h-10 w-10 bg-slate-200 rounded-[20px]">
            <AvatarFallback className="font-p text-slate-900">U</AvatarFallback>
          </Avatar>

          <span className="ml-[11px] font-large text-black">
            {postData.musician.displayName}
          </span>
        </div>

        <div className="flex items-center gap-[17px]">
          {postData.tags.map((tag, index) => (
            <Badge
              key={index}
              className={`h-5 px-3 py-2 rounded-md ${
                tag.color
                  ? "bg-slate-700 text-slate-50"
                  : "bg-slate-200 text-[#0f172a]"
              }`}
              variant="outline"
            >
              <span className="font-small">{tag.label}</span>
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
