import UIComponent from '/dashboardorganaser/js/UIComponent.js';

export default class NewsWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Последние новости',
            type: 'news'
        });
        
        this.newsData = [];
        this.error = null;
        this.category = config.category || 'technology';
    }
    
    async render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-news';
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
                <div class="news-controls">
                    <select class="category-select">
                        <option value="technology" ${this.category === 'technology' ? 'selected' : ''}>Технологии</option>
                        <option value="business" ${this.category === 'business' ? 'selected' : ''}>Бизнес</option>
                        <option value="sports" ${this.category === 'sports' ? 'selected' : ''}>Спорт</option>
                        <option value="health" ${this.category === 'health' ? 'selected' : ''}>Здоровье</option>
                    </select>
                    <button class="btn-refresh">Обновить</button>
                </div>
                <div class="news-list">
                    <div class="loading">Загрузка новостей...</div>
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        
        // Загружаем новости
        await this._fetchNews();
        
        return widgetElement;
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        const refreshButton = this.element.querySelector('.btn-refresh');
        const categorySelect = this.element.querySelector('.category-select');
        
        refreshButton.addEventListener('click', () => {
            this._fetchNews();
        });
        
        categorySelect.addEventListener('change', () => {
            this.category = categorySelect.value;
            this._fetchNews();
        });
    }
    
    async _fetchNews() {
        const newsListElement = this.element.querySelector('.news-list');
        
        try {
            newsListElement.innerHTML = '<div class="loading">Загрузка новостей...</div>';
            
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
            this.error = null;
            
            this._updateNewsDisplay();
        } catch (error) {
            this.error = error.message;
            // Если API не работает, покажем демо-новости
            this._showDemoNews();
        }
    }
    
    _updateNewsDisplay() {
        if (!this.element) return;
        
        const newsListElement = this.element.querySelector('.news-list');
        
        if (this.newsData.length === 0) {
            newsListElement.innerHTML = '<div class="no-news">Новости не найдены</div>';
            return;
        }
        
        const newsItems = this.newsData.slice(0, 5).map(news => `
            <div class="news-item">
                <h4 class="news-title">${news.title}</h4>
                <p class="news-description">${news.description || 'Описание отсутствует'}</p>
                <div class="news-meta">
                    <span class="news-source">${news.source_id}</span>
                    <span class="news-date">${new Date(news.pubDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <a href="${news.link}" target="_blank" class="news-link">Читать далее</a>
            </div>
        `).join('');
        
        newsListElement.innerHTML = newsItems;
    }
    
    _showDemoNews() {
        // Демо-новости на случай, если API не работает
        this.newsData = [
            {
                title: "Искусственный интеллект помогает ученым в исследованиях",
                description: "Новые алгоритмы машинного обучения ускоряют научные открытия в различных областях.",
                source_id: "Научные новости",
                pubDate: new Date().toISOString(),
                link: "#"
            },
            {
                title: "Космическая миссия достигла новой планеты",
                description: "Автоматическая станция успешно вышла на орбиту неизученной планеты в далекой звездной системе.",
                source_id: "Космические исследования",
                pubDate: new Date(Date.now() - 86400000).toISOString(),
                link: "#"
            },
            {
                title: "Прорыв в области квантовых вычислений",
                description: "Ученые объявили о создании нового квантового процессора с рекордным количеством кубитов.",
                source_id: "Технологии будущего",
                pubDate: new Date(Date.now() - 172800000).toISOString(),
                link: "#"
            }
        ];
        
        this._updateNewsDisplay();
        
        const newsListElement = this.element.querySelector('.news-list');
        newsListElement.innerHTML += '<div class="demo-notice">Используются демо-данные</div>';
    }
    
    update() {
        this._fetchNews();
    }
}