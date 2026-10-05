"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, Status, Priority } from "@/lib/api";
import {
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Tag,
  Circle,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusToggle: (task: Task, nextStatus: Status) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusToggle }: TaskCardProps) {
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="secondary">Low</Badge>;
      case "MEDIUM":
        return <Badge variant="info">Medium</Badge>;
      case "HIGH":
        return <Badge variant="warning">High</Badge>;
      case "URGENT":
        return <Badge variant="urgent">Urgent ⚡</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-slate-400 fill-slate-400" />
            Pending
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "ARCHIVED":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isCompleted = task.status === "COMPLETED";

  const handleNextStatus = () => {
    if (task.status === "PENDING") {
      onStatusToggle(task, "IN_PROGRESS");
    } else if (task.status === "IN_PROGRESS") {
      onStatusToggle(task, "COMPLETED");
    } else {
      onStatusToggle(task, "PENDING");
    }
  };

  return (
    <Card className="group relative overflow-hidden border-slate-200/80 transition-all duration-200 hover:shadow-lg hover:border-indigo-500/30 dark:border-slate-800 dark:hover:border-indigo-500/40">
      {/* Colored top accent stripe depending on priority */}
      <div
        className={`h-1 w-full ${
          task.priority === "URGENT"
            ? "bg-rose-500"
            : task.priority === "HIGH"
            ? "bg-amber-500"
            : task.priority === "MEDIUM"
            ? "bg-blue-500"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      />

      <CardContent className="p-5 space-y-4">
        {/* Header row: Status toggle button & actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <button
              onClick={handleNextStatus}
              title="Click to advance status"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {getStatusBadge(task.status)}
            </button>
            {getPriorityBadge(task.priority)}
            {task.category && (
              <span className="inline-flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {task.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(task)}
              title="Delete Task"
              className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3
            className={`font-semibold text-base text-slate-900 dark:text-slate-100 transition-colors ${
              isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Footer info: Due date & creation date */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3 w-3" />
            <span>
              {task.dueDate
                ? `Due: ${new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "No due date"}
            </span>
          </div>

          <span>
            {new Date(task.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
