import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Toast from './components/Toast';
import Charts from './components/Charts';
import Calendar from './components/Calendar';
import Auth from './components/Auth';
import { AuthContext } from './context/AuthContext';

const API_URL = 'http://localhost:5001/api/tasks';

function App() {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState('dashboard');
  const [showIntro, setShowIntro] = useState(true);
  
  const [formData, setFormData] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}?userId=${user.id}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to connect to server', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => { 
    if (user) {
      fetchTasks();
    }
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, [fetchTasks, user]);

  const validate = () => {
    let tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required";
    else if (formData.title.length < 3) tempErrors.title = "Min 3 characters";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { 
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      userId: user.id
    };
    if (formData.dueDate) payload.dueDate = formData.dueDate;

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        showToast('Task updated successfully');
      } else {
        await axios.post(API_URL, payload);
        showToast('Task created successfully');
      }
      resetForm();
      await fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      showToast('Failed to save task', 'error');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showToast('Task deleted');
        await fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '' });
    setEditingId(null);
    setErrors({});
  };

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    highPriority: tasks.filter(t => t.priority === 'High').length
  };

  if (authLoading) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <div className="intro-logo">⬢</div>
          <p className="intro-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (showIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <div className="intro-logo">⬢</div>
          <h1 className="intro-title">NEXUS<span className="accent">TRACKER</span></h1>
          <p className="intro-subtitle">Professional Task Management System</p>
          <div className="intro-loader">
            <div className="loader-bar"></div>
          </div>
          <p className="intro-loading">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⬢</span>
          <h1>NEXUS<span className="accent">TRACKER</span></h1>
        </div>
        <nav className="nav-tabs">
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>📊 Dashboard</button>
            <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>📅 Calendar</button>
            <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>👤 Profile</button>
            <button onClick={logout} className="btn-logout">🚪 Logout</button>
        </nav>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-cyan">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-blue">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-green">{stats.completed}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {view === 'dashboard' && (
            <>
                <section className="dashboard-intro glass-panel">
                  <div className="intro-header">
                    <h2>Welcome back, {user.fullName || user.username}!</h2>
                    <p>Manage your tasks, track progress, and boost productivity</p>
                  </div>
                  <div className="quick-stats">
                    <div className="quick-stat">
                      <div className="stat-icon">📋</div>
                      <div>
                        <div className="quick-stat-value">{stats.total}</div>
                        <div className="quick-stat-label">Active Tasks</div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon">⚡</div>
                      <div>
                        <div className="quick-stat-value">{stats.highPriority}</div>
                        <div className="quick-stat-label">High Priority</div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon">✅</div>
                      <div>
                        <div className="quick-stat-value">{stats.completed}</div>
                        <div className="quick-stat-label">Completed</div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon">📈</div>
                      <div>
                        <div className="quick-stat-value">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
                        <div className="quick-stat-label">Completion Rate</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="form-section glass-panel">
                    <TaskForm 
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        handleSubmit={handleSubmit}
                        handleChange={handleChange}
                        editingId={editingId}
                        resetForm={resetForm}
                    />
                </section>
                
                <Charts tasks={tasks} />

                <section className="tasks-section">
                  <div className="section-header">
                    <h2 className="section-title">// ACTIVE_OPERATIONS</h2>
                    <div className="filters">
                      {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                        <button 
                          key={f} 
                          onClick={() => setFilter(f)} 
                          className={`filter-btn ${filter === f ? 'active' : ''}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Syncing Database...</p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <div className="empty-icon">📭</div>
                      <h3>No Tasks Found</h3>
                      <p>Create a new task to get started</p>
                    </div>
                  ) : (
                    <div className="task-grid">
                      {filteredTasks.map(task => (
                        <TaskCard 
                          key={task._id} 
                          task={task} 
                          onEdit={handleEdit} 
                          onDelete={handleDelete} 
                        />
                      ))}
                    </div>
                  )}
                </section>
            </>
        )}
        
        {view === 'calendar' && (
            <div className="calendar-view">
              <h2 className="section-title">// TASK_CALENDAR</h2>
              <Calendar tasks={tasks} onEdit={handleEdit} setView={setView} />
            </div>
        )}

        {view === 'profile' && (
            <div className="profile-view">
              <section className="profile-section glass-panel">
                <div className="profile-header">
                  <div className="profile-avatar">⬢</div>
                  <h2>{user.fullName || user.username}</h2>
                  <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>@{user.username}</p>
                </div>
                <div className="profile-content">
                  <div className="profile-info">
                    <div className="info-item">
                      <label>Name:</label>
                      <span>{user.fullName || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{user.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Username:</label>
                      <span>{user.username}</span>
                    </div>
                    <div className="info-item">
                      <label>Member Since:</label>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="profile-stats">
                    <h3>Your Statistics</h3>
                    <div className="stat-grid">
                      <div className="profile-stat">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-desc">Total Tasks Created</div>
                      </div>
                      <div className="profile-stat">
                        <div className="stat-number">{stats.completed}</div>
                        <div className="stat-desc">Tasks Completed</div>
                      </div>
                      <div className="profile-stat">
                        <div className="stat-number">{stats.pending}</div>
                        <div className="stat-desc">Pending Tasks</div>
                      </div>
                      <div className="profile-stat">
                        <div className="stat-number">{stats.inProgress}</div>
                        <div className="stat-desc">In Progress</div>
                      </div>
                    </div>
                  </div>
                  <div className="about-section">
                    <h3>About This Application</h3>
                    <p>Nexus Task Tracker is a professional task management system built with the MERN stack (MongoDB, Express.js, React, Node.js). It features:</p>
                    <ul className="feature-list">
                      <li>✅ User authentication (Signup/Login)</li>
                      <li>✅ Create, Read, Update, Delete (CRUD) operations</li>
                      <li>✅ Real-time task tracking and filtering</li>
                      <li>✅ Interactive data visualization with charts</li>
                      <li>✅ Calendar view for task scheduling</li>
                      <li>✅ Priority and status management</li>
                      <li>✅ Responsive and modern UI design</li>
                      <li>✅ Form validation and error handling</li>
                      <li>✅ Toast notifications</li>
                    </ul>
                  </div>
                  <div className="tech-stack">
                    <h3>Technology Stack</h3>
                    <div className="tech-tags">
                      <span className="tech-tag">MongoDB</span>
                      <span className="tech-tag">Express.js</span>
                      <span className="tech-tag">React</span>
                      <span className="tech-tag">Node.js</span>
                      <span className="tech-tag">Vite</span>
                      <span className="tech-tag">Recharts</span>
                      <span className="tech-tag">Axios</span>
                      <span className="tech-tag">Date-fns</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
        )}
      </main>

      <footer className="footer">
        <p>Nexus Task Tracker © 2026 | Built with MERN Stack | Professional Task Management System</p>
      </footer>
    </div>
  );
}

export default App;