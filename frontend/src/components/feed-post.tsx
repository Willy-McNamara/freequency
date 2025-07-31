import { JSX, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MessageSquareIcon, Heart, Clock } from "lucide-react";
import { RichTextRenderer } from "./rich-text";
import { TagList } from "./TagList";
import { sessionService } from "../services/sessions";
import { useAuth } from "./auth/AuthProvider";
import { MediaThumbnail } from "./MediaThumbnail";

interface PostData {
  id: number;
  title: string;
  notes: string;
  createdAt: string;
  musician: {
    id: number;
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
      id: number;
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
  media: Array<{
    url: string;
    type: string;
  }>;
}

export const FeedPost = ({ postData }: { postData: PostData }): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for gas up functionality
  const [gasUpCount, setGasUpCount] = useState(postData.gasUps.length);
  const [hasUserGasUp, setHasUserGasUp] = useState(false);
  const [isGasUpLoading, setIsGasUpLoading] = useState(false);

  // Update hasUserGasUp when user becomes available
  useEffect(() => {
    if (user) {
      const userHasGasUp = postData.gasUps.some(
        (gasUp) => gasUp.musician.id === user.id
      );
      setHasUserGasUp(userHasGasUp);
    }
  }, [user, postData.gasUps]);

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

  const handlePostClick = () => {
    // Pass the updated post data to the post view with current gas up state
    const updatedPostData = {
      ...postData,
      gasUps: hasUserGasUp
        ? [
            ...postData.gasUps.filter(
              (gasUp) => gasUp.musician.id !== user?.id
            ), // Remove any existing gas up from this user
            {
              musician: {
                id: user?.id || 0,
                displayName: user?.displayName || "",
                avatarUrl: user?.avatarUrl || null,
              },
            },
          ]
        : postData.gasUps.filter((gasUp) => gasUp.musician.id !== user?.id),
    };

    navigate(`/post/${postData.id}`, {
      state: { postData: updatedPostData },
    });
  };

  const handleGasUpClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent navigation to post view

      if (!user || isGasUpLoading) return;

      // Prevent users from gassing up their own posts
      if (user.id === postData.musician.id) return;

      try {
        setIsGasUpLoading(true);

        // Optimistically update UI
        if (hasUserGasUp) {
          setGasUpCount((prev) => prev - 1);
          setHasUserGasUp(false);
        } else {
          setGasUpCount((prev) => prev + 1);
          setHasUserGasUp(true);
        }

        // Call API based on current state
        if (hasUserGasUp) {
          // Remove gas up
          await sessionService.removeGasUp(postData.id);
        } else {
          // Add gas up - musicianId should be the post creator's ID, not the current user's ID
          await sessionService.addGasUp(postData.id, postData.musician.id);
        }
      } catch (error) {
        console.error("Error adding gas up:", error);
        // Revert optimistic update on error
        if (hasUserGasUp) {
          setGasUpCount((prev) => prev + 1);
          setHasUserGasUp(true);
        } else {
          setGasUpCount((prev) => prev - 1);
          setHasUserGasUp(false);
        }
      } finally {
        setIsGasUpLoading(false);
      }
    },
    [user, hasUserGasUp, isGasUpLoading, postData.id, postData.musician.id]
  );

  // Data for engagement metrics
  const engagementData = [
    {
      icon: <MessageSquareIcon className="h-4 w-4" />,
      count: postData.comments.length,
      label: "comments",
    },
  ];

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
      postData.tags.concat(postData.instruments)
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
        {postData.media && postData.media.length > 0 && (
          <MediaThumbnail media={postData.media} className="mt-2" />
        )}
      </div>
      {/* splicing in like/comment section */}
      <div className="flex items-center gap-4">
        {/* Gas Up Area - Entire area is clickable */}
        <div
          className={`group flex items-center gap-2 transition-all duration-200 ${
            user?.id === postData.musician.id
              ? "cursor-not-allowed"
              : "cursor-pointer"
          } ${isGasUpLoading ? "opacity-50 pointer-events-none" : ""}`}
          onClick={
            user?.id === postData.musician.id ? undefined : handleGasUpClick
          }
          title={
            user?.id === postData.musician.id
              ? "You can't gas up your own post"
              : hasUserGasUp
              ? "Remove Gas Up"
              : "Gas Up"
          }
        >
          <div
            className={`inline-flex items-center justify-center p-1 rounded-full transition-colors duration-150 ease-in-out ${
              user?.id === postData.musician.id
                ? "text-gray-300"
                : hasUserGasUp
                ? "bg-red-50 text-red-500"
                : "text-muted-foreground group-hover:bg-gray-100 group-hover:text-red-500"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-150 ease-in-out ${
                hasUserGasUp ? "fill-current" : ""
              } ${isGasUpLoading ? "animate-pulse" : ""}`}
            />
          </div>
          <div className="font-bold text-sm text-black leading-[14px] whitespace-nowrap">
            <span className="font-small text-[length:var(--small-font-size)] tracking-[var(--small-letter-spacing)] leading-[var(--small-line-height)]">
              {gasUpCount}
            </span>
            <span className="font-normal">
              {" "}
              {gasUpCount === 1 ? "gas up" : "gas ups"}
            </span>
          </div>
        </div>

        {/* Comments Area */}
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
