import Dashboard from"../components/layout/Dashboard";
import Sidebar from"../components/layout/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar
        items={[
          { label: "Home", path: "/" },
          { label: "Tasks", path: "/tasks" },
          { label: "Configurações", path: "/settings" },
        ]}
      />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Dashboard />
      </main>
    </div>
  );
}
