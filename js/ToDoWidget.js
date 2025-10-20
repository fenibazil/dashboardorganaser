import UIComponent from './UIComponent.js';

export default class ToDoWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Список задач',
            type: 'todo'
        });
        
        this.tasks = config.tasks || [];
        this.nextId = 1;
        
        // Восстановление ID счетчика на основе существующих задач
        if (this.tasks.length > 0) {
            this.nextId = Math.max(...this.tasks.map(task => task.id)) + 1;
        }
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-todo';
        widgetElement.id = this.id;
        
        widgetElement.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">${this.title}</h3>
                <div class="widget-controls">
                    <button class="btn-minimize">−</button>
                    <button class="btn-close">×</button>
                </div>
            </div>
            <div class="widget-content">
                <div class="todo-input">
                    <input type="text" class="todo-text" placeholder="Добавить новую задачу...">
                    <button class="btn-add">Добавить</button>
                </div>
                <ul class="todo-list">
                    ${this._renderTasks()}
                </ul>
                <div class="todo-stats">
                    Всего задач: <span class="total-count">${this.tasks.length}</span> | 
                    Выполнено: <span class="completed-count">${this.tasks.filter(task => task.completed).length}</span>
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _renderTasks() {
        if (this.tasks.length === 0) {
            return '<li class="empty-message">Нет задач. Добавьте первую!</li>';
        }
        
        return this.tasks.map(task => `
            <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="todo-text">${task.text}</span>
                <button class="btn-delete">×</button>
            </li>
        `).join('');
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        const addButton = this.element.querySelector('.btn-add');
        const inputField = this.element.querySelector('.todo-text');
        const todoList = this.element.querySelector('.todo-list');
        
        // Добавление новой задачи
        addButton.addEventListener('click', () => this._addTask());
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._addTask();
        });
        
        // Обработка событий списка задач через делегирование
        todoList.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('btn-delete')) {
                const taskItem = target.closest('.todo-item');
                const taskId = parseInt(taskItem.dataset.id);
                this._deleteTask(taskId);
            } else if (target.classList.contains('todo-checkbox')) {
                const taskItem = target.closest('.todo-item');
                const taskId = parseInt(taskItem.dataset.id);
                this._toggleTask(taskId);
            }
        });
    }
    
    _addTask() {
        const inputField = this.element.querySelector('.todo-text');
        const text = inputField.value.trim();
        
        if (text === '') return;
        
        const newTask = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date()
        };
        
        this.tasks.push(newTask);
        this._updateView();
        inputField.value = '';
    }
    
    _deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this._updateView();
    }
    
    _toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this._updateView();
        }
    }
    
    _updateView() {
        const todoList = this.element.querySelector('.todo-list');
        const totalCount = this.element.querySelector('.total-count');
        const completedCount = this.element.querySelector('.completed-count');
        
        if (todoList) {
            todoList.innerHTML = this._renderTasks();
        }
        
        if (totalCount) {
            totalCount.textContent = this.tasks.length;
        }
        
        if (completedCount) {
            completedCount.textContent = this.tasks.filter(task => task.completed).length;
        }
    }
    
    // Сохранение состояния виджета
    getState() {
        return {
            tasks: this.tasks,
            nextId: this.nextId
        };
    }
}