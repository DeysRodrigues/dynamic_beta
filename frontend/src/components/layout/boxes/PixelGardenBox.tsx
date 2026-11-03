import { useMemo } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { getTodayDate } from "@/utils/DateUtils";
import { PALETTE, SCENE_H, SCENE_W, gardenStage, renderScene, toRuns } from "@/widgets/pixelGarden/pixelArt";

const MESSAGES = [
  "O vaso espera...",
  "Uma vida nasceu!",
  "Crescendo forte...",
  "Quase lá!",
  "Jardim lendário!",
];

// Where the sparkles of a thriving plant twinkle, in scene pixels.
const SPARKLES = [
  { x: 6, y: 16, delay: "0s" },
  { x: 39, y: 22, delay: "0.8s" },
  { x: 8, y: 32, delay: "1.6s" },
];

export default function PixelGardenBox() {
  const tasks = useTaskStore((state) => state.tasks);
  const completedToday = useMemo(() => {
    const today = getTodayDate();
    return tasks.filter((t) => t.date === today && t.completed).length;
  }, [tasks]);

  const stage = gardenStage(completedToday);
  const runs = useMemo(() => toRuns(renderScene(stage)), [stage]);

  return (
    <div className="box-padrao relative overflow-hidden flex flex-col items-center justify-between gap-2 p-4 group">
      <div className="z-10 bg-current/10 px-3 py-1 rounded-full">
        <span className="text-[10px] font-bold uppercase tracking-widest">Pixel Garden</span>
      </div>

      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
        <div
          className="absolute top-0 bg-foreground/80 text-background text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
        >
          {completedToday} {completedToday === 1 ? "tarefa feita" : "tarefas feitas"} hoje
        </div>

        <svg
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          className="h-full max-h-full w-auto max-w-full transition-transform duration-500 hover:scale-105"
          shapeRendering="crispEdges"
          role="img"
          aria-label={`Planta no estágio ${stage} de 4`}
        >
          {runs.map((run) => (
            <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width} height={1} fill={PALETTE[run.key]} />
          ))}
          {stage >= 3 &&
            SPARKLES.map((sparkle) => (
              <rect
                key={sparkle.delay}
                className="pixel-twinkle"
                x={sparkle.x}
                y={sparkle.y}
                width={1}
                height={1}
                fill={PALETTE.K1}
                style={{ animationDelay: sparkle.delay }}
              />
            ))}
        </svg>
      </div>

      <div className="w-full space-y-1 z-10">
        <div className="flex justify-between text-[10px] font-bold px-1">
          <span>Nv. {stage}</span>
          <span>{MESSAGES[stage]}</span>
        </div>
        <div className="w-full h-2 bg-current/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(5, (stage / 4) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
