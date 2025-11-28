import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import WeekPlannerPage from "./pages/WeekPlannerPage";


// Observe: Sem Providers aqui! O Zustand gerencia o estado globalmente.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/planner" element={<WeekPlannerPage />} /> {/* <--- Nova Rota */}
 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}