"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchTasks,
  fetchTaskStats,
  createTask,
  updateTask,
  deleteTask,
  checkBackendHealth,
  Task,
  TaskStats as StatsType,
  Status,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/api";
import { TaskStats } from "@/components/TaskStats";
import { TaskFilterBar } from "@/components/TaskFilterBar";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Database,
  Server,
  PlusCircle,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Backend connection status
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    database?: string;
  } | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [taskList, statList, health] = await Promise.allSettled([
        fetchTasks({
          search: search || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        }),
        fetchTaskStats(),
        checkBackendHealth(),
      ]);

      if (taskList.status === "fulfilled") {
        setTasks(taskList.value);
      } else {
        showToast("Backend connection failed. Ensure backend is running on port 4000.", "error");
      }

      if (statList.status === "fulfilled") {
        setStats(statList.value);
      }

      if (health.status === "fulfilled") {
        setServerHealth(health.value);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Create or update task
  const handleSaveTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (selectedTask) {
      const updated = await updateTask(selectedTask.id, data);
      showToast(`Task "${updated.title}" updated successfully!`);
    } else {
      const created = await createTask(data as CreateTaskInput);
      showToast(`Task "${created.title}" created successfully!`);
    }
    await loadData();
  };

  // Delete task
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      showToast(`Task "${taskToDelete.title}" deleted.`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    }
  };

  // Quick toggle status
  const handleStatusToggle = async (task: Task, nextStatus: Status) => {
    try {
      await updateTask(task.id, { status: nextStatus });
      showToast(`Task marked as ${nextStatus.replace("_", " ")}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Quick demo seed data generator
  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      await createTask({
        title: "Configure AWS EC2 & PM2 Process Manager",
        description: "Deploy backend application on EC2 cluster and manage uptime using PM2.",
        category: "DevOps",
        priority: "HIGH",
        status: "IN_PROGRESS",
      });
      await createTask({
        title: "Set up GitHub Actions CI/CD Pipeline",
        description: "Automate build, test, and zero-downtime deployment on AWS server.",
        category: "CI/CD",
        priority: "URGENT",
        status: "PENDING",
      });
      await createTask({
        title: "Integrate Neon Serverless PostgreSQL & Prisma ORM",
        description: "Configure connection pooling, run schema migrations, and generate Prisma client.",
        category: "Database",
        priority: "MEDIUM",
        status: "COMPLETED",
      });
      showToast("Sample tasks created successfully!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to seed demo tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900/95 px-4 py-3 text-sm text-white shadow-xl backdrop-blur-md border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
          {toast.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
          {toast.type === "info" && <Sparkles className="h-4 w-4 text-indigo-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/25">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  TaskFlow
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                    PRISMA + NEON
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full Stack CRUD Application
                </p>
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="hidden sm:flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-100/70 px-3 py-1 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <Server className="h-3.5 w-3.5 text-indigo-500" />
                <span>Backend :4000</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    serverHealth?.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
              </div>

              <div className="hidden md:flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-100/70 px-3 py-1 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span>Neon DB</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    serverHealth?.database?.includes("connected") ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Title & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Task Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create, update, filter, and delete tasks synchronized in real-time with Neon PostgreSQL.
            </p>
          </div>
          {tasks.length === 0 && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDemoData}
              className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Populate Demo Data
            </Button>
          )}
        </div>

        {/* Dashboard Metric Cards */}
        <TaskStats stats={stats} loading={loading} />

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <TaskFilterBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            onRefresh={loadData}
            onOpenCreate={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            loading={loading}
          />
        </div>

        {/* Task Grid / Content */}
        {loading && tasks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl border border-slate-200 bg-white/50 p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900/50"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No tasks found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? "No tasks match your current filter criteria. Try adjusting or clearing your filters."
                : "Your database table is currently empty. Create your first task or populate sample items."}
            </p>
            <div className="mt-6 flex items-center justify-center space-x-3">
              <Button
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Create New Task
              </Button>
              <Button variant="outline" onClick={handleSeedDemoData}>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Add Demo Items
              </Button>
            </div>
          </div>
        ) : (
          /* Task Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setSelectedTask(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={(t) => {
                  setTaskToDelete(t);
                  setIsDeleteModalOpen(true);
                }}
                onStatusToggle={handleStatusToggle}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal Dialog */}
      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        task={selectedTask}
        onSubmit={handleSaveTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
