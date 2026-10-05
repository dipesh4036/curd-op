"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStats as StatsType } from "@/lib/api";
import { CheckCircle2, Clock, Flame, ListTodo } from "lucide-react";

interface TaskStatsProps {
  stats: StatsType | null;
  loading: boolean;
}

export function TaskStats({ stats, loading }: TaskStatsProps) {
  const statItems = [
    {
      title: "Total Tasks",
      value: stats?.total ?? 0,
      icon: ListTodo,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      title: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      title: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      title: "Urgent Priority",
      value: stats?.urgent ?? 0,
      icon: Flame,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="overflow-hidden border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {loading ? "..." : item.value}
                  </span>
                </div>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
