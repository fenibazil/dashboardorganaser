import Dashboard from '/js/Dashboard.js';
import TaskWidget from '/js/TaskWidget.js';
import CalendarWidget from '/js/CalendarWidget.js';
import NotesWidget from '/js/NotesWidget.js';
import HabitsWidget from '/js/HabitsWidget.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard('dashboard');
    
    // Обновление текущей даты
    function updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('ru-RU', options);
    }
    
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000); // Обновлять каждую минуту

    // Обработчики кнопок добавления виджетов
    document.getElementById('add-tasks').addEventListener('click', () => {
        dashboard.addWidget('tasks');
    });
    
    document.getElementById('add-calendar').addEventListener('click', () => {
        dashboard.addWidget('calendar');
    });
    
    document.getElementById('add-notes').addEventListener('click', () => {
        dashboard.addWidget('notes');
    });
    
    document.getElementById('add-habits').addEventListener('click', () => {
        dashboard.addWidget('habits');
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите удалить все виджеты?')) {
            dashboard.reset();
        }
    });
    
    // Добавим виджеты по умолчанию
    dashboard.addWidget('tasks');
    dashboard.addWidget('calendar');
});