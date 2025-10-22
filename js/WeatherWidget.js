import UIComponent from './UIComponent.js';

export default class WeatherWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Погода',
            type: 'weather'
        });
        
        this.city = config.city || 'Москва';
        this.weatherData = config.weatherData || null;
        this.error = config.error || null;
        this.isLoading = false;
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-weather';
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
                <div class="weather-input">
                    <input type="text" class="city-input" value="${this.city}" placeholder="Введите город">
                    <button class="btn-search">Поиск</button>
                </div>
                <div class="weather-data">
                    ${this._renderWeatherContent()}
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        
        // Загружаем данные о погоде, если их еще нет
        if (!this.weatherData && !this.error) {
            this._fetchWeatherData();
        }
        
        return widgetElement;
    }
    
    _renderWeatherContent() {
        if (this.isLoading) {
            return '<div class="loading">Загрузка данных о погоде...</div>';
        }
        
        if (this.error) {
            return `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка: ${this.error}</p>
                    <button class="btn-retry">Попробовать снова</button>
                </div>
            `;
        }
        
        if (!this.weatherData) {
            return '<div class="loading">Загрузка данных о погоде...</div>';
        }
        
        const weather = this.weatherData;
        const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        
        return `
            <div class="weather-main">
                <div class="weather-city">${weather.name}, ${weather.sys.country}</div>
                <div class="weather-temp">${Math.round(weather.main.temp)}°C</div>
                <div class="weather-desc">
                    <img src="${iconUrl}" alt="${weather.weather[0].description}">
                    <span>${weather.weather[0].description}</span>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span class="label">Ощущается как:</span>
                    <span class="value">${Math.round(weather.main.feels_like)}°C</span>
                </div>
                <div class="weather-detail">
                    <span class="label">Влажность:</span>
                    <span class="value">${weather.main.humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span class="label">Давление:</span>
                    <span class="value">${weather.main.pressure} hPa</span>
                </div>
                <div class="weather-detail">
                    <span class="label">Ветер:</span>
                    <span class="value">${weather.wind.speed} м/с</span>
                </div>
            </div>
        `;
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        const searchButton = this.element.querySelector('.btn-search');
        const cityInput = this.element.querySelector('.city-input');
        const refreshButton = this.element.querySelector('.btn-refresh');
        
        searchButton.addEventListener('click', () => {
            const newCity = cityInput.value.trim();
            if (newCity) {
                this.city = newCity;
                this._fetchWeatherData();
            }
        });
        
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const newCity = cityInput.value.trim();
                if (newCity) {
                    this.city = newCity;
                    this._fetchWeatherData();
                }
            }
        });
        
        refreshButton.addEventListener('click', () => {
            this._fetchWeatherData();
        });
        
        // Обработка кнопки повтора при ошибке
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-retry')) {
                this._fetchWeatherData();
            }
        });
    }
    
    async _fetchWeatherData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.error = null;
        this._updateWeatherDisplay();
        
        try {
            const weatherDataElement = this.element?.querySelector('.weather-data');
            
            // Используем OpenWeatherMap API (бесплатный ключ для демо)
            // В реальном приложении ключ должен храниться безопасно
            const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // Это демо-ключ, может не работать при высокой нагрузке
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apiKey}&units=metric&lang=ru`
            );
            
            if (!response.ok) {
                throw new Error('Город не найден или проблема с API');
            }
            
            const data = await response.json();
            this.weatherData = data;
            this.error = null;
            
        } catch (error) {
            this.error = error.message;
            console.error('Ошибка при загрузке погоды:', error);
        } finally {
            this.isLoading = false;
            this._updateWeatherDisplay();
        }
    }
    
    _updateWeatherDisplay() {
        if (!this.element) return;
        
        const weatherDataElement = this.element.querySelector('.weather-data');
        if (weatherDataElement) {
            weatherDataElement.innerHTML = this._renderWeatherContent();
        }
    }
    
    update() {
        this._fetchWeatherData();
    }
    
    getState() {
        return {
            city: this.city,
            weatherData: this.weatherData,
            error: this.error
        };
    }
}