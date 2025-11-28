import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar
        items={[
          { label: "Home", path: "/" },
          { label: "Tasks", path: "/tasks" },
          { label: "Planner", path: "/planner" },
        
        ]}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}
