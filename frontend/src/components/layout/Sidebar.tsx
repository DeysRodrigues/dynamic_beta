import { Bell, Menu, Sparkles, Type } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SidebarProps {
  items: { label: string; icon?: React.ReactNode; path: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [monospace, setMonospace] = useState(false);

  // Aplica o filtro de inverter no html
  useEffect(() => {
    const root = document.documentElement;

    if (inverted) {
      root.classList.add("inverted-mode");
      root.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      root.classList.remove("inverted-mode");
      root.style.filter = "";
    }
  }, [inverted]);

  // Aplica a fonte monoespaçada no html
  useEffect(() => {
    const body = document.body;

    if (monospace) {
      body.style.setProperty(
        "font-family",
        "'Cascadia Mono', monospace",
        "important"
      );
    } else {
      body.style.setProperty("font-family", "", "important");
    }
  }, [monospace]);

  return (
    <>
      {/* Botão Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-indigo-500 to-purple-500 text-white flex flex-col justify-between items-center py-8 z-40 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex`}
      >
        {/* Top */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Notificação */}
          <div className="self-end pr-4">
            <Bell size={20} className="cursor-pointer" />
          </div>

          {/* Avatar */}
          <img
            src="https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg"
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover no-invert"
          />

          <h2 className="font-bold text-lg">Venushim</h2>
          <p className="text-sm text-white/80">jujuba eh doce!</p>

          {/* Botão Inverter */}
          <button
            className="mt-4 p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
            onClick={() => setInverted(!inverted)}
          >
            <Sparkles size={20} className="text-white" />
          </button>

          {/* Botão Monoespaçado */}
          <button
            className="mt-2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
            onClick={() => setMonospace(!monospace)}
          >
            <Type size={20} className="text-white" />
          </button>

          {/* Menu */}
          <nav className="flex flex-col gap-4 mt-8 text-white font-bold">
            {items.map((item) => (
              <button
                key={item.label}
                className="hover:underline"
                onClick={() => console.log(`Navigate to ${item.path}`)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <button className="mb-6 bg-white/20 text-white px-6 py-1 rounded-full hover:bg-white/30">
          logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
