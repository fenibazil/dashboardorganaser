import Dashboard from '/dashboardorganaser/js/Dashboard.js';
import TaskWidget from '/dashboardorganaser/js/TaskWidget.js';
import CalendarWidget from '/dashboardorganaser/js/CalendarWidget.js';
import NotesWidget from '/dashboardorganaser/js/NotesWidget.js';
import HabitsWidget from '/dashboardorganaser/js/HabitsWidget.js';
import ToDoWidget from '/dashboardorganaser/js/ToDoWidget.js';
import QuoteWidget from '/dashboardorganaser/js/QuoteWidget.js';
import WeatherWidget from '/dashboardorganaser/js/WeatherWidget.js';
import NewsWidget from '/dashboardorganaser/js/NewsWidget.js';

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

    document.getElementById('add-todo').addEventListener('click', () => {
        dashboard.addWidget('todo');
    });
    
    document.getElementById('add-quote').addEventListener('click', () => {
        dashboard.addWidget('quote');
    });
    
    document.getElementById('add-weather').addEventListener('click', () => {
        dashboard.addWidget('weather');
    });
    
    document.getElementById('add-news').addEventListener('click', () => {
        dashboard.addWidget('news');
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