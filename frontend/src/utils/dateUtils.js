export const formatDate = (dateStr) => {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Due today';
  if (diffInDays === 1) return 'Due tomorrow';
  if (diffInDays === -1) return 'Overdue by 1 day';
  if (diffInDays < -1) return `Overdue by ${Math.abs(diffInDays)} days`;
  if (diffInDays < 7) return `Due in ${diffInDays} days`;
  return formatDate(d);
};

export const isOverdue = (dateStr, status) => {
  if (!dateStr || status === 'Completed') return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime() < now.getTime();
};

export const toInputDateFormat = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};
