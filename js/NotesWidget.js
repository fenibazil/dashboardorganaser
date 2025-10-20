import UIComponent from './UIComponent.js';

export default class NotesWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Мои заметки',
            type: 'notes'
        });
        
        this.notes = config.notes || [];
        this.nextId = config.nextId || 1;
        this.currentFilter = config.currentFilter || 'all';
    }
    
    render() {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget widget-notes';
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
                <div class="notes-controls">
                    <button class="btn-add-note">
                        <i class="fas fa-plus"></i> Новая заметка
                    </button>
                    <div class="notes-filters">
                        <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                            Все
                        </button>
                        <button class="filter-btn ${this.currentFilter === 'favorites' ? 'active' : ''}" data-filter="favorites">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
                
                <div class="notes-grid">
                    ${this._renderNotes()}
                </div>
            </div>
        `;
        
        this.element = widgetElement;
        this._attachEventListeners();
        return widgetElement;
    }
    
    _renderNotes() {
        let filteredNotes = this.notes;
        
        if (this.currentFilter === 'favorites') {
            filteredNotes = this.notes.filter(note => note.favorite);
        }
        
        if (filteredNotes.length === 0) {
            const message = this.currentFilter === 'favorites' ? 
                'Нет избранных заметок' : 
                'Заметок пока нет. Создайте первую!';
            
            return `<div class="empty-notes">${message}</div>`;
        }
        
        return filteredNotes.map(note => `
            <div class="note-card ${note.favorite ? 'favorite' : ''}" data-id="${note.id}">
                <div class="note-header">
                    <h4 class="note-title">${note.title || 'Без названия'}</h4>
                    <div class="note-actions">
                        <button class="btn-favorite ${note.favorite ? 'active' : ''}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn-delete-note">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">
                    ${note.content || ''}
                </div>
                <div class="note-footer">
                    <span class="note-date">
                        ${new Date(note.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                    ${note.tags && note.tags.length > 0 ? `
                        <div class="note-tags">
                            ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    _attachEventListeners() {
        super._attachEventListeners();
        
        if (!this.element) return;
        
        // Добавление заметки
        const addBtn = this.element.querySelector('.btn-add-note');
        addBtn.addEventListener('click', () => this._addNote());
        
        // Фильтры
        const filterButtons = this.element.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this._updateView();
            });
        });
        
        // Обработка событий заметок через делегирование
        const notesGrid = this.element.querySelector('.notes-grid');
        notesGrid.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const noteCard = target.closest('.note-card');
            const noteId = parseInt(noteCard.dataset.id);
            
            if (target.classList.contains('btn-delete-note')) {
                this._deleteNote(noteId);
            } else if (target.classList.contains('btn-favorite')) {
                this._toggleFavorite(noteId);
            }
        });
        
        // Редактирование по клику на заметку
        notesGrid.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const noteCard = e.target.closest('.note-card');
                if (noteCard) {
                    const noteId = parseInt(noteCard.dataset.id);
                    this._editNote(noteId);
                }
            }
        });
    }
    
    _addNote() {
        const title = prompt('Введите заголовок заметки:') || 'Новая заметка';
        const content = prompt('Введите содержимое заметки:') || '';
        const tagsInput = prompt('Введите теги через запятую (необязательно):') || '';
        
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        
        const newNote = {
            id: this.nextId++,
            title: title,
            content: content,
            tags: tags,
            favorite: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.notes.unshift(newNote); // Добавляем в начало
        this._updateView();
    }
    
    _editNote(noteId) {
        const note = this.notes.find(note => note.id === noteId);
        if (!note) return;
        
        const newTitle = prompt('Редактировать заголовок:', note.title) || note.title;
        const newContent = prompt('Редактировать содержимое:', note.content) || note.content;
        const newTags = prompt('Редактировать теги:', note.tags.join(', ')) || '';
        
        note.title = newTitle;
        note.content = newContent;
        note.tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        note.updatedAt = new Date();
        
        this._updateView();
    }
    
    _deleteNote(noteId) {
        if (confirm('Удалить эту заметку?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this._updateView();
        }
    }
    
    _toggleFavorite(noteId) {
        const note = this.notes.find(note => note.id === noteId);
        if (note) {
            note.favorite = !note.favorite;
            note.updatedAt = new Date();
            this._updateView();
        }
    }
    
    _updateView() {
        const notesGrid = this.element.querySelector('.notes-grid');
        if (notesGrid) {
            notesGrid.innerHTML = this._renderNotes();
        }
    }
    
    getState() {
        return {
            notes: this.notes,
            nextId: this.nextId,
            currentFilter: this.currentFilter
        };
    }
}