export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  urgent: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchTasks(params?: {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: string;
  order?: string;
}): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "ALL") query.append("status", params.status);
  if (params?.priority && params.priority !== "ALL") query.append("priority", params.priority);
  if (params?.category && params.category !== "ALL") query.append("category", params.category);
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.order) query.append("order", params.order);

  const url = `${API_BASE}/tasks${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.data || [];
}

export async function fetchTaskStats(): Promise<TaskStats> {
  const res = await fetch(`${API_BASE}/tasks/stats`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch task statistics");
  }
  const data = await res.json();
  return data.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create task");
  }
  return data.data;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update task");
  }
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete task");
  }
}

export async function checkBackendHealth(): Promise<{ status: string; database?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) return { status: "disconnected" };
    const data = await res.json();
    return data;
  } catch {
    return { status: "offline" };
  }
}
