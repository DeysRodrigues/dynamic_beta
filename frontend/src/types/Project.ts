import type { Layouts } from "react-grid-layout";
import type { BoxRef } from "./Box";

export interface ProjectGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyRoutine {
  id: string;
  text: string;
  completedDates: string[]; // Lista de datas formatadas como YYYY-MM-DD
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  layouts: Layouts;
  boxes: BoxRef[];
  goals: ProjectGoal[];
  routines: DailyRoutine[];
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
  color?: string;
}
