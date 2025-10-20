import UIComponent from '/dashboardorganaser/js/UIComponent.js';

export default class HabitsWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Трекер привычек',
            type: 'habits'
        });
        
        this.habits = config.habits || [];
        this.nextId = config.nextId || 1;
        this.currentStreak = config.currentStreak || 0;
        this.longestStreak = config.longestStreak || 0;
        this.streakStartDate = config.streakStartDate || new Date();
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-habits';
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
                <div class="habits-stats">
                    <div class="stat-item">
                        <div class="stat-value">${this.currentStreak}</div>
                        <div class="stat-label">Текущая серия</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.longestStreak}</div>
                        <div class="stat-label">Лучшая серия</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.getCompletionRate()}%</div>
                        <div class="stat-label">Выполнение</div>
                    </div>
                </div>
                
                <div class="habits-controls">
                    <button class="btn-add-habit">
                        <i class="fas fa-plus"></i> Добавить привычку
                    </button>
                </div>
                
                <div class="habits-list">
                    ${this._renderHabits()}
                </div>
                
                <div class="weekly-view">
                    <h5>Прогресс за неделю</h5>
                    <div class="week-days">
                        ${this._renderWeekView()}
                    </div>
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _renderHabits() {
        if (this.habits.length === 0) {
            return `
                <div class="empty-habits">
                    <i class="fas fa-seedling"></i>
                    <p>Привычек пока нет. Добавьте первую!</p>
                    <p class="hint">Например: "Утренняя зарядка", "Чтение 20 минут", "Пить воду"</p>
                </div>
            `;
        }
        
        return this.habits.map(habit => `
            <div class="habit-item ${habit.completedToday ? 'completed' : ''}" data-id="${habit.id}">
                <div class="habit-main">
                    <div class="habit-checkbox">
                        <input type="checkbox" ${habit.completedToday ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </div>
                    <div class="habit-info">
                        <div class="habit-title">${habit.title}</div>
                        <div class="habit-meta">
                            <span class="habit-streak">
                                <i class="fas fa-fire"></i> ${habit.currentStreak} дней
                            </span>
                            <span class="habit-frequency">${this.getFrequencyText(habit.frequency)}</span>
                        </div>
                        <div class="habit-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.getHabitCompletionRate(habit)}%"></div>
                            </div>
                            <span class="progress-text">${this.getHabitCompletionRate(habit)}%</span>
                        </div>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="btn-edit-habit" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-habit" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    _renderWeekView() {
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Начало недели с понедельника
        
        return days.map((day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index);
            const isToday = this.isSameDay(dayDate, today);
            const isFuture = dayDate > today;
            const completionRate = this.getDayCompletionRate(dayDate);
            
            return `
                <div class="week-day ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}">
                    <div class="day-name">${day}</div>
                    <div class="day-date">${dayDate.getDate()}</div>
                    <div class="day-progress">
                        <div class="progress-circle" style="--progress: ${completionRate}%">
                            <span class="progress-text">${completionRate}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        // Добавление привычки
        const addBtn = this.element.querySelector('.btn-add-habit');
        addBtn.addEventListener('click', () => this._addHabit());
        
        // Обработка событий списка привычек через делегирование
        const habitsList = this.element.querySelector('.habits-list');
        habitsList.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const habitItem = target.closest('.habit-item');
            const habitId = parseInt(habitItem.dataset.id);
            
            if (target.classList.contains('btn-delete-habit')) {
                this._deleteHabit(habitId);
            } else if (target.classList.contains('btn-edit-habit')) {
                this._editHabit(habitId);
            }
        });
        
        // Чекбоксы привычек
        habitsList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const habitItem = e.target.closest('.habit-item');
                const habitId = parseInt(habitItem.dataset.id);
                this._toggleHabit(habitId);
            }
        });
    }
    
    _addHabit() {
        const title = prompt('Введите название привычки:');
        if (!title || title.trim() === '') return;
        
        const frequency = prompt('Выберите частоту (daily - ежедневно, weekly - еженедельно):', 'daily') || 'daily';
        const goal = prompt('Установите цель (например, "30 минут" или "8 стаканов"):') || '';
        
        const newHabit = {
            id: this.nextId++,
            title: title.trim(),
            frequency: frequency,
            goal: goal,
            currentStreak: 0,
            longestStreak: 0,
            completedToday: false,
            history: [],
            createdAt: new Date()
        };
        
        this.habits.push(newHabit);
        this._updateView();
    }
    
    _editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const newTitle = prompt('Редактировать название привычки:', habit.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            habit.title = newTitle.trim();
            this._updateView();
        }
    }
    
    _deleteHabit(habitId) {
        if (confirm('Удалить эту привычку?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this._updateView();
        }
    }
    
    _toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const today = new Date().toDateString();
        
        if (!habit.completedToday) {
            // Отмечаем выполнение
            habit.completedToday = true;
            habit.currentStreak++;
            
            // Обновляем лучшую серию
            if (habit.currentStreak > habit.longestStreak) {
                habit.longestStreak = habit.currentStreak;
            }
            
            // Добавляем в историю
            habit.history.push({
                date: new Date(),
                completed: true
            });
            
            // Обновляем общую статистику
            this._updateStreakStats();
        } else {
            // Снимаем отметку
            habit.completedToday = false;
            if (habit.currentStreak > 0) {
                habit.currentStreak--;
            }
        }
        
        this._updateView();
    }
    
    _updateStreakStats() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Проверяем, была ли прервана серия
        if (!this._wasCompletedYesterday()) {
            this.currentStreak = 1;
            this.streakStartDate = new Date();
        } else {
            this.currentStreak++;
        }
        
        // Обновляем лучшую серию
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak;
        }
    }
    
    _wasCompletedYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        return this.habits.some(habit => {
            return habit.history.some(record => 
                this.isSameDay(new Date(record.date), yesterday) && record.completed
            );
        });
    }
    
    _updateView() {
        const habitsList = this.element.querySelector('.habits-list');
        const statsElements = this.element.querySelectorAll('.stat-value');
        const weekView = this.element.querySelector('.week-days');
        
        if (habitsList) {
            habitsList.innerHTML = this._renderHabits();
        }
        
        if (statsElements.length >= 3) {
            statsElements[0].textContent = this.currentStreak;
            statsElements[1].textContent = this.longestStreak;
            statsElements[2].textContent = this.getCompletionRate();
        }
        
        if (weekView) {
            weekView.innerHTML = this._renderWeekView();
        }
    }
    
    getCompletionRate() {
        if (this.habits.length === 0) return 0;
        const completed = this.habits.filter(h => h.completedToday).length;
        return Math.round((completed / this.habits.length) * 100);
    }
    
    getHabitCompletionRate(habit) {
        if (habit.history.length === 0) return 0;
        const completed = habit.history.filter(h => h.completed).length;
        const totalDays = Math.max(habit.history.length, 7); // Минимум неделя для расчета
        return Math.round((completed / totalDays) * 100);
    }
    
    getDayCompletionRate(date) {
        const dayHabits = this.habits.filter(habit => 
            habit.history.some(record => 
                this.isSameDay(new Date(record.date), date) && record.completed
            )
        );
        
        if (this.habits.length === 0) return 0;
        return Math.round((dayHabits.length / this.habits.length) * 100);
    }
    
    getFrequencyText(frequency) {
        const frequencies = {
            'daily': 'ежедневно',
            'weekly': 'еженедельно'
        };
        return frequencies[frequency] || frequency;
    }
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    getState() {
        return {
            habits: this.habits,
            nextId: this.nextId,
            currentStreak: this.currentStreak,
            longestStreak: this.longestStreak,
            streakStartDate: this.streakStartDate
        };
    }
}