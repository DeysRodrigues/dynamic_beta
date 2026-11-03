import { EmptyState } from "@/components/ui/EmptyState";
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

    // 1. Keeps today's tasks.
    // 2. Keeps only those with the 'sapo' tag (in the main tag or in the groupTag).
    const todaysFrogs = tasks.filter((t) => {
        const isToday = t.date === today;
        const hasSapoTag = t.tag?.toLowerCase() === "sapo" || t.groupTag?.toLowerCase() === "sapo";
        return isToday && hasSapoTag;
    });

    // Takes at most 3 to keep the focus
    const frogs = todaysFrogs.slice(0, 3);

    const completedFrogs = frogs.filter(t => t.completed).length;
    const progress = frogs.length > 0 ? (completedFrogs / frogs.length) * 100 : 0;
    const allFrogsEaten = frogs.length > 0 && completedFrogs === frogs.length;

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    const addTaskFromInput = () => {
        if (!inputValue.trim()) return;
        try {
            const data = parseTextToTaskData(inputValue);

            // --- SMART INSERTION ---
            let finalTag = data.tag;
            let finalGroupTag = data.groupTag;

            const tagIsSapo = finalTag?.toLowerCase() === "sapo";
            const groupIsSapo = finalGroupTag?.toLowerCase() === "sapo";

            if (!tagIsSapo && !groupIsSapo) {
                if (!finalTag) {
                    finalTag = "sapo";
                }
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
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addTaskFromInput();
        }
    };

    return (
        <div className={`box-padrao flex flex-col relative overflow-hidden ${className || ""}`}>
            {/* Background Decorativo Sutil */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Target size={80} />
            </div>

            {/* Header */}
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

            {/* Frog list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2">
                {frogs.length === 0 ? (
                    <EmptyState
                        className="h-full min-h-[120px]"
                        icon={<Sparkles size={24} className="text-yellow-500 animate-pulse" />}
                        title="Sem sapos na lagoa"
                        hint={<>Adicione uma tarefa aqui ou use a tag <span className="font-mono bg-current/10 px-1 rounded">[sapo]</span></>}
                    />
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
                            <div className="mt-2 p-3 bg-green-500/10 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <Trophy size={16} className="text-green-600" />
                                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                                    Sapos engolidos! Bom trabalho.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick add input */}
            <div className="mt-4 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Adicionar sapo... (ex: Estudar >1h)"
                    className="w-full bg-background/50 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
                />
                <button
                    onClick={addTaskFromInput}
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