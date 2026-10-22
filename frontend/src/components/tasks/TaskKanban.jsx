import React from 'react';
import { Plus } from 'lucide-react';

import { TaskCard } from './TaskCard.jsx';

export const TaskKanban = ({ tasks, onSelectTask, onStatusChange, onAddTaskToColumn }) => {
  const columns = [
    { status: 'To Do', label: 'To Do', dot: 'bg-slate-400', bg: 'bg-slate-100/70' },
    { status: 'In Progress', label: 'In Progress', dot: 'bg-indigo-600', bg: 'bg-indigo-50/50' },
    { status: 'Completed', label: 'Completed', dot: 'bg-emerald-600', bg: 'bg-emerald-50/50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 min-h-[500px]"
          >
            <div className="flex items-center justify-between px-2 py-1.5 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {columnTasks.length}
                </span>
              </div>
              {onAddTaskToColumn && (
                <button
                  onClick={() => onAddTaskToColumn(col.status)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-32 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  No tasks in {col.label.toLowerCase()}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={onSelectTask}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
