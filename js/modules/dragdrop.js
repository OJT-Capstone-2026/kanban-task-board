import { taskManager } from './taskManager.js';

export const dragdrop = {
  activeDragCardId: null,
  touchDragElement: null,
  touchOffsets: { x: 0, y: 0 },

  init() {
    this.bindColumnEvents();
  },

  // Make a newly rendered card draggable
  makeDraggable(card) {
    card.setAttribute('draggable', 'true');
    
    // HTML5 Drag Events (Desktop)
    card.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
    card.addEventListener('dragend', (e) => this.handleDragEnd(e, card));

    // Touch Events (Mobile)
    card.addEventListener('touchstart', (e) => this.handleTouchStart(e, card), { passive: false });
    card.addEventListener('touchmove', (e) => this.handleTouchMove(e, card), { passive: false });
    card.addEventListener('touchend', (e) => this.handleTouchEnd(e, card));
  },

  bindColumnEvents() {
    const columns = document.querySelectorAll('.board-column');
    columns.forEach(column => {
      const dropzone = column.querySelector('.cards-list');
      if (!dropzone) return;

      dropzone.addEventListener('dragover', (e) => this.handleDragOver(e, column));
      dropzone.addEventListener('dragleave', (e) => this.handleDragLeave(e, column));
      dropzone.addEventListener('drop', (e) => this.handleDrop(e, column));
    });
  },

  // --- HTML5 DESKTOP DRAG HANDLERS ---
  handleDragStart(e, card) {
    this.activeDragCardId = card.dataset.id;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.id);
  },

  handleDragEnd(e, card) {
    card.classList.remove('dragging');
    this.activeDragCardId = null;

    // Ensure all columns clear their dragover states
    document.querySelectorAll('.board-column').forEach(col => col.classList.remove('dragover'));
  },

  handleDragOver(e, column) {
    e.preventDefault(); // Required to allow drop
    column.classList.add('dragover');
  },

  handleDragLeave(e, column) {
    column.classList.remove('dragover');
  },

  handleDrop(e, column) {
    e.preventDefault();
    column.classList.remove('dragover');
    
    const cardId = e.dataTransfer.getData('text/plain') || this.activeDragCardId;
    const newStatus = column.dataset.status;

    if (cardId && newStatus) {
      this.recentlyDroppedCardId = cardId;
      taskManager.moveTask(cardId, newStatus);
    }
  },

  // --- TOUCH EVENT EMULATION FOR MOBILE ---
  handleTouchStart(e, card) {
    // Only drag with single touch
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    
    // Store offsets to prevent card jumping to center of touch pointer
    this.touchOffsets.x = touch.clientX - rect.left;
    this.touchOffsets.y = touch.clientY - rect.top;
    
    this.activeDragCardId = card.dataset.id;
    this.touchDragElement = card.cloneNode(true);
    
    // Setup floating ghost clone styles
    Object.assign(this.touchDragElement.style, {
      position: 'fixed',
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      zIndex: '1000',
      opacity: '0.8',
      pointerEvents: 'none',
      transform: 'scale(1.05) rotate(2deg)',
      boxShadow: 'var(--shadow-xl)',
      border: '2px solid var(--accent)'
    });
    
    document.body.appendChild(this.touchDragElement);
    card.classList.add('dragging');
    
    // Prevent screen scrolling during drag
    e.preventDefault();
  },

  handleTouchMove(e, card) {
    if (!this.touchDragElement) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - this.touchOffsets.x;
    const y = touch.clientY - this.touchOffsets.y;
    
    this.touchDragElement.style.left = `${x}px`;
    this.touchDragElement.style.top = `${y}px`;
    
    // Find the element currently under the touch pointer
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elemBelow) return;
    
    const columnBelow = elemBelow.closest('.board-column');
    
    // Clear other drag highlights
    document.querySelectorAll('.board-column').forEach(col => {
      if (col === columnBelow) {
        col.classList.add('dragover');
      } else {
        col.classList.remove('dragover');
      }
    });
    
    e.preventDefault();
  },

  handleTouchEnd(e, card) {
    card.classList.remove('dragging');
    
    if (this.touchDragElement) {
      this.touchDragElement.remove();
      this.touchDragElement = null;
    }
    
    // Find the element under the touch end coordinate
    const changedTouch = e.changedTouches[0];
    const elemBelow = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
    
    document.querySelectorAll('.board-column').forEach(col => col.classList.remove('dragover'));
    
    if (elemBelow) {
      const columnBelow = elemBelow.closest('.board-column');
      if (columnBelow && this.activeDragCardId) {
        const newStatus = columnBelow.dataset.status;
        this.recentlyDroppedCardId = this.activeDragCardId;
        taskManager.moveTask(this.activeDragCardId, newStatus);
      }
    }
    
    this.activeDragCardId = null;
  }
};
