import UIComponent from './UIComponent.js';

export default class NewsWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Последние новости',
            type: 'news'
        });
        
        this.newsData = config.newsData || [];
        this.error = config.error || null;
        this.category = config.category || 'technology';
        this.isLoading = false;
        this.useDemoData = config.useDemoData || false;
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-news';
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
                <div class="news-controls">
                    <select class="category-select">
                        <option value="technology" ${this.category === 'technology' ? 'selected' : ''}>Технологии</option>
                        <option value="business" ${this.category === 'business' ? 'selected' : ''}>Бизнес</option>
                        <option value="sports" ${this.category === 'sports' ? 'selected' : ''}>Спорт</option>
                        <option value="health" ${this.category === 'health' ? 'selected' : ''}>Здоровье</option>
                        <option value="science" ${this.category === 'science' ? 'selected' : ''}>Наука</option>
                        <option value="entertainment" ${this.category === 'entertainment' ? 'selected' : ''}>Развлечения</option>
                    </select>
                    <button class="btn-refresh-news">Обновить</button>
                </div>
                <div class="news-list">
                    ${this._renderNewsContent()}
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        
        // Загружаем новости, если их еще нет
        if (this.newsData.length === 0 && !this.error) {
            this._fetchNews();
        }
        
        return widgetElement;
    }
    
    _renderNewsContent() {
        if (this.isLoading) {
            return '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загрузка новостей...</div>';
        }
        
        if (this.error) {
            return `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка: ${this.error}</p>
                    <button class="btn-retry">Попробовать снова</button>
                    <button class="btn-demo">Использовать демо-данные</button>
                </div>
            `;
        }
        
        if (this.newsData.length === 0) {
            return '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загрузка новостей...</div>';
        }
        
        const newsItems = this.newsData.slice(0, 5).map(news => `
            <div class="news-item">
                <h4 class="news-title">${this._escapeHtml(news.title)}</h4>
                <p class="news-description">${this._escapeHtml(news.description || 'Описание отсутствует')}</p>
                <div class="news-meta">
                    <span class="news-source">${this._escapeHtml(news.source_id || news.source)}</span>
                    <span class="news-date">${new Date(news.pubDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <a href="${news.link}" target="_blank" class="news-link">Читать далее</a>
            </div>
        `).join('');
        
        let content = newsItems;
        
        if (this.useDemoData) {
            content += '<div class="demo-notice"><i class="fas fa-info-circle"></i> Используются демо-данные</div>';
        }
        
        return content;
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        const refreshButton = this.element.querySelector('.btn-refresh-news');
        const categorySelect = this.element.querySelector('.category-select');
        
        refreshButton.addEventListener('click', () => {
            this._fetchNews();
        });
        
        categorySelect.addEventListener('change', () => {
            this.category = categorySelect.value;
            this._fetchNews();
        });
        
        // Обработка кнопок при ошибке
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-retry')) {
                this._fetchNews();
            } else if (e.target.classList.contains('btn-demo')) {
                this._showDemoNews();
            }
        });
    }
    
    async _fetchNews() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.error = null;
        this.useDemoData = false;
        this._updateNewsDisplay();
        
        try {
            // Используем NewsAPI (бесплатный ключ для демо)
            // В реальном приложении ключ должен храниться безопасно
            const apiKey = 'pub_416471f2a5b6a9b9e6d7c5c4b4a3a3a4c0b4'; // Демо-ключ, может не работать
            const response = await fetch(
                `https://newsdata.io/api/1/news?apikey=${apiKey}&category=${this.category}&language=ru`
            );
            
            if (!response.ok) {
                throw new Error('Проблема с получением новостей');
            }
            
            const data = await response.json();
            this.newsData = data.results || [];
            
            if (this.newsData.length === 0) {
                throw new Error('Новости не найдены для выбранной категории');
            }
            
        } catch (error) {
            this.error = error.message;
            console.error('Ошибка при загрузке новостей:', error);
        } finally {
            this.isLoading = false;
            this._updateNewsDisplay();
        }
    }
    
    _showDemoNews() {
        this.useDemoData = true;
        this.error = null;
        this.isLoading = false;
        
        // Демо-новости на случай, если API не работает
        this.newsData = [
            {
                title: "Искусственный интеллект помогает ученым в исследованиях",
                description: "Новые алгоритмы машинного обучения ускоряют научные открытия в различных областях. Исследователи отмечают значительный прогресс в медицине и материаловедении.",
                source: "Научные новости",
                pubDate: new Date().toISOString(),
                link: "#"
            },
            {
                title: "Космическая миссия достигла новой планеты",
                description: "Автоматическая станция успешно вышла на орбиту неизученной планеты в далекой звездной системе. Ученые ожидают получить уникальные данные о составе атмосферы.",
                source: "Космические исследования",
                pubDate: new Date(Date.now() - 86400000).toISOString(),
                link: "#"
            },
            {
                title: "Прорыв в области квантовых вычислений",
                description: "Ученые объявили о создании нового квантового процессора с рекордным количеством кубитов. Это открывает новые возможности для сложных вычислений.",
                source: "Технологии будущего",
                pubDate: new Date(Date.now() - 172800000).toISOString(),
                link: "#"
            },
            {
                title: "Возобновляемая энергетика бьет рекорды",
                description: "Доля возобновляемых источников энергии в мировом энергобалансе достигла исторического максимума. Солнечная и ветровая энергия становятся все более доступными.",
                source: "Экологические технологии",
                pubDate: new Date(Date.now() - 259200000).toISOString(),
                link: "#"
            },
            {
                title: "Новые открытия в области генной терапии",
                description: "Ученые разработали новый метод редактирования генов, который может помочь в лечении наследственных заболеваний. Клинические испытания показывают многообещающие результаты.",
                source: "Медицинские инновации",
                pubDate: new Date(Date.now() - 345600000).toISOString(),
                link: "#"
            }
        ];
        
        this._updateNewsDisplay();
    }
    
    _updateNewsDisplay() {
        if (!this.element) return;
        
        const newsListElement = this.element.querySelector('.news-list');
        if (newsListElement) {
            newsListElement.innerHTML = this._renderNewsContent();
        }
    }
    
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    update() {
        this._fetchNews();
    }
    
    getState() {
        return {
            newsData: this.newsData,
            error: this.error,
            category: this.category,
            useDemoData: this.useDemoData
        };
    }
}