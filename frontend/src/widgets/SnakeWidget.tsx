import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

// Configurações
const GRID_SIZE = 15;
const CELL_SIZE = 20; // Ajuste conforme necessário ou use CSS responsivo

export default function SnakeWidget() {
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [food, setFood] = useState({ x: 3, y: 3 });
  const [dir, setDir] = useState({ x: 0, y: 0 }); // Começa parado
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const spawnFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(spawnFood());
    setDir({ x: 1, y: 0 }); // Começa movendo
    setGameOver(false);
    setScore(0);
  };

  // Game Loop
  useEffect(() => {
    if (gameOver || (dir.x === 0 && dir.y === 0)) return;

    const moveSnake = setInterval(() => {
      setSnake((prev) => {
        const newHead = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };

        // Colisão Parede
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Colisão Própria
        if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];
        
        // Comer comida
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(spawnFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(moveSnake);
  }, [dir, food, gameOver, spawnFood]);

  // Controles de Teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if(gameOver) return;
      switch(e.key) {
        case "ArrowUp": if(dir.y !== 1) setDir({ x: 0, y: -1 }); break;
        case "ArrowDown": if(dir.y !== -1) setDir({ x: 0, y: 1 }); break;
        case "ArrowLeft": if(dir.x !== 1) setDir({ x: -1, y: 0 }); break;
        case "ArrowRight": if(dir.x !== -1) setDir({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dir, gameOver]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center font-mono text-white p-2">
      <div className="mb-2 flex justify-between w-full max-w-[300px]">
        <span>Score: {score}</span>
        {gameOver && <span className="text-red-400 font-bold">GAME OVER</span>}
      </div>

      <div 
        className="relative bg-gray-800 border-2 border-gray-700 shadow-xl"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {/* Comida */}
        <div 
            className="absolute bg-red-500 rounded-full"
            style={{ 
                width: CELL_SIZE - 2, height: CELL_SIZE - 2,
                left: food.x * CELL_SIZE + 1, top: food.y * CELL_SIZE + 1
            }} 
        />
        
        {/* Cobra */}
        {snake.map((seg, i) => (
            <div 
                key={i}
                className="absolute bg-emerald-500 rounded-sm"
                style={{ 
                    width: CELL_SIZE - 1, height: CELL_SIZE - 1,
                    left: seg.x * CELL_SIZE, top: seg.y * CELL_SIZE,
                    opacity: gameOver ? 0.5 : 1
                }} 
            />
        ))}

        {/* Overlay de Start/Restart */}
        {(gameOver || (dir.x === 0 && dir.y === 0)) && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2">
                 <p className="text-xs text-center px-4">Use as setas para jogar</p>
                 <button onClick={resetGame} className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-500">
                     <RefreshCw size={20} />
                 </button>
             </div>
        )}
      </div>
      <p className="text-[10px] text-gray-500 mt-2">Clique no jogo para focar</p>
    </div>
  );
}