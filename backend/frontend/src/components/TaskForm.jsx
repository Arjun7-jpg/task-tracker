import React from 'react';

const TaskForm = ({ formData, setFormData, errors, handleSubmit, handleChange, editingId, resetForm }) => {
    return (
        <form onSubmit={handleSubmit} className="task-form">
            <h2 className="section-title">{editingId ? '// UPDATE_PROTOCOL' : '// NEW_TASK_PROTOCOL'}</h2>
            <div className="form-grid">
                <div className="input-group">
                    <label>Task Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className={errors.title ? 'input-error' : ''} placeholder="Enter task title..." />
                    {errors.title && <span className="error-text">{errors.title}</span>}
                </div>
                <div className="input-group">
                    <label>Priority Level</label>
                    <select name="priority" value={formData.priority} onChange={handleChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>
            <div className="input-group full-width">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter task details..." />
            </div>
            <div className="form-grid">
                <div className="input-group">
                    <label>Due Date</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>
            <div className="form-actions">
                <div></div>
                <div className="btn-group">
                    {editingId && (
                        <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                    )}
                    <button type="submit" className="btn btn-primary glow">{editingId ? 'Update Task' : 'Create Task'}</button>
                </div>
            </div>
        </form>
    );
};

export default React.memo(TaskForm);