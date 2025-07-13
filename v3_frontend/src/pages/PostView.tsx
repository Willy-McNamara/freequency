import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MessageSquare, Heart, Clock, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { RichTextRenderer } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { sessionService } from "@/services/sessions";
import { useAuth } from "@/components/auth/AuthProvider";

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
    id: number;
    text: string;
    createdAt: string;
    musician: {
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
  tasks: PostViewTask[];
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
  const [post, setPost] = useState<PostViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");

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
          // Fallback to mock data if no data was passed
          // This would be replaced with an API call in the future
          setPost({
            id: parseInt(postId),
            title: "Sample Practice Session",
            notes:
              "<p>This is a sample practice session with <strong>rich text</strong> content.</p><p>It includes multiple paragraphs and formatting.</p>",
            createdAt: new Date().toISOString(),
            duration: 3600, // 1 hour in seconds
            musician: {
              displayName: "Dev User",
              avatarUrl: null,
            },
            instruments: [
              { id: 1, label: "Guitar", color: "#3b82f6" },
              { id: 2, label: "Piano", color: "#10b981" },
            ],
            tags: [
              { id: 1, label: "Technique", color: "#f59e0b" },
              { id: 2, label: "Repertoire", color: "#ef4444" },
            ],
            gasUps: [
              { musician: { displayName: "User 1", avatarUrl: null } },
              { musician: { displayName: "User 2", avatarUrl: null } },
            ],
            comments: [
              {
                id: 1,
                text: "Great session! Keep up the good work.",
                createdAt: new Date().toISOString(),
                musician: { displayName: "User 1", avatarUrl: null },
              },
            ],
            tasks: [
              {
                id: 1,
                title: "Scales Practice",
                notes:
                  "<p>Worked on major scales in all keys. Focused on <strong>clean transitions</strong> between positions.</p>",
                timeSpent: 1800, // 30 minutes
                taskDefinition: {
                  id: 1,
                  title: "Scales Practice",
                  description: "Practice major scales in all keys",
                  instrument: "Guitar",
                  user: { displayName: "Task Creator", avatarUrl: undefined },
                  tags: [{ id: 1, label: "Technique", color: "#f59e0b" }],
                  checklist: ["Warm up", "Practice slowly", "Increase tempo"],
                  savedCount: 15,
                  usedCount: 8,
                },
              },
              {
                id: 2,
                title: "Chord Progressions",
                notes:
                  "<p>Practiced common chord progressions in C major. Worked on <em>smooth transitions</em> between chords.</p>",
                timeSpent: 1200, // 20 minutes
                taskDefinition: {
                  id: 2,
                  title: "Chord Progressions",
                  description: "Practice common chord progressions",
                  instrument: "Guitar",
                  user: { displayName: "Music Teacher", avatarUrl: undefined },
                  tags: [{ id: 2, label: "Theory", color: "#3b82f6" }],
                  checklist: [
                    "Learn progression",
                    "Practice slowly",
                    "Add strumming",
                  ],
                  savedCount: 8,
                  usedCount: 3,
                },
              },
              {
                id: 3,
                title: "Song Repertoire - Wonderwall",
                notes:
                  "<p>Worked on the verse and chorus of Wonderwall. Need to practice the <strong>bridge section</strong> more.</p>",
                timeSpent: 2400, // 40 minutes
                taskDefinition: {
                  id: 3,
                  title: "Song Repertoire - Wonderwall",
                  description: "Learn and practice Wonderwall by Oasis",
                  instrument: "Guitar",
                  user: { displayName: "Guitar Pro", avatarUrl: undefined },
                  tags: [{ id: 3, label: "Repertoire", color: "#ef4444" }],
                  checklist: [
                    "Learn chords",
                    "Practice strumming",
                    "Add vocals",
                  ],
                  savedCount: 25,
                  usedCount: 12,
                },
              },
            ],
          });
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
    navigate("/feed");
  };

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
      console.log("Comment added:", newCommentData);

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
    if (!post) return;

    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const newGasUpData = await sessionService.addGasUp(post.id, user.id);
      console.log("Gas up added:", newGasUpData);

      // Add the new gas up to the post state
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        return {
          ...prevPost,
          gasUps: [
            ...prevPost.gasUps,
            {
              musician: {
                displayName: newGasUpData.musician.displayName,
                avatarUrl: newGasUpData.musician.avatarUrl,
              },
            },
          ],
        };
      });
    } catch (err) {
      console.error("Error adding gas up:", err);
    }
  };

  const handleViewTaskDefinition = (taskDefinitionId: number) => {
    navigate(`/task-library?task=${taskDefinitionId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Post not found"}</p>
          <Button onClick={handleBack}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-[70vw] mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Button>
      </div>

      {/* Single Card Container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Post Header Section */}
        <div className="p-6 border-b border-border">
          {/* User info and metadata row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {post.musician.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-lg font-medium">
                {post.musician.displayName}
              </span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(post.duration)}</span>
              </div>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Instruments and Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.instruments.map((instrument) => (
              <Badge key={instrument.id} variant="default">
                {instrument.label}
              </Badge>
            ))}
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.label}
              </Badge>
            ))}
          </div>

          {/* Session Title */}
          <h1 className="text-2xl font-bold mb-4 text-left">{post.title}</h1>

          {/* Notes */}
          <div className="text-left">
            <RichTextRenderer
              content={post.notes}
              className="font-['Inter',Helvetica] text-foreground text-sm font-normal leading-6"
            />
          </div>
        </div>

        {/* Tasks Section */}
        {post.tasks.length > 0 && (
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold mb-4 text-left">Tasks</h2>
            <div className="space-y-3">
              {post.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onViewTaskDefinition={handleViewTaskDefinition}
                />
              ))}
            </div>
          </div>
        )}

        {/* Engagement Actions Footer */}
        <div className="p-6 bg-muted/20">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleAddGasUp}
              className="flex-1"
            >
              <Heart className="w-4 h-4 mr-2" />
              Gas Up ({post.gasUps.length})
            </Button>
            <Button
              variant="outline"
              onClick={handleAddComment}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments ({post.comments.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Modal/Drawer */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-background border-t border-border rounded-t-lg w-full h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">
                Comments ({post.comments.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentModal(false)}
              >
                ✕
              </Button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {comment.musician.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.musician.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="self-end"
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
      )}
    </div>
  );
};

interface TaskCardProps {
  task: PostViewTask;
  onViewTaskDefinition: (taskDefinitionId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewTaskDefinition }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Collapsed View */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{task.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(task.timeSpent)}</span>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/20">
          {/* Task Tags */}
          {task.taskDefinition.tags && task.taskDefinition.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {task.taskDefinition.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Task Notes */}
          {task.notes && (
            <div className="mb-4 text-left">
              <RichTextRenderer
                content={task.notes}
                className="font-['Inter',Helvetica] text-foreground text-sm font-normal leading-6"
              />
            </div>
          )}

          {/* Task Creator and Link */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>by {task.taskDefinition.user.displayName}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewTaskDefinition(task.taskDefinition.id);
              }}
            >
              View Task Definition
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
