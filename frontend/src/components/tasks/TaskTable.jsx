import React from 'react';
import { Edit, Trash2, Eye, Clock } from 'lucide-react';

import { PriorityBadge } from '../common/Badge.jsx';
import { formatDate, isOverdue } from '../../utils/dateUtils.js';
import { getInitials, getAvatarColor } from '../../utils/formatters.js';

export const TaskTable = ({ tasks, onSelectTask, onEditTask, onDeleteTask, onStatusChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-3">Team</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Assignee</th>
              <th className="py-3 px-3">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-slate-50/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                    {task.team?.name || '—'}
                  </td>

                  <td
                    className="py-3.5 px-3 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task, e.target.value)}
                      className="text-xs font-medium py-1 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <PriorityBadge priority={task.priority} size="sm" />
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${getAvatarColor(
                            task.assignedTo.name
                          )}`}
                        >
                          {getInitials(task.assignedTo.name)}
                        </div>
                        <span className="text-slate-700 font-medium truncate max-w-[110px]">
                          {task.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {task.dueDate ? (
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
