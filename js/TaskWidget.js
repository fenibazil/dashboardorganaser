import UIComponent from '/dashboardorganaser/js/UIComponent.js';

export default class TaskWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Мои задачи',
            type: 'tasks'
        });
        
        this.tasks = config.tasks || [];
        this.categories = config.categories || ['Работа', 'Личное', 'Здоровье', 'Обучение'];
        this.nextId = config.nextId || 1;
        this.filter = config.filter || 'all'; // all, active, completed
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-tasks';
        widgetElement.id = this.id;
        
        widgetElement.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">
                    <i class="${this.getIcon()}"></i>
                    ${this.title}
                </h3>
                <div class="widget-controls">
                    <button class="btn-refresh" title="Обновить">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn-minimize" title="Свернуть">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn-close" title="Закрыть">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                <div class="task-input-section">
                    <div class="task-input-row">
                        <input type="text" class="task-input" placeholder="Новая задача...">
                        <select class="category-select">
                            ${this.categories.map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                        <button class="btn-add-task">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="task-filters">
                    <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
                        Все (${this.tasks.length})
                    </button>
                    <button class="filter-btn ${this.filter === 'active' ? 'active' : ''}" data-filter="active">
                        Активные (${this.tasks.filter(t => !t.completed).length})
                    </button>
                    <button class="filter-btn ${this.filter === 'completed' ? 'active' : ''}" data-filter="completed">
                        Выполненные (${this.tasks.filter(t => t.completed).length})
                    </button>
                </div>
                
                <div class="tasks-list">
                    ${this._renderTasks()}
                </div>
                
                ${this.tasks.length > 0 ? `
                    <div class="tasks-stats">
                        <span>Выполнено: ${this.getCompletionPercentage()}%</span>
                        ${this.tasks.filter(t => !t.completed).length > 0 ? `
                            <button class="btn-clear-completed">
                                Очистить выполненные
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _renderTasks() {
        const filteredTasks = this.tasks.filter(task => {
            if (this.filter === 'active') return !task.completed;
            if (this.filter === 'completed') return task.completed;
            return true;
        });
        
        if (filteredTasks.length === 0) {
            const message = this.filter === 'completed' ? 
                'Нет выполненных задач' : 
                this.filter === 'active' ? 
                    'Все задачи выполнены!' : 
                    'Задач пока нет. Добавьте первую!';
            
            return `<div class="empty-tasks">${message}</div>`;
        }
        
        return filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority || 'normal'}" data-id="${task.id}">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </div>
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-category ${task.category.toLowerCase()}">${task.category}</span>
                        ${task.dueDate ? `
                            <span class="task-due ${this.isOverdue(task) ? 'overdue' : ''}">
                                <i class="far fa-clock"></i> ${new Date(task.dueDate).toLocaleDateString('ru-RU')}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-edit-task" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-task" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        // Добавление задачи
        const addButton = this.element.querySelector('.btn-add-task');
        const taskInput = this.element.querySelector('.task-input');
        
        addButton.addEventListener('click', () => this._addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._addTask();
        });
        
        // Фильтры
        const filterButtons = this.element.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filter = e.target.dataset.filter;
                this._updateView();
            });
        });
        
        // Обработка событий списка задач через делегирование
        const tasksList = this.element.querySelector('.tasks-list');
        tasksList.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const taskItem = target.closest('.task-item');
            const taskId = parseInt(taskItem.dataset.id);
            
            if (target.classList.contains('btn-delete-task')) {
                this._deleteTask(taskId);
            } else if (target.classList.contains('btn-edit-task')) {
                this._editTask(taskId);
            }
        });
        
        // Чекбоксы задач
        tasksList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                this._toggleTask(taskId);
            }
        });
        
        // Очистка выполненных
        const clearBtn = this.element.querySelector('.btn-clear-completed');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearCompleted());
        }
    }
    
    _addTask() {
        const taskInput = this.element.querySelector('.task-input');
        const categorySelect = this.element.querySelector('.category-select');
        const text = taskInput.value.trim();
        
        if (text === '') return;
        
        const newTask = {
            id: this.nextId++,
            text: text,
            category: categorySelect.value,
            completed: false,
            createdAt: new Date(),
            dueDate: null,
            priority: 'normal'
        };
        
        this.tasks.push(newTask);
        this._updateView();
        taskInput.value = '';
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
    
    _editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;
        
        const newText = prompt('Редактировать задачу:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this._updateView();
        }
    }
    
    _clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this._updateView();
    }
    
    _updateView() {
        const tasksList = this.element.querySelector('.tasks-list');
        const filterButtons = this.element.querySelectorAll('.filter-btn');
        const statsElement = this.element.querySelector('.tasks-stats');
        
        if (tasksList) {
            tasksList.innerHTML = this._renderTasks();
        }
        
        // Обновление счетчиков в фильтрах
        filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            let count = 0;
            
            if (filter === 'all') count = this.tasks.length;
            else if (filter === 'active') count = this.tasks.filter(t => !t.completed).length;
            else if (filter === 'completed') count = this.tasks.filter(t => t.completed).length;
            
            btn.textContent = `${btn.textContent.split('(')[0].trim()} (${count})`;
        });
        
        // Обновление статистики
        if (statsElement) {
            statsElement.innerHTML = `
                <span>Выполнено: ${this.getCompletionPercentage()}%</span>
                ${this.tasks.filter(t => !t.completed).length > 0 ? `
                    <button class="btn-clear-completed">
                        Очистить выполненные
                    </button>
                ` : ''}
            `;
            
            const clearBtn = statsElement.querySelector('.btn-clear-completed');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this._clearCompleted());
            }
        }
    }
    
    getCompletionPercentage() {
        if (this.tasks.length === 0) return 0;
        const completed = this.tasks.filter(task => task.completed).length;
        return Math.round((completed / this.tasks.length) * 100);
    }
    
    isOverdue(task) {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date() && !task.completed;
    }
    
    getState() {
        return {
            tasks: this.tasks,
            categories: this.categories,
            nextId: this.nextId,
            filter: this.filter
        };
    }
}