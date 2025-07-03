interface ProgressBoxProps {
  className?: string;
}

export default function ProgressBox({ className }: ProgressBoxProps) {
  return (
    <div className={`box-padrao ${className}`}>
      <h2 className="text-lg font-semibold">Progresso nas tarefas</h2>
      <p>3 de 12 tasks (20%)</p>
      <div className="w-full bg-white h-3 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: "25%" }}></div>
      </div>
    </div>
  );
}
