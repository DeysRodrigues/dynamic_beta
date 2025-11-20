"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import GraphicsPage from "./pages/GraphicsPage";
import { TaskProvider } from "./context/TaskContext";
import { DashboardProvider } from "./context/DashboardContext";
import { GoalsProvider } from "./context/GoalsContext";
import { TagProvider } from "./context/TagContext";


export default function App() {
  return (
    <TagProvider>
      <GoalsProvider>
        <TaskProvider>
          <DashboardProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  {/* <Route path="/timedtasks" element={<TimedTasksPage/>} />
                  <Route path="/settings" element={<Settings />} /> */}
                  <Route path="/graphics" element={<GraphicsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </DashboardProvider>
        </TaskProvider>
      </GoalsProvider>
    </TagProvider>
  );
}
