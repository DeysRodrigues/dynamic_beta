import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

export default function WaterWidget() {
  const [cups, setCups] = useState(() => Number(localStorage.getItem("w-water-cups")) || 0);
  const GOAL = 8;

  useEffect(() => {
    localStorage.setItem("w-water-cups", String(cups));
  }, [cups]);

  const percentage = Math.min((cups / GOAL) * 100, 100);

  return (
    <div className="w-full h-screen bg-cyan-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo Onda */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-cyan-400 transition-all duration-700 ease-in-out opacity-20"
        style={{ height: `${percentage}%` }}
      />
      
      <div className="z-10 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-cyan-100 text-center w-full max-w-[280px]">
        <h2 className="text-cyan-800 font-bold text-lg mb-1">Hidratação</h2>
        <div className="text-4xl font-black text-cyan-600 mb-2">{cups} <span className="text-lg text-cyan-400 font-medium">/ {GOAL}</span></div>
        
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => setCups(Math.max(0, cups - 1))}
            className="p-3 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-full transition"
          >
            <Minus size={20} />
          </button>
          <button 
            onClick={() => setCups(cups + 1)}
            className="p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg shadow-cyan-200 transition active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}