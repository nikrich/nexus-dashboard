"use client";

import React from "react";
import { TaskComments } from "@/features/tasks/task-comments";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const resolvedParams = React.use(params);
  const taskId = resolvedParams.id;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Task Detail</h1>
        <p className="text-muted-foreground">View and edit task details.</p>
      </div>

      <TaskComments taskId={taskId} />
    </div>
  );
}
