export const TASK_STATUS_CONFIG = {
  draft: { label: 'Ciorna', color: '#6B7280', bg: '#F3F4F6' },
  open: { label: 'Publicat', color: '#2563EB', bg: '#DBEAFE' },
  assigned: { label: 'Atribuit', color: '#7C3AED', bg: '#EDE9FE' },
  in_progress: { label: 'In desfasurare', color: '#B45309', bg: '#FEF3C7' },
  completed: { label: 'Finalizat', color: '#047857', bg: '#D1FAE5' },
  cancelled: { label: 'Anulat', color: '#DC2626', bg: '#FEE2E2' },
  disputed: { label: 'Disputat', color: '#DC2626', bg: '#FEE2E2' },
};

export const URGENCY_CONFIG = {
  low: { label: 'Prioritate scazuta', color: '#6B7280' },
  medium: { label: 'Normal', color: '#2563EB' },
  high: { label: 'Urgent', color: '#EF4444' },
};

/**
 * Map API task to booking list card props
 */
export function mapTaskToBookingCard(task) {
  const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.open;
  const urgencyConfig = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.medium;

  const taskerName = task.assigned_tasker
    ? `${task.assigned_tasker.first_name} ${task.assigned_tasker.last_name?.[0] || ''}.`
    : null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    categoryName: task.category?.name || '',
    status: task.status,
    statusLabel: statusConfig.label,
    statusColor: statusConfig.color,
    statusBg: statusConfig.bg,
    urgency: task.urgency,
    urgencyLabel: urgencyConfig.label,
    urgencyColor: urgencyConfig.color,
    taskerName,
    taskerAvatar: task.assigned_tasker?.profile_image_url,
    taskerRating: task.assigned_tasker?.avg_rating,
    location: task.address?.full_address || task.address?.city || '',
    price: formatPrice(task),
    bidsCount: task.bids_count || 0,
    taskDate: task.task_date,
    taskTime: task.task_time,
    createdAt: task.created_at,
  };
}

/**
 * Map API bid to bid card props
 */
export function mapBidToCard(bid) {
  const taskerName = bid.tasker
    ? `${bid.tasker.first_name} ${bid.tasker.last_name || ''}`
    : 'Mester';

  return {
    id: bid.id,
    taskerName,
    taskerAvatar: bid.tasker?.profile_image_url,
    taskerId: bid.tasker?.id,
    amount: bid.amount,
    estimatedHours: bid.estimated_hours,
    proposedDate: bid.proposed_date,
    proposedTime: bid.proposed_time,
    message: bid.message,
    status: bid.status,
    rating: bid.tasker?.avg_rating || 0,
    tasksCompleted: bid.tasker?.total_tasks_completed || 0,
    createdAt: bid.created_at,
  };
}

/**
 * Format task price for display
 */
function formatPrice(task) {
  if (task.fixed_price) {
    return `${parseFloat(task.fixed_price).toFixed(0)} lei`;
  }
  if (task.budget_min && task.budget_max) {
    return `${task.budget_min} - ${task.budget_max} lei`;
  }
  if (task.budget_min) {
    return `de la ${task.budget_min} lei`;
  }
  return null;
}

/**
 * Format date in Romanian locale
 */
export function formatTaskDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const months = [
    'ian', 'feb', 'mar', 'apr', 'mai', 'iun',
    'iul', 'aug', 'sep', 'oct', 'noi', 'dec'
  ];
  const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'];

  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format relative date in Romanian
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'azi';
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `acum ${diffDays} zile`;
  if (diffDays < 14) return 'acum 1 saptamana';
  if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} saptamani`;
  if (diffDays < 60) return 'acum 1 luna';
  return `acum ${Math.floor(diffDays / 30)} luni`;
}
