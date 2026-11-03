import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Every screen is its own chunk. An embedded widget (/w/*) lives inside an iframe of this same
// app, so it must not drag the dashboard, the sidebar and every page along with it.
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const Home = lazy(() => import("./pages/HomePage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const WeekPlannerPage = lazy(() => import("./pages/WeekPlannerPage"));
const WidgetsStorePage = lazy(() => import("./pages/WidgetsStorePage"));
const ThemesPage = lazy(() => import("./pages/ThemesPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const WikiPage = lazy(() => import("./pages/WikiPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));

// Embed widgets
const WaterWidget = lazy(() => import("./widgets/WaterWidget"));
const SnakeWidget = lazy(() => import("./widgets/SnakeWidget"));
const BioWidget = lazy(() => import("./widgets/BioWidget"));
const CustomWidgetViewer = lazy(() => import("./widgets/CustomWidgetViewer"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* PRESENTATION ROUTE (NO SIDEBAR) */}
          <Route path="/intro" element={<LandingPage />} />
          <Route path="/wiki" element={<WikiPage />} />

          {/* APP ROUTES (WITH SIDEBAR) */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/planner" element={<WeekPlannerPage />} />
            <Route path="/store" element={<WidgetsStorePage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>

          {/* EMBED ROUTES (FULL SCREEN) */}
          <Route path="/w/water" element={<WaterWidget />} />
          <Route path="/w/snake" element={<SnakeWidget />} />
          <Route path="/w/bio" element={<BioWidget />} />

          <Route path="/w/custom/:id" element={<CustomWidgetViewer />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
