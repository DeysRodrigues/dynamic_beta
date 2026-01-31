import { useState, type KeyboardEvent } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import TaskItem from "@/components/ui/TaskItem";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { Target, Plus, Sparkles, Trophy } from "lucide-react";
import { parseTextToTaskData } from "@/utils/TaskParser";
import { createTask } from "@/utils/TaskFactory";
import { getTodayDate } from "@/utils/DateUtils";
import type { Task } from "@/types/Task";

export default function ThreeFrogsBox({ className }: { className?: string; id?: string }) {
    const { tasks, toggleCompleted, deleteTask, addTask } = useTaskStore();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const today = getTodayDate();

    // 1. Filtra tarefas de hoje.
    // 2. Filtra APENAS as que têm a tag 'sapo' (na tag principal ou na groupTag).
    const todaysFrogs = tasks.filter((t) => {
        const isToday = t.date === today;
        const hasSapoTag = t.tag?.toLowerCase() === "sapo" || t.groupTag?.toLowerCase() === "sapo";
        return isToday && hasSapoTag;
    });

    // Pega no máximo 3 para manter o foco
    const frogs = todaysFrogs.slice(0, 3);

    const completedFrogs = frogs.filter(t => t.completed).length;
    const progress = frogs.length > 0 ? (completedFrogs / frogs.length) * 100 : 0;
    const allFrogsEaten = frogs.length > 0 && completedFrogs === frogs.length;

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            try {
                const data = parseTextToTaskData(inputValue);

                // --- LÓGICA DE INSERÇÃO INTELIGENTE ---
                // Se a tarefa não tiver a tag "sapo" em lugar nenhum, nós forçamos a entrada dela.
                let finalTag = data.tag;
                let finalGroupTag = data.groupTag;

                const tagIsSapo = finalTag?.toLowerCase() === "sapo";
                const groupIsSapo = finalGroupTag?.toLowerCase() === "sapo";

                if (!tagIsSapo && !groupIsSapo) {
                    // Se o usuário não definiu tag nenhuma, vira [sapo]
                    if (!finalTag) {
                        finalTag = "sapo";
                    }
                    // Se já tem uma tag (ex: [matemática]), usamos a groupTag para {sapo}
                    else {
                        finalGroupTag = "sapo";
                    }
                }

                const newTask = createTask(
                    data.description,
                    data.time,
                    finalTag || "sapo",
                    data.duration,
                    finalGroupTag
                );

                addTask(newTask);
                setInputValue("");
            } catch (error) {
                console.error("Erro ao criar sapo:", error);
            }
        }
    };

    return (
        <div className={`box-padrao flex flex-col relative overflow-hidden ${className || ""}`}>
            {/* Background Decorativo Sutil */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Target size={80} />
            </div>

            {/* Cabeçalho */}
            <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <Target size={18} />
                        </div>
                        <h2 className="font-bold text-base">Os 3 Sapos</h2>
                    </div>
                    <span className="text-xs font-mono font-medium opacity-60">
                        {completedFrogs}/{frogs.length}
                    </span>
                </div>

                {/* Barra de Progresso */}
                <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Lista de Sapos */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2">
                {frogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center opacity-60 space-y-2 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/30 transition-colors">
                        <Sparkles size={24} className="text-yellow-500 animate-pulse" />
                        <p className="text-sm font-medium">Sem sapos na lagoa</p>
                        <p className="text-xs text-muted-foreground max-w-[180px]">
                            Adicione uma tarefa aqui ou use a tag <span className="font-mono bg-secondary/50 px-1 rounded">[sapo]</span>
                        </p>
                    </div>
                ) : (
                    <>
                        {frogs.map((task, index) => (
                            <div key={task.id} className="group relative transition-transform hover:scale-[1.01]">
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary/20 group-hover:bg-primary rounded-full transition-colors" />
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-30 w-4 text-right">
                                    #{index + 1}
                                </div>
                                <TaskItem
                                    task={task}
                                    onToggle={toggleCompleted}
                                    onDelete={deleteTask}
                                    onEdit={handleEditClick}
                                    compact={true}
                                />
                            </div>
                        ))}

                        {allFrogsEaten && (
                            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <Trophy size={16} className="text-green-600" />
                                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                                    Sapos engolidos! Bom trabalho.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input de Adição Rápida */}
            <div className="mt-4 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Adicionar sapo... (ex: Estudar >1h)"
                    className="w-full bg-background/50 border border-border/60 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
                />
                <button
                    onClick={() => handleKeyDown({ key: 'Enter' } as any)}
                    className="absolute right-1.5 top-1.5 p-1 hover:bg-primary/10 rounded-md transition-colors text-primary/70 hover:text-primary"
                >
                    <Plus size={16} />
                </button>
            </div>

            <EditTaskModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                task={editingTask}
            />
        </div>
    );
}