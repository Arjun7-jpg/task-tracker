import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    'Pending': '#f59e0b',
    'In Progress': '#3b82f6',
    'Completed': '#10b981',
    'Low': '#64748b',
    'Medium': '#f59e0b',
    'High': '#ef4444'
};

const Charts = ({ tasks }) => {
    const statusData = Object.entries(
        tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const priorityData = Object.entries(
        tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="charts-container">
            <div className="chart-panel glass-panel">
                <h3>TASK STATUS DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={80} fill="#8884d8" dataKey="value">
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f8fafc' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-mono)', paddingTop: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-panel glass-panel">
                <h3>PRIORITY DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={priorityData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={80} fill="#8884d8" dataKey="value">
                            {priorityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f8fafc' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-mono)', paddingTop: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default React.memo(Charts);