import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal.jsx';
import { taskService } from '../../services/taskService.js';
import { teamService } from '../../services/teamService.js';
import { useToast } from '../../hooks/useToast.js';
import { toInputDateFormat } from '../../utils/dateUtils.js';

export const EditTaskModal = ({ isOpen, onClose, task, onUpdated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (task && isOpen) {
      reset({
        title: task.title,
        description: task.description || '',
        assignedTo: task.assignedTo?.id || '',
        status: task.status,
        priority: task.priority,
        dueDate: toInputDateFormat(task.dueDate),
      });

      const teamId = typeof task.team === 'object' ? task.team.id : task.team;
      if (teamId) {
        teamService
          .getTeamById(teamId)
          .then((t) => setTeam(t))
          .catch(() => setTeam(null));
      }
    }
  }, [task, isOpen, reset]);

  if (!task) return null;

  const eligibleMembers = team ? team.members || [] : [];

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const updated = await taskService.updateTask(task.id, {
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo || null,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      });
      toast.success('Task updated', `"${updated.title}" has been saved.`);
      onUpdated(updated);
      onClose();
    } catch (err) {
      toast.error('Failed to update task', err.message || 'Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      description={`Workspace: ${task.team?.name || 'General'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="block text-xs font-semibold text-slate-700 mb-1"
            htmlFor="edit-task-title"
          >
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-task-title"
            type="text"
            {...register('title', {
              required: 'Task title is required',
              maxLength: { value: 200, message: 'Title cannot exceed 200 characters' },
            })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1"
              htmlFor="edit-task-status"
            >
              Status
            </label>
            <select
              id="edit-task-status"
              {...register('status')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1"
              htmlFor="edit-task-priority"
            >
              Priority
            </label>
            <select
              id="edit-task-priority"
              {...register('priority')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1"
              htmlFor="edit-task-due-date"
            >
              Due Date
            </label>
            <input
              id="edit-task-due-date"
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-semibold text-slate-700 mb-1"
            htmlFor="edit-task-assignee"
          >
            Assignee
          </label>
          <select
            id="edit-task-assignee"
            {...register('assignedTo')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Unassigned</option>
            {eligibleMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-semibold text-slate-700 mb-1"
            htmlFor="edit-task-desc"
          >
            Description
          </label>
          <textarea
            id="edit-task-desc"
            rows={3}
            {...register('description')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
