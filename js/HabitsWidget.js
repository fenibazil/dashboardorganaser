import UIComponent from './UIComponent.js';

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
                        <div