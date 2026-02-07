"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/use-comment-queries";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { data, isLoading, error } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const { user } = useAuthStore();
  const [commentBody, setCommentBody] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    const result = commentSchema.safeParse({ body: commentBody });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    try {
      await createComment.mutateAsync(result.data);
      setCommentBody("");
      toast.success("Comment added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment.mutateAsync(commentId);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment");
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-sm text-destructive">Failed to load comments</p>
      </Card>
    );
  }

  const comments = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Comments</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No comments yet. Be the first to comment!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
                      {comment.authorId.slice(0, 2).toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {comment.authorId === user?.id ? "You" : `User ${comment.authorId.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.createdAt)}
                        </p>
                      </div>
                      {comment.authorId === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteComment.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.body}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="comment-body">Add a comment</Label>
            <Textarea
              id="comment-body"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write your comment..."
              className="min-h-24"
              disabled={createComment.isPending}
            />
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createComment.isPending || !commentBody.trim()}
            >
              {createComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
