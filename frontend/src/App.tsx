import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import WeekPlannerPage from "./pages/WeekPlannerPage";
import SettingsPage from "./pages/SettingsPage"; 
import WidgetsStorePage from "./pages/WidgetsStorePage";
import ThemesPage from "./pages/ThemesPage";
import LandingPage from "./pages/LandingPage"; // <--- NOVO IMPORT

// Embed Widgets
import WaterWidget from "./widgets/WaterWidget";
import SnakeWidget from "./widgets/SnakeWidget";
import BioWidget from "./widgets/BioWidget";
import SpaceWidget from "./widgets/SpaceWidget";
import PetWidget from "./widgets/PetWidget";
import CatWidget from "./widgets/CatWidget";
import CustomWidgetViewer from "./widgets/CustomWidgetViewer";
import WindowWidget from "./widgets/WindowWidget";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ROTA DA APRESENTAÇÃO (SEM SIDEBAR) */}
        <Route path="/intro" element={<LandingPage />} /> 

        {/* ROTAS DO APP (COM SIDEBAR) */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/planner" element={<WeekPlannerPage />} />
          <Route path="/store" element={<WidgetsStorePage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* ROTAS DE EMBEDS (TELA CHEIA) */}
        <Route path="/w/water" element={<WaterWidget />} />
        <Route path="/w/snake" element={<SnakeWidget />} />
        <Route path="/w/bio" element={<BioWidget />} />
        <Route path="/w/space" element={<SpaceWidget />} />
        <Route path="/w/pet" element={<PetWidget />} />
        <Route path="/w/cat" element={<CatWidget />} />
        <Route path="/w/window" element={<WindowWidget />} />
        
        <Route path="/w/custom/:id" element={<CustomWidgetViewer />} />
      </Routes>
    </BrowserRouter>
  );
}