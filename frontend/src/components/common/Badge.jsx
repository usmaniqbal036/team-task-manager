import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    'To Do': {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
    },
    'In Progress': {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      dot: 'bg-indigo-600',
    },
    Completed: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
    },
  };

  const style = styles[status] || styles['To Do'];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${style.bg} ${style.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const styles = {
    Low: {
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
    Medium: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
    },
    High: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-600',
    },
  };

  const style = styles[priority] || styles.Medium;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${style.bg} ${style.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span>{priority}</span>
    </span>
  );
};
