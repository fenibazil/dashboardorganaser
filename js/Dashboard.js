import TaskWidget from '/dashboardorganaser/js/TaskWidget.js';
import CalendarWidget from '/dashboardorganaser/js/CalendarWidget.js';
import NotesWidget from '/dashboardorganaser/js/NotesWidget.js';
import HabitsWidget from '/dashboardorganaser/js/HabitsWidget.js';

export default class Dashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.widgets = [];
        this.nextWidgetId = 1;
        
        if (!this.container) {
            console.error(`Контейнер с id "${containerId}" не найден`);
            return;
        }
        
        this._loadFromStorage();
        this._render();
    }
    
    addWidget(type, config = {}) {
        let widget;
        const widgetId = `widget-${this.nextWidgetId++}`;
        
        switch (type) {
            case 'tasks':
                widget = new TaskWidget({ ...config, id: widgetId });
                break;
            case 'calendar':
                widget = new CalendarWidget({ ...config, id: widgetId });
                break;
            case 'notes':
                widget = new NotesWidget({ ...config, id: widgetId });
                break;
            case 'habits':
                widget = new HabitsWidget({ ...config, id: widgetId });
                break;
            default:
                console.error(`Неизвестный тип виджета: ${type}`);
                return;
        }
        
        this.widgets.push(widget);
        this._render();
        this._saveToStorage();
        return widget;
    }
    
    // Остальные методы Dashboard остаются без изменений
    removeWidget(widgetId) {
        const widgetIndex = this.widgets.findIndex(widget => widget.id === widgetId);
        
        if (widgetIndex !== -1) {
            const widget = this.widgets[widgetIndex];
            widget.destroy();
            this.widgets.splice(widgetIndex, 1);
            this._saveToStorage();
        }
    }
    
    _render() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (this.widgets.length === 0) {
            this.container.innerHTML = `
                <div class="empty-dashboard">
                    <h2>Добро пожаловать в ваш персональный организатор!</h2>
                    <p>Добавьте виджеты с помощью кнопок выше, чтобы начать работу.</p>
                </div>
            `;
            return;
        }
        
        this.widgets.forEach(widget => {
            const widgetElement = widget.render();
            this.container.appendChild(widgetElement);
        });
    }
    
    reset() {
        this.widgets.forEach(widget => {
            widget.destroy();
        });
        
        this.widgets = [];
        this._saveToStorage();
        this._render();
    }
    
    _saveToStorage() {
        const dashboardState = {
            widgets: this.widgets.map(widget => ({
                type: widget.type,
                id: widget.id,
                title: widget.title,
                state: widget.getState ? widget.getState() : null
            })),
            nextWidgetId: this.nextWidgetId
        };
        
        localStorage.setItem('dashboardState', JSON.stringify(dashboardState));
    }
    
    _loadFromStorage() {
        try {
            const savedState = localStorage.getItem('dashboardState');
            
            if (savedState) {
                const state = JSON.parse(savedState);
                this.nextWidgetId = state.nextWidgetId || 1;
                
                state.widgets.forEach(widgetState => {
                    this.addWidget(widgetState.type, {
                        id: widgetState.id,
                        title: widgetState.title,
                        ...widgetState.state
                    });
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке состояния:', error);
        }
    }
}