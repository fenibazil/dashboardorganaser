import UIComponent from './UIComponent.js';

export default class CalendarWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Календарь',
            type: 'calendar'
        });
        
        this.currentDate = config.currentDate ? new Date(config.currentDate) : new Date();
        this.events = config.events || [];
        this.nextEventId = config.nextEventId || 1;
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-calendar';
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
                <div class="calendar-header">
                    <button class="btn-prev-month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h4 class="current-month">${this.getMonthYearString()}</h4>
                    <button class="btn-next-month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="calendar-grid">
                    ${this._renderCalendarDays()}
                </div>
                
                <div class="events-section">
                    <h5>События на ${new Date().toLocaleDateString('ru-RU')}</h5>
                    <div class="events-list">
                        ${this._renderTodayEvents()}
                    </div>
                    <button class="btn-add-event">
                        <i class="fas fa-plus"></i> Добавить событие
                    </button>
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _renderCalendarDays() {
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        let html = '';
        
        // Заголовки дней недели
        days.forEach(day => {
            html += `<div class="calendar-day header">${day}</div>`;
        });
        
        // Ячейки календаря
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        
        // Пустые ячейки перед первым днем
        for (let i = 0; i < startDay; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        
        // Дни месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const isToday = this.isToday(date);
            const hasEvents = this.hasEventsOnDate(date);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
                    <span class="day-number">${day}</span>
                    ${hasEvents ? '<div class="event-dot"></div>' : ''}
                </div>
            `;
        }
        
        return html;
    }
    
    _renderTodayEvents() {
        const todayEvents = this.events.filter(event => 
            this.isSameDay(new Date(event.date), new Date())
        );
        
        if (todayEvents.length === 0) {
            return '<div class="no-events">Событий на сегодня нет</div>';
        }
        
        return todayEvents.map(event => `
            <div class="event-item" data-id="${event.id}">
                <div class="event-time">${event.time || 'Весь день'}</div>
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${event.description || ''}</div>
                </div>
                <button class="btn-delete-event">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        // Навигация по месяцам
        const prevBtn = this.element.querySelector('.btn-prev-month');
        const nextBtn = this.element.querySelector('.btn-next-month');
        
        prevBtn.addEventListener('click', () => this._changeMonth(-1));
        nextBtn.addEventListener('click', () => this._changeMonth(1));
        
        // Добавление события
        const addEventBtn = this.element.querySelector('.btn-add-event');
        addEventBtn.addEventListener('click', () => this._addEvent());
        
        // Удаление событий
        const eventsList = this.element.querySelector('.events-list');
        eventsList.addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-event')) {
                const eventItem = e.target.closest('.event-item');
                const eventId = parseInt(eventItem.dataset.id);
                this._deleteEvent(eventId);
            }
        });
    }
    
    _changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this._updateView();
    }
    
    _addEvent() {
        const title = prompt('Введите название события:');
        if (!title || title.trim() === '') return;
        
        const description = prompt('Введите описание события (необязательно):') || '';
        const time = prompt('Введите время (например, 14:30) или оставьте пустым для события на весь день:') || 'Весь день';
        
        const newEvent = {
            id: this.nextEventId++,
            title: title.trim(),
            description: description.trim(),
            time: time,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date()
        };
        
        this.events.push(newEvent);
        this._updateView();
    }
    
    _deleteEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        this._updateView();
    }
    
    _updateView() {
        const monthElement = this.element.querySelector('.current-month');
        const calendarGrid = this.element.querySelector('.calendar-grid');
        const eventsList = this.element.querySelector('.events-list');
        
        if (monthElement) {
            monthElement.textContent = this.getMonthYearString();
        }
        
        if (calendarGrid) {
            calendarGrid.innerHTML = this._renderCalendarDays();
        }
        
        if (eventsList) {
            eventsList.innerHTML = this._renderTodayEvents();
        }
    }
    
    getMonthYearString() {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
    
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    hasEventsOnDate(date) {
        return this.events.some(event => 
            this.isSameDay(new Date(event.date), date)
        );
    }
    
    getState() {
        return {
            currentDate: this.currentDate.toISOString(),
            events: this.events,
            nextEventId: this.nextEventId
        };
    }
}