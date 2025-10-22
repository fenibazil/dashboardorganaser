import UIComponent from './UIComponent.js';

export default class QuoteWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Случайная цитата',
            type: 'quote'
        });
        
        this.quotes = config.quotes || [
            "Единственный способ сделать великую работу — любить то, что вы делаете. - Стив Джобс",
            "Инновации отличают лидера от догоняющего. - Стив Джобс",
            "Будущее принадлежит тем, кто верит в красоту своей мечты. - Элеонора Рузвельт",
            "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма. - Уинстон Черчилль",
            "Есть только один способ избежать критики: ничего не делайте, ничего не говорите и будьте никем. - Аристотель",
            "Ваше время ограничено, не тратьте его, живя чужой жизнью. - Стив Джобс",
            "Жизнь — это то, что происходит с тобой, пока ты строишь другие планы. - Джон Леннон",
            "Два самых важных дня в твоей жизни: день, когда ты появился на свет, и день, когда понял, зачем. - Марк Твен",
            "Не ошибается тот, кто ничего не делает. Не бойтесь ошибаться - бойтесь повторять ошибки. - Теодор Рузвельт",
            "Сложнее всего начать действовать, все остальное зависит только от упорства. - Амелия Эрхарт"
        ];
        
        this.currentQuote = config.currentQuote || this.quotes[Math.floor(Math.random() * this.quotes.length)];
        this.useExternalAPI = config.useExternalAPI !== undefined ? config.useExternalAPI : true;
        this.isLoading = false;
        this.error = null;
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-quote';
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
                <div class="quote-content">
                    ${this._renderQuoteContent()}
                </div>
                <div class="quote-controls">
                    <button class="btn-new-quote">
                        <i class="fas fa-quote-right"></i> Новая цитата
                    </button>
                    <label class="api-toggle">
                        <input type="checkbox" ${this.useExternalAPI ? 'checked' : ''}> Интернет-цитаты
                    </label>
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _renderQuoteContent() {
        if (this.isLoading) {
            return `
                <div class="quote-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Загрузка цитаты...</p>
                </div>
            `;
        }
        
        if (this.error) {
            return `
                <div class="quote-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.error}</p>
                    <button class="btn-retry">Попробовать снова</button>
                </div>
            `;
        }
        
        return `
            <div class="quote-text">"${this.currentQuote}"</div>
            <div class="quote-author">— ${this._extractAuthor(this.currentQuote)}</div>
        `;
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        const newQuoteButton = this.element.querySelector('.btn-new-quote');
        const apiToggle = this.element.querySelector('.api-toggle input');
        const refreshButton = this.element.querySelector('.btn-refresh');
        
        newQuoteButton.addEventListener('click', () => {
            this._getNewQuote();
        });
        
        refreshButton.addEventListener('click', () => {
            this._getNewQuote();
        });
        
        apiToggle.addEventListener('change', (e) => {
            this.useExternalAPI = e.target.checked;
            this._getNewQuote();
        });
        
        // Обработка кнопки повтора при ошибке
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-retry')) {
                this._getNewQuote();
            }
        });
    }
    
    async _getNewQuote() {
        if (this.isLoading) return;
        
        if (this.useExternalAPI) {
            await this._fetchExternalQuote();
        } else {
            this._getLocalQuote();
        }
    }
    
    async _fetchExternalQuote() {
        this.isLoading = true;
        this.error = null;
        this._updateQuoteDisplay();
        
        try {
            // Используем API для получения случайных цитат
            // Попробуем несколько API на случай недоступности одного из них
            const apis = [
                'https://api.quotable.io/random',
                'https://zenquotes.io/api/random'
            ];
            
            let quoteData = null;
            
            for (const apiUrl of apis) {
                try {
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (apiUrl.includes('quotable.io')) {
                            // Формат quotable.io
                            quoteData = {
                                text: data.content,
                                author: data.author
                            };
                        } else if (apiUrl.includes('zenquotes.io')) {
                            // Формат zenquotes.io
                            quoteData = {
                                text: data[0].q,
                                author: data[0].a
                            };
                        }
                        break;
                    }
                } catch (error) {
                    console.log(`API ${apiUrl} недоступно, пробуем следующее...`);
                    continue;
                }
            }
            
            if (quoteData) {
                this.currentQuote = `${quoteData.text} - ${quoteData.author}`;
            } else {
                throw new Error('Все API цитат недоступны');
            }
            
        } catch (error) {
            this.error = 'Не удалось загрузить цитату. Используются локальные цитаты.';
            console.error('Ошибка при загрузке цитаты:', error);
            this._getLocalQuote(); // Fallback на локальные цитаты
            return;
        } finally {
            this.isLoading = false;
            this._updateQuoteDisplay();
        }
    }
    
    _getLocalQuote() {
        // Исключаем текущую цитату, чтобы не повторяться
        const availableQuotes = this.quotes.filter(quote => quote !== this.currentQuote);
        
        if (availableQuotes.length > 0) {
            this.currentQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
        } else {
            // Если все цитаты использованы, начинаем сначала
            this.currentQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        }
        
        this._updateQuoteDisplay();
    }
    
    _updateQuoteDisplay() {
        if (!this.element) return;
        
        const quoteContent = this.element.querySelector('.quote-content');
        if (quoteContent) {
            quoteContent.innerHTML = this._renderQuoteContent();
        }
    }
    
    _extractAuthor(quote) {
        const parts = quote.split(' - ');
        return parts.length > 1 ? parts[parts.length - 1] : 'Неизвестный автор';
    }
    
    _extractText(quote) {
        const parts = quote.split(' - ');
        return parts[0];
    }
    
    update() {
        this._getNewQuote();
    }
    
    getState() {
        return {
            quotes: this.quotes,
            currentQuote: this.currentQuote,
            useExternalAPI: this.useExternalAPI
        };
    }
}