// Базовый класс для всех UI-компонентов
export default class UIComponent {
    constructor(config = {}) {
        this.id = config.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.title = config.title || 'Виджет';
        this.type = config.type || 'base';
        this.isMinimized = false;
        this.element = null;
    }
    
    // Метод для рендеринга виджета
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget';
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
                <p>Базовый виджет организатора.</p>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    // Получение иконки для виджета
    getIcon() {
        const icons = {
            'tasks': 'fas fa-tasks',
            'calendar': 'fas fa-calendar-day',
            'notes': 'fas fa-sticky-note',
            'habits': 'fas fa-chart-line',
            'base': 'fas fa-cube'
        };
        return icons[this.type] || icons.base;
    }
    
    // Приватный метод для прикрепления обработчиков событий
    _attachEventListeners() {
        if (!this.element) return;
        
        const minimizeBtn = this.element.querySelector('.btn-minimize');
        const closeBtn = this.element.querySelector('.btn-close');
        const refreshBtn = this.element.querySelector('.btn-refresh');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.destroy());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.update());
        }
    }
    
    // Переключение состояния минимизации
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        const content = this.element.querySelector('.widget-content');
        const icon = this.element.querySelector('.btn-minimize i');
        
        if (content) {
            content.style.display = this.isMinimized ? 'none' : 'block';
        }
        
        if (icon) {
            icon.className = this.isMinimized ? 'fas fa-plus' : 'fas fa-minus';
        }
    }
    
    // Уничтожение виджета
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
    
    // Обновление содержимого виджета
    update() {
        console.log(`Обновление виджета ${this.id}`);
    }
    
    // Сохранение состояния (может быть переопределено)
    getState() {
        return {};
    }
}