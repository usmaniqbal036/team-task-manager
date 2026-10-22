import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils.js';

const ReminderList = ({ icon: Icon, heading, tone, tasks, onNavigate }) => {
  if (!tasks.length) return null;
  return (
    <section className="mb-5 last:mb-0">
      <h3 className={`flex items-center gap-2 text-sm font-bold ${tone}`}>
        <Icon className="w-4 h-4" aria-hidden="true" /> {heading} ({tasks.length})
      </h3>
      <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{t.title}</p>
              <p className="text-xs text-slate-500">{t.team?.name}</p>
            </div>
            <div className="shrink-0 text-right text-xs">
              <p className="font-semibold text-slate-700">{formatDate(t.dueDate)}</p>
              <p className="text-slate-500">{formatRelativeTime(t.dueDate)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const ReminderModal = ({ isOpen, onClose, reminders }) => {
  if (!reminders) return null;
  const { overdue = [], dueSoon = [], windowDays = 3 } = reminders;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task reminders"
      description={`Your open tasks that are overdue or due within ${windowDays} days.`}
    >
      <ReminderList icon={AlertTriangle} heading="Overdue" tone="text-red-700" tasks={overdue} />
      <ReminderList icon={CalendarClock} heading="Due soon" tone="text-amber-700" tasks={dueSoon} />
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-100"
        >
          Dismiss
        </button>
        <Link
          to="/tasks"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          View my tasks
        </Link>
      </div>
    </Modal>
  );
};
