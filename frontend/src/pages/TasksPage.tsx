import { useState } from "react";
import { Plus, Trash2, Filter, Upload, Edit3, ListTodo, Sparkles } from "lucide-react";
import TaskItem from "@/components/ui/TaskItem";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import TasksImportBox from "@/components/layout/boxes/TasksImportBox";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore";
import { groupTasksByDate } from "@/utils/TaskUtils";
import { formatDate } from "@/utils/DateUtils";
import { createTask } from "@/utils/TaskFactory";
import type { Task } from "@/types/Task";
import ShinyText from "@/components/landing/ShinyText";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const {
    tasks,
    addTask,
    toggleCompleted,
    deleteTask,
    deleteAllTasks,
    importTasks,
  } = useTaskStore();
  const { tags } = useTagStore();

  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState("");

  const [showImportBox, setShowImportBox] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newDescription) return alert("Preencha a descrição da tarefa.");
    addTask(createTask(newDescription, newTime, newTag, 15));
    setNewDescription("");
    setNewTime("");
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-transparent">
       {/* Background Ambient (Dinâmico com o Tema) */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-pulse opacity-20" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-5xl space-y-8 pt-10 pb-20 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border shrink-0 transition-colors duration-500"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                    color: 'var(--primary)'
                 }}>
               <ListTodo size={28} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 opacity-60"
                   style={{ color: 'var(--primary)' }}>
                 <Sparkles size={10} /> Produtividade
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  <ShinyText text="Minhas Tarefas" disabled={false} speed={3} />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-2xl backdrop-blur-sm border transition-colors duration-500"
               style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
               }}>
            <button
              onClick={() =>
                setFilter((prev) => (prev === "all" ? "incomplete" : "all"))
              }
              className={cn(
                "p-2.5 rounded-xl transition-all",
                filter !== "all" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "opacity-50 hover:opacity-100 hover:bg-current/10"
              )}
              title="Filtrar Incompletas"
            >
              <Filter size={18} />
            </button>
            
            {/* ... botões seguintes ... */}
            <button
              onClick={() => setShowBulkEdit(true)}
              className="p-2.5 rounded-xl opacity-50 hover:opacity-100 hover:bg-current/10 transition-all"
              title="Editor em Massa"
            >
              <Edit3 size={18} />
            </button>

            <button
              onClick={() => setShowImportBox(true)}
              className="p-2.5 rounded-xl opacity-50 hover:opacity-100 hover:bg-current/10 transition-all"
              title="Importar"
            >
              <Upload size={18} />
            </button>

            <div className="w-px h-5 mx-1 opacity-10" style={{ backgroundColor: 'var(--box-text-color)' }}></div>

            <button
              onClick={deleteAllTasks}
              className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
              title="Limpar Tudo"
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl flex gap-2 items-center text-xs font-bold hover:scale-105 transition-all shadow-lg ml-2"
            >
              <Plus size={16} /> <span className="hidden xs:inline">MULTI-TASK</span>
            </button>
          </div>
        </div>

        {/* --- QUICK INPUT --- */}
        <div className="bar-padrao ring-1 ring-current/5 shadow-2xl overflow-hidden group border-none">
          <div className="absolute inset-0 opacity-0 group-focus-within:opacity-100 transition-opacity" 
               style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)' }} />
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full relative z-10">
            <div className="relative w-full sm:w-28 shrink-0">
               <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2.5 font-mono text-sm border-none bg-transparent"
              />
            </div>

            <input
              type="text"
              placeholder="O que vamos fazer hoje?"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="flex-1 px-4 py-2.5 text-sm font-medium placeholder:opacity-30 bg-transparent border-none"
            />

            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2.5 text-xs font-bold uppercase tracking-wider min-w-[100px] bg-transparent border-none"
              >
                <option value="" className="bg-[var(--box-color)]">Sem Tag</option>
                {tags.map((t) => (
                  <option key={t} value={t} className="bg-[var(--box-color)]">
                    {t}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddTask}
                className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* --- LISTA DE TAREFAS --- */}
        <div className="space-y-8 mt-10">
          {Object.entries(groupTasksByDate(filteredTasks)).length > 0 ? (
            Object.entries(groupTasksByDate(filteredTasks)).map(
              ([date, dateTasks]) => (
                <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-black text-xl md:text-2xl opacity-90 capitalize">
                      {formatDate(date)}
                    </h3>
                    <div className="flex-1 h-px bg-current/10" />
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                      {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {dateTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleCompleted}
                        onDelete={deleteTask}
                        onEdit={handleEditClick}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 italic">
               <ListTodo size={64} className="mb-4 stroke-[1]" />
               <p className="text-xl font-bold">Nenhum rastro de tarefas por aqui...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <BulkTaskModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onAddTasks={(ts) => ts.forEach(addTask)}
      />
      <EditTaskModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={editingTask}
      />
      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        tasksToEdit={filteredTasks}
      />

      {showImportBox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-md">
             <TasksImportBox 
                onImport={(ts) => {
                  const newTasks = ts.map(t => createTask(t.description, t.time, t.tag || "", Number(t.duration) || 15));
                  importTasks(newTasks);
                  setShowImportBox(false);
                }} 
                onClose={() => setShowImportBox(false)} 
             />
           </div>
        </div>
      )}
    </div>
  );
}

