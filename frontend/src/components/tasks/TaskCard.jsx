import React from 'react';
import { User, Clock } from 'lucide-react';

import { StatusBadge, PriorityBadge } from '../common/Badge.jsx';
import { formatDate, formatRelativeTime, isOverdue } from '../../utils/dateUtils.js';
import { getInitials, getAvatarColor } from '../../utils/formatters.js';

export const TaskCard = ({ task, onClick, onStatusChange }) => {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-medium text-slate-500 truncate max-w-[160px]">
            {task.team?.name || 'General'}
          </span>
          <PriorityBadge priority={task.priority} size="sm" />
        </div>

        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignedTo ? (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${getAvatarColor(
                task.assignedTo.name
              )}`}
              title={`Assigned to ${task.assignedTo.name}`}
            >
              {getInitials(task.assignedTo.name)}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-dashed border-slate-300"
              title="Unassigned"
            >
              <User className="w-3 h-3" />
            </div>
          )}
          <span className="text-xs text-slate-600 truncate max-w-[90px]">
            {task.assignedTo?.name ? task.assignedTo.name.split(' ')[0] : 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}
              title={formatDate(task.dueDate)}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatRelativeTime(task.dueDate)}</span>
            </span>
          )}

          {onStatusChange ? (
            <div onClick={(e) => e.stopPropagation()} className="relative inline-block">
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task, e.target.value)}
                className="text-xs font-medium py-0.5 px-1.5 bg-slate-50 border border-slate-200 rounded cursor-pointer text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ) : (
            <StatusBadge status={task.status} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
};
