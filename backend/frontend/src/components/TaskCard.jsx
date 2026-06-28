import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const statusClass = `status-${task.status.toLowerCase().replace(' ', '-')}`;
  const priorityClass = `priority-${task.priority.toLowerCase()}`;

  return (
    <div className={`task-card ${statusClass}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge ${priorityClass}`}>{task.priority}</span>
      </div>
      <p className="task-desc">{task.description || 'No description provided.'}</p>
      <div className="task-footer">
        <div className="task-meta">
            <span className={`status-indicator ${statusClass}`}>{task.status}</span>
            <span className="task-time">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
        </div>
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="btn-icon edit" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={() => onDelete(task._id)} className="btn-icon delete" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TaskCard);