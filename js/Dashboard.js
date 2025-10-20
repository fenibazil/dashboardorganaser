import ToDoWidget from '/dashboardorganaser/js/ToDoWidget.js';
import QuoteWidget from '/dashboardorganaser/js/QuoteWidget.js';
import WeatherWidget from '/dashboardorganaser/js/WeatherWidget.js';
import NewsWidget from '/dashboardorganaser/js/NewsWidget.js';

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
    
    // Добавление нового виджета
    addWidget(type, config = {}) {
        let widget;
        const widgetId = `widget-${this.nextWidgetId++}`;
        
        switch (type) {
            case 'todo':
                widget = new ToDoWidget({ ...config, id: widgetId });
                break;
            case 'quote':
                widget = new QuoteWidget({ ...config, id: widgetId });
                break;
            case 'weather':
                widget = new WeatherWidget({ ...config, id: widgetId });
                break;
            case 'news':
                widget = new NewsWidget({ ...config, id: widgetId });
                break;
            default:
                console.error(`Неизвестный тип виджета: ${type}`);
                return;
        }
        
        this.widgets.push(widget);
        this._render();
        this._saveToStorage();
        
        // Для асинхронных виджетов (погода, новости) вызываем рендер после добавления
        if (type === 'weather' || type === 'news') {
            setTimeout(() => {
                widget.render().then(() => {
                    this._render();
                });
            }, 0);
        }
    }
    
    // Удаление виджета
    removeWidget(widgetId) {
        const widgetIndex = this.widgets.findIndex(widget => widget.id === widgetId);
        
        if (widgetIndex !== -1) {
            const widget = this.widgets[widgetIndex];
            widget.destroy();
            this.widgets.splice(widgetIndex, 1);
            this._saveToStorage();
        }
    }
    
    // Отрисовка всех виджетов
    _render() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (this.widgets.length === 0) {
            this.container.innerHTML = `
                <div class="empty-dashboard">
                    <h2>Добро пожаловать в ваш персональный дашборд!</h2>
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
    
    // Сброс всех виджетов
    reset() {
        this.widgets.forEach(widget => {
            widget.destroy();
        });
        
        this.widgets = [];
        this._saveToStorage();
        this._render();
    }
    
    // Сохранение состояния в localStorage
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
    
    // Загрузка состояния из localStorage
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