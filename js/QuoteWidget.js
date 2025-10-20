import UIComponent from './UIComponent.js';

export default class QuoteWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Случайная цитата',
            type: 'quote'
        });
        
        this.quotes = [
            "Единственный способ сделать великую работу — любить то, что вы делаете. - Стив Джобс",
            "Инновации отличают лидера от догоняющего. - Стив Джобс",
            "Будущее принадлежит тем, кто верит в красоту своей мечты. - Элеонора Рузвельт",
            "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма. - Уинстон Черчилль",
            "Есть только один способ избежать критики: ничего не делайте, ничего не говорите и будьте никем. - Аристотель",
            "Ваше время ограничено, не тратьте его, живя чужой жизнью. - Стив Джобс",
            "Жизнь — это то, что происходит с тобой, пока ты строишь другие планы. - Джон Леннон",
            "Два самых важных дня в твоей жизни: день, когда ты появился на свет, и день, когда понял, зачем. - Марк Твен"
        ];
        
        this.currentQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-quote';
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
                <div class="quote-text">"${this.currentQuote}"</div>
                <button class="btn-refresh">Новая цитата</button>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        const refreshButton = this.element.querySelector('.btn-refresh');
        
        refreshButton.addEventListener('click', () => {
            this._refreshQuote();
        });
    }
    
    _refreshQuote() {
        // Исключаем текущую цитату, чтобы не повторяться
        const availableQuotes = this.quotes.filter(quote => quote !== this.currentQuote);
        
        if (availableQuotes.length > 0) {
            this.currentQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
            
            const quoteText = this.element.querySelector('.quote-text');
            if (quoteText) {
                quoteText.textContent = `"${this.currentQuote}"`;
            }
        }
    }
    
    update() {
        this._refreshQuote();
    }
}