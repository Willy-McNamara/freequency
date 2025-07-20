import { JSX } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./badge";
import { MessageSquareIcon, ThumbsUpIcon, Clock } from "lucide-react";
import { RichTextRenderer } from "./rich-text";
import { TagList } from "./TagList";

interface PostData {
  id: number;
  title: string;
  notes: string;
  createdAt: string;
  musician: {
    displayName: string;
    avatarUrl: string | null;
  };
  instruments: Array<{
    id: number;
    label: string;
    color: string | null;
  }>;
  tags: Array<{
    id: number;
    label: string;
    color: string | null;
  }>;
  gasUps: Array<{
    musician: {
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
  comments: Array<{
    musician: {
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
  tasks: Array<{
    id: number;
    title: string;
    notes: string;
    timeSpent: number;
    taskDefinition: {
      id: number;
      title: string;
      description: string;
      instrument: string;
      user: {
        displayName: string;
        avatarUrl: string | null;
      };
      tags: Array<{
        id: number;
        label: string;
        color: string | null;
      }>;
      checklist: string[];
      savedCount: number;
      usedCount: number;
    };
  }>;
  duration: number;
}

export const FeedPost = ({ postData }: { postData: PostData }): JSX.Element => {
  const navigate = useNavigate();

  const sessionData = {
    date: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(postData.createdAt)),
    title: postData.title,
    description: postData.notes,
  };

  // Collect all tags from session and tasks, removing duplicates
  // const allTags = useMemo(() => {
  //   const sessionTags = postData.tags || [];
  //   const taskTags =
  //     postData.tasks?.flatMap((task) => task.taskDefinition.tags || []) || [];

  //   // Combine and remove duplicates based on label
  //   const tagMap = new Map<
  //     string,
  //     { id: number; label: string; color: string | null }
  //   >();

  //   // Add session tags first
  //   sessionTags.forEach((tag) => {
  //     tagMap.set(tag.label, tag);
  //   });

  //   // Add task tags (task tags will override session tags if same label)
  //   taskTags.forEach((tag) => {
  //     tagMap.set(tag.label, tag);
  //   });

  //   return Array.from(tagMap.values());
  // }, [postData.tags, postData.tasks]);

  const instruments = postData.instruments;
  const regularTags = postData.tags;

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

  const handlePostClick = () => {
    // Pass the full post data to the post view
    navigate(`/post/${postData.id}`, {
      state: { postData },
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getAllTagsFromSession = () => {
    const allTags = postData.tasks.reduce(
      (a, c) => a.concat(c.taskDefinition.tags),
      postData.tags
    );
    const tagNamesAsStrings = allTags.map((tag) => tag.label);
    const dedupedTags = [...new Set(tagNamesAsStrings)];
    return dedupedTags;
  };

  return (
    <div
      className="cursor-pointer hover:bg-accent/50 transition-colors duration-200 rounded-lg p-4 -m-4"
      onClick={handlePostClick}
    >
      <div className="flex w-full flex-col items-start gap-2.5 mb-2">
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 bg-slate-200 rounded-[20px]">
              <AvatarFallback className="font-p text-slate-900">
                {postData.musician.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="ml-[11px] font-large text-black">
              {postData.musician.displayName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(postData.duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <TagList tags={getAllTagsFromSession()} />
        </div>
      </div>
      {/* splicing in metadata */}
      {/* media would go here */}
      <div className="flex flex-col items-start text-left gap-2 w-full mb-2">
        <span className="font-subtle text-black text-[14px] leading-[20px] font-normal mb-1">
          {sessionData.date}
        </span>
        <h4 className="font-h-4 text-black text-[20px] leading-[28px] font-semibold tracking-[-0.1px]">
          {sessionData.title}
        </h4>
        <RichTextRenderer
          content={sessionData.description}
          maxLength={300}
          maxLines={6}
          className="font-['Inter',Helvetica] text-black text-sm font-normal leading-6 break-words overflow-hidden"
        />
      </div>
      {/* splicing in like/comment section */}
      <div className="flex items-center gap-4">
        {engagementData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
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
    </div>
  );
};
