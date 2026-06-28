import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const Calendar = ({ tasks, onEdit, setView }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const tasksByDate = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            const dateKey = format(new Date(task.createdAt), 'yyyy-MM-dd');
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(task);
        });
        return map;
    }, [tasks]);

    const renderHeader = () => (
        <div className="calendar-header">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</button>
            <span>{format(currentMonth, 'MMMM yyyy').toUpperCase()}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
        </div>
    );

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="calendar-days-header">
                {days.map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dateKey = format(currentDay, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(currentDay, monthStart);
                const isToday = isSameDay(currentDay, new Date());

                days.push(
                    <div
                        className={`calendar-cell ${!isCurrentMonth ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
                        key={currentDay.toString()}
                    >
                        <span className="cell-date">{format(currentDay, 'd')}</span>
                        <div className="cell-tasks">
                            {dayTasks.slice(0, 3).map(task => (
                                <div 
                                    key={task._id} 
                                    className={`cell-task priority-${task.priority.toLowerCase()}`}
                                    onClick={() => { onEdit(task); setView('dashboard'); }}
                                    title={task.title}
                                >
                                    {task.title}
                                </div>
                            ))}
                            {dayTasks.length > 3 && (
                                <div className="cell-task more">+{dayTasks.length - 3} more</div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="calendar-row" key={day.toString()}>{days}</div>);
            days = [];
        }
        return <div className="calendar-body">{rows}</div>;
    };

    return (
        <div className="calendar-container glass-panel">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {tasks.length === 0 && (
                <div className="calendar-empty">
                    <p>No tasks to display. Create some tasks to see them on the calendar!</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(Calendar);