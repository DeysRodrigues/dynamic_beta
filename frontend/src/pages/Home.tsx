import Dashboard from"../components/layout/Dashboard";
import Sidebar from"../components/layout/Sidebar";

export default function Home(): JSX.Element {
  return (
    <div className="flex h-screen">
      <Sidebar
        items={[
          { label: "Home", path: "/" },
          { label: "Configurações", path: "/settings" },
        ]}
      />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Dashboard />
      </main>
    </div>
  );
}
