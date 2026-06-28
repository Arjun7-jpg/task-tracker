const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasktracker')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const newUser = new User({ username, email, password, fullName });
        await newUser.save();
        
        res.status(201).json({ 
            message: 'User created successfully',
            user: { id: newUser._id, username: newUser.username, email: newUser.email, fullName: newUser.fullName }
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        res.status(200).json({ 
            message: 'Login successful',
            user: { id: user._id, username: user.username, email: user.email, fullName: user.fullName }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

app.get('/api/auth/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { userId } : {};
        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User must be logged in' });
        }

        const taskData = { title, description, status, priority, userId };
        if (dueDate && dueDate.trim() !== '') {
            taskData.dueDate = dueDate;
        }

        const newTask = new Task(taskData);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("POST Error:", error);
        res.status(400).json({ message: 'Error creating task', error: error.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        
        const updateData = { title, description, status, priority };
        if (dueDate && dueDate.trim() !== '') {
            updateData.dueDate = dueDate;
        } else {
            updateData.dueDate = null;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        );
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("PUT Error:", error);
        res.status(400).json({ message: 'Error updating task', error: error.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));