import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RichTextRenderer } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { sessionService } from "@/services/sessions";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { TagList } from "@/components/TagList";
import { isRichTextEmpty } from "@/lib/utils";
import { MediaGalleryModal } from "@/components/MediaGalleryModal";
import { useAudioContext } from "@/components/AudioContext";
import { SecureTextarea } from "@/components/ui/secure-form";

interface PostViewTask {
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
      avatarUrl?: string;
    };
    tags: {
      id: number;
      label: string;
      color?: string;
    }[];
    checklist: string[];
    savedCount: number;
    usedCount: number;
  };
}

interface PostViewData {
  id: number;
  title: string;
  notes: string;
  createdAt: string;
  duration: number;
  isPublic: boolean;
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
    id: number;
    text: string;
    createdAt: string;
    musician: {
      id: number;
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
  tasks: PostViewTask[];
  media: Array<{
    url: string;
    type: string;
    displayName?: string;
    thumbnailUrl?: string;
  }>;
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const PostView: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { stopAllAudio } = useAudioContext();
  const [post, setPost] = useState<PostViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isGasUpLoading, setIsGasUpLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setLoading(true);

        // Check if we have post data passed from the feed
        const passedPostData = location.state?.postData;

        if (passedPostData) {
          // Use the data passed from the feed
          setPost(passedPostData);
        } else {
          // Fetch session data from API
          try {
            const sessionData = await sessionService.getSession(
              parseInt(postId)
            );
            setPost(sessionData as PostViewData);
          } catch (error) {
            console.error("Error fetching session:", error);
            setError("Failed to load session");
          }
        }
      } catch (err) {
        setError("Failed to load post");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, location.state]);

  const handleBack = () => {
    stopAllAudio();
    navigate("/feed");
  };

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  const handleAddComment = () => {
    setShowCommentModal(true);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;

    try {
      const newCommentData = await sessionService.addComment(
        post.id,
        newComment
      );

      // Add the new comment to the post state
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        return {
          ...prevPost,
          comments: [
            ...prevPost.comments,
            {
              id: newCommentData.id,
              text: newCommentData.text,
              createdAt: newCommentData.createdAt,
              musician: {
                id: newCommentData.musician.id,
                displayName: newCommentData.musician.displayName,
                avatarUrl: newCommentData.musician.avatarUrl,
              },
            },
          ],
        };
      });

      setNewComment("");
      setShowCommentModal(false);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleAddGasUp = async () => {
    if (!post || !user || isGasUpLoading) return;

    try {
      setIsGasUpLoading(true);

      // Check if user has already gassed up this post
      const hasUserGasUp = post.gasUps.some(
        (gasUp) => gasUp.musician.id === user.id
      );

      // Optimistically update UI
      if (hasUserGasUp) {
        // Remove gas up
        setPost((prevPost) => {
          if (!prevPost) return prevPost;
          return {
            ...prevPost,
            gasUps: prevPost.gasUps.filter(
              (gasUp) => gasUp.musician.id !== user.id
            ),
          };
        });

        await sessionService.removeGasUp(post.id);
      } else {
        // Add gas up
        setPost((prevPost) => {
          if (!prevPost) return prevPost;
          return {
            ...prevPost,
            gasUps: [
              ...prevPost.gasUps,
              {
                musician: {
                  id: user.id,
                  displayName: user.displayName || "",
                  avatarUrl: user.avatarUrl || null,
                },
              },
            ],
          };
        });

        await sessionService.addGasUp(post.id, post.musician.id);
      }
    } catch (err) {
      console.error("Error handling gas up:", err);
      // Revert optimistic update on error
      // For simplicity, we'll just log the error for now
    } finally {
      setIsGasUpLoading(false);
    }
  };

  const handleViewTaskDefinition = (taskDefinitionId: number) => {
    navigate(`/task-library?task=${taskDefinitionId}`);
  };

  const handleMusicianClick = (musicianId: number) => {
    navigate(`/profile?user=${musicianId}`);
  };

  // Check if current user has already given a gas up
  const hasUserGasUp =
    user && post?.gasUps.some((gasUp) => gasUp.musician.id === user.id);

  if (loading) {
    return (
      <Container>
        <Section spacing="lg">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-3 sm:mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 sm:w-1/2 mb-6 sm:mb-8"></div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
              <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Section>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container>
        <Section spacing="lg">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 sm:mb-4">
              Error
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {error || "Post not found"}
            </p>
            <Button variant="outline" onClick={handleBack} size="sm">
              Back to Feed
            </Button>
          </div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section spacing="md">
        {/* Header */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Button>
      </Section>
      <Section spacing="sm">
        {/* Single Card Container */}
        <div className="bg-card border border-border rounded-lg overflow-hidden w-full min-w-[280px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[480px] xl:min-w-[560px] 2xl:min-w-[640px] max-w-4xl mx-auto">
          {/* Post Header Section */}
          <div className="p-4 sm:p-6 border-b border-border">
            {/* User info and metadata row */}
            <div className="flex flex-row items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarFallback className="text-base sm:text-lg">
                    {post.musician.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="text-base sm:text-lg font-medium cursor-pointer hover:text-primary hover:underline transition-all duration-200 truncate"
                  onClick={() => handleMusicianClick(post.musician.id)}
                >
                  {post.musician.displayName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                <Clock className="w-4 h-4" />
                <span className="text-sm sm:text-base">
                  {formatDuration(post.duration)}
                </span>
              </div>
            </div>
            {/* Instruments and Tags */}
            <Section spacing="sm">
              <TagList
                tags={post.tags
                  .map((tag) => tag.label)
                  .concat(post.instruments.map((i) => i.label))}
              />
            </Section>

            {/* Session Title */}
            <h1 className="text-xl sm:text-2xl font-bold mb-4 text-left">
              {post.title}
            </h1>

            {/* Notes */}
            <div className="text-left">
              <RichTextRenderer
                content={post.notes}
                className="font-['Inter',Helvetica] text-foreground text-sm font-normal leading-6"
                noTruncate={true}
              />
            </div>

            {/* Date below notes */}
            <div className="text-xs sm:text-sm text-muted-foreground mt-4">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Tasks Section */}
          {post.tasks.length > 0 && (
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-left">
                Tasks
              </h2>
              <div className="space-y-3">
                {post.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onViewTaskDefinition={handleViewTaskDefinition}
                    sessionInstruments={post.instruments}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Media Section */}
          {(() => {
            console.log("PostView post.media:", post.media);
            return post.media && post.media.length > 0 ? (
              <div className="p-4 sm:p-6 border-b border-border">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-left">
                  Media
                </h2>
                <MediaGalleryModal media={post.media} />
              </div>
            ) : null;
          })()}

          {/* Engagement Actions Footer */}
          <div className="p-4 sm:p-6 bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant={hasUserGasUp ? "secondary" : "outline"}
                onClick={handleAddGasUp}
                disabled={isGasUpLoading}
                className={`group flex-1 ${isGasUpLoading ? "opacity-50" : ""}`}
                size="sm"
              >
                <Heart
                  className={`w-4 h-4 mr-2 transition-colors duration-150 ease-in-out ${
                    hasUserGasUp
                      ? "fill-current text-red-500"
                      : "group-hover:text-red-500"
                  } ${isGasUpLoading ? "animate-pulse" : ""}`}
                />
                "Gas Up" ({post.gasUps.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleAddComment}
                className="flex-1"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments ({post.comments.length})
              </Button>
            </div>
          </div>
        </div>
      </Section>
      {/* Comments Modal/Drawer */}
      {showCommentModal && (
        <Section spacing="md">
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-background border-t border-border rounded-t-lg w-full h-[70vh] sm:h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-semibold">
                  Comments ({post.comments.length})
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCommentModal(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 sm:gap-3">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarFallback className="text-xs sm:text-sm">
                          {comment.musician.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <span
                            className="font-medium text-xs sm:text-sm cursor-pointer hover:text-primary hover:underline transition-all duration-200"
                            onClick={() =>
                              handleMusicianClick(comment.musician.id)
                            }
                          >
                            {comment.musician.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-6 sm:py-8">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm sm:text-base">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="p-3 sm:p-4 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-2">
                  <SecureTextarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="self-end sm:self-end"
                    size="sm"
                  >
                    Post
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Press ⌘+Enter to post
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}
    </Container>
  );
};

interface TaskCardProps {
  task: PostViewTask;
  onViewTaskDefinition: (taskDefinitionId: number) => void;
  sessionInstruments: Array<{
    id: number;
    label: string;
    color: string | null;
  }>;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onViewTaskDefinition,
  sessionInstruments,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Collapsed View */}
      <div
        className="p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <h3 className="font-medium text-sm sm:text-base">{task.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formatDuration(task.timeSpent)}</span>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-border p-3 sm:p-4 bg-muted/20">
          {/* Task Tags */}
          {task.taskDefinition.tags && task.taskDefinition.tags.length > 0 && (
            <Section spacing="sm">
              <TagList
                tags={task.taskDefinition.tags
                  .filter(
                    (tag) =>
                      !sessionInstruments.some(
                        (instrument) => instrument.label === tag.label
                      )
                  )
                  .map((t) => t.label)}
              />
            </Section>
          )}

          {/* Task Notes */}
          <div className="mb-3 sm:mb-4 text-left">
            {!isRichTextEmpty(task.notes) ? (
              <RichTextRenderer
                content={task.notes}
                className="font-['Inter',Helvetica] text-foreground text-xs sm:text-sm font-normal leading-5 sm:leading-6"
                noTruncate={true}
              />
            ) : (
              <span className="font-['Inter',Helvetica] text-muted-foreground text-xs sm:text-sm font-normal leading-5 sm:leading-6 italic">
                No notes on this task.
              </span>
            )}
          </div>

          {/* Task Creator and Link */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>by {task.taskDefinition.user.displayName}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewTaskDefinition(task.taskDefinition.id);
              }}
              className="self-start sm:self-auto"
            >
              View Task Definition
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
