import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar
        items={[
          { label: "Home", path: "/" },
          { label: "Tasks", path: "/tasks" },
          { label: "Graphics", path: "/graphics" },
          { label: "Configurações", path: "/settings" },
        ]}
      />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
