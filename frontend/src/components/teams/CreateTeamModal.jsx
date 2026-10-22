import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal.jsx';
import { teamService } from '../../services/teamService.js';
import { useToast } from '../../hooks/useToast.js';

export const CreateTeamModal = ({ isOpen, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const created = await teamService.createTeam({
        name: data.name,
        description: data.description,
      });
      toast.success('Team created', `Workspace "${created.name}" is now active.`);
      reset();
      onCreated(created);
      onClose();
    } catch (err) {
      toast.error('Failed to create team', err.message || 'Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create New Team"
      description="Create a shared workspace to collaborate on tasks and milestones."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="team-name">
            Team Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="team-name"
            type="text"
            placeholder="e.g. Mobile Engineering, Core Marketing"
            {...register('name', {
              required: 'Team name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
            })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="team-desc">
            Description (Optional)
          </label>
          <textarea
            id="team-desc"
            rows={3}
            placeholder="Briefly describe the team's objective, scope, and key deliverables..."
            {...register('description', {
              maxLength: { value: 500, message: 'Description cannot exceed 500 characters' },
            })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.description && (
            <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
