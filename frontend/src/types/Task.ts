// types/Task.ts

export interface Task {
  id: string;
  time?: string;             // formato "HH:mm"
  description: string;
  tag: string;
  completed: boolean | undefined;

  date: string;             // formato "YYYY-MM-DD"
  duration: number;         // duration in minutes

  groupTag?: string;
  workspaceId?: string;     // ID of the workspace it belongs to
}
