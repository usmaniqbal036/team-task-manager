import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal.jsx';
import { taskService } from '../../services/taskService.js';
import { teamService } from '../../services/teamService.js';
import { useToast } from '../../hooks/useToast.js';

export const CreateTaskModal = ({
  isOpen,
  onClose,
  onCreated,
  initialTeamId,
  initialStatus = 'To Do',
}) => {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: initialStatus,
      priority: 'Medium',
      team: initialTeamId || '',
      assignedTo: '',
    },
  });

  const selectedTeamId = watch('team');

  useEffect(() => {
    if (isOpen) {
      const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
          const list = await teamService.getTeams();
          setTeams(list);
          if (initialTeamId) {
            setValue('team', initialTeamId);
          } else if (list.length > 0 && !selectedTeamId) {
            setValue('team', list[0].id);
          }
        } catch {
          setTeams([]);
        } finally {
          setLoadingTeams(false);
        }
      };
      fetchTeams();
      setValue('status', initialStatus);
    }
  }, [isOpen, initialTeamId, initialStatus, setValue]);

  const currentTeam = teams.find((t) => t.id === selectedTeamId);
  const eligibleAssignees = currentTeam ? currentTeam.members || [] : [];

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const created = await taskService.createTask({
        title: data.title,
        description: data.description,
        team: data.team,
        assignedTo: data.assignedTo || null,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      });
      toast.success('Task created', `"${created.title}" was added.`);
      reset();
      onCreated(created);
      onClose();
    } catch (err) {
      toast.error('Failed to create task', err.message || 'Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create New Task"
      description="Add a task, set priorities, and assign it to a team member."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="task-title">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="e.g. Implement user authentication endpoints"
            {...register('title', {
              required: 'Task title is required',
              maxLength: { value: 200, message: 'Title cannot exceed 200 characters' },
            })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="task-team">
              Team Workspace <span className="text-rose-500">*</span>
            </label>
            <select
              id="task-team"
              disabled={loadingTeams || teams.length === 0}
              {...register('team', { required: 'Please select a team' })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {teams.length === 0 ? (
                <option value="">No teams available. Create a team first.</option>
              ) : (
                teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
            {errors.team && <p className="text-xs text-rose-600 mt-1">{errors.team.message}</p>}
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1"
              htmlFor="task-assignee"
            >
              Assignee
            </label>
            <select
              id="task-assignee"
              {...register('assignedTo')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {eligibleAssignees.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1"
              htmlFor="task-status"
            >
              Status
            </label>
            <select
              id="task-status"
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
              htmlFor="task-priority"
            >
              Priority
            </label>
            <select
              id="task-priority"
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
              htmlFor="task-due-date"
            >
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-semibold text-slate-700 mb-1"
            htmlFor="task-description"
          >
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Detailed description, acceptance criteria, or relevant links..."
            {...register('description')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || teams.length === 0}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
          >
            {submitting ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
