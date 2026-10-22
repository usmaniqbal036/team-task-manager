import React from 'react';
import { Clock, User, Edit, Trash2 } from 'lucide-react';

import { Modal } from '../common/Modal.jsx';
import { PriorityBadge } from '../common/Badge.jsx';
import { formatDate, formatRelativeTime, isOverdue } from '../../utils/dateUtils.js';
import { getInitials, getAvatarColor } from '../../utils/formatters.js';

export const TaskDetailModal = ({ isOpen, onClose, task, onEdit, onDelete, onStatusChange }) => {
  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      description={`Workspace: ${task.team?.name || 'General'}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Status:</span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value)}
              className="text-xs font-medium py-1 px-2.5 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Priority:</span>
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description
          </h4>
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg min-h-[90px] text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {task.description || (
              <span className="text-slate-400 italic">No description provided for this task.</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 border border-slate-200 rounded-lg bg-white flex items-center gap-3">
            {task.assignedTo ? (
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(
                  task.assignedTo.name
                )}`}
              >
                {getInitials(task.assignedTo.name)}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-dashed border-slate-300">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 block">Assigned Member</span>
              <span className="font-semibold text-slate-900 block truncate">
                {task.assignedTo?.name || 'Unassigned'}
              </span>
              {task.assignedTo?.email && (
                <span className="text-[10px] text-slate-400 block truncate">
                  {task.assignedTo.email}
                </span>
              )}
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-lg bg-white flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                overdue ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 block">Target Due Date</span>
              <span
                className={`font-semibold block ${overdue ? 'text-rose-600' : 'text-slate-900'}`}
              >
                {formatDate(task.dueDate)}
              </span>
              {task.dueDate && (
                <span className="text-[10px] text-slate-500 block">
                  {formatRelativeTime(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100">
          <span>Created by {task.createdBy?.name || 'System'}</span>
          <span>Added on {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
