import { Calendar } from "lucide-react";
import { useWeekPlanner } from "@/hooks/useWeekPlanner";
import { WeekHeader } from "@/components/week-planner/WeekHeader";
import { CreateWeekForm } from "@/components/week-planner/CreateWeekForm";
import { ActiveWeekBar } from "@/components/week-planner/ActiveWeekBar";
import { WeekStats } from "@/components/week-planner/WeekStats";
import { WeekGrid } from "@/components/week-planner/WeekGrid";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { useTaskStore } from "@/store/useTaskStore";

export default function WeekPlannerPage() {
  const p = useWeekPlanner();
  const tasks = useTaskStore(state => state.tasks); // Precisamos para o BulkEditModal

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-transparent">
       {/* Background Ambient */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-7xl space-y-10 pt-10 pb-32 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        <WeekHeader 
          weeks={p.weeks}
          activeWeekId={p.activeWeekId}
          onSetActiveWeek={p.setActiveWeek}
          onToggleCreating={() => p.setIsCreating(!p.isCreating)}
        />

        {p.isCreating && (
          <CreateWeekForm 
            name={p.newWeekName}
            setName={p.setNewWeekName}
            startDate={p.startData}
            setStartDate={p.setStartData}
            endDate={p.endData}
            setEndDate={p.setEndData}
            selectedTag={p.selectedMainTag}
            setSelectedTag={p.setSelectedMainTag}
            tags={p.tags}
            onSubmit={p.handleCreateWeek}
            onCancel={() => p.setIsCreating(false)}
          />
        )}

        {p.activeWeek ? (
          <div className="space-y-8 animate-in fade-in duration-1000">
            <ActiveWeekBar 
              activeWeek={p.activeWeek}
              onRemove={p.removeWeek}
              stats={p.stats}
            />

            <WeekStats 
              stats={p.stats}
              filter={p.filter}
              setFilter={p.setFilter}
            />

            <WeekGrid 
              weekDays={p.weekDays}
              tasksByDate={p.tasksByDate}
              filter={p.filter}
              onToggleTask={p.toggleCompleted}
              onDeleteTask={p.deleteTask}
              onEditTask={p.handleEditClick}
              onAddModal={p.openAddModal}
              onBulkEdit={p.openBulkEdit}
              onDropTask={p.handleDropTask}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-1000">
            <div className="w-24 h-24 rounded-full bg-current/5 flex items-center justify-center mb-8 relative">
               <Calendar size={40} className="opacity-20" />
            </div>
            <p className="text-xl font-black uppercase tracking-widest opacity-20">Nenhum ciclo ativo</p>
            <button 
              onClick={() => p.setIsCreating(true)}
              className="mt-6 text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              Criar meu primeiro grupo semanal
            </button>
          </div>
        )}

        <BulkTaskModal
          isOpen={p.modalOpen}
          onClose={() => p.setModalOpen(false)}
          onAddTasks={(ts) => ts.forEach(p.addTask)}
          targetDate={p.selectedDateForModal}
          targetGroupTag={p.activeWeek?.mainTag}
        />
        <EditTaskModal
          isOpen={p.editModalOpen}
          onClose={() => p.setEditModalOpen(false)}
          task={p.editingTask}
        />
        {p.activeWeek && p.bulkEditDate && (
          <BulkEditModal
            isOpen={!!p.bulkEditDate}
            onClose={() => p.setBulkEditDate(null)}
            tasksToEdit={tasks.filter(
              (t) => t.date === p.bulkEditDate && t.groupTag === p.activeWeek?.mainTag
            )}
          />
        )}
      </div>
    </div>
  );
}
