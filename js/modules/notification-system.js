// Notification System Module

export class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = new Map();
        this.defaultDuration = 5000;
        this.maxNotifications = 5;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            this.createContainer();
        }
        
        this.setupEventListeners();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }
    
    setupEventListeners() {
        // Listen for custom notification events
        document.addEventListener('tvet:notify', (e) => {
            const { message, type, duration, actions } = e.detail;
            this.show(message, type, duration, actions);
        });
        
        // Handle visibility change to pause/resume timers
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllTimers();
            } else {
                this.resumeAllTimers();
            }
        });
    }
    
    show(message, type = 'info', duration = this.defaultDuration, actions = null) {
        const id = this.generateId();
        const notification = this.createNotification(id, message, type, duration, actions);
        
        // Remove oldest notification if at max limit
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId);
        }
        
        // Add to container
        this.container.appendChild(notification.element);
        this.notifications.set(id, notification);
        
        // Trigger show animation
        requestAnimationFrame(() => {
            notification.element.classList.add('show');
        });
        
        // Auto-remove after duration
        if (duration > 0) {
            notification.timer = setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        // Return notification ID for manual control
        return id;
    }
    
    createNotification(id, message, type, duration, actions) {
        const element = document.createElement('div');
        element.className = `notification ${type}`;
        element.setAttribute('data-id', id);
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'polite');
        
        const icon = this.getTypeIcon(type);
        const hasActions = actions && actions.length > 0;
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-icon">${icon}</span>
                    <h4 class="notification-title">${this.getTypeTitle(type)}</h4>
                    <button class="notification-close" aria-label="Close notification">×</button>
                </div>
                <p class="notification-message">${message}</p>
                ${hasActions ? this.createActionsHTML(actions) : ''}
                ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
            </div>
        `;
        
        // Add event listeners
        this.addNotificationListeners(element, id, duration);
        
        return {
            element,
            id,
            type,
            message,
            duration,
            timer: null,
            isPaused: false,
            remainingTime: duration
        };
    }
    
    addNotificationListeners(element, id, duration) {
        // Close button
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(id);
        });
        
        // Pause on hover
        if (duration > 0) {
            element.addEventListener('mouseenter', () => {
                this.pauseTimer(id);
            });
            
            element.addEventListener('mouseleave', () => {
                this.resumeTimer(id);
            });
        }
        
        // Action buttons
        const actionBtns = element.querySelectorAll('.notification-action');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notification = this.notifications.get(id);
                if (notification && notification.actions && notification.actions[index]) {
                    notification.actions[index].callback();
                    if (notification.actions[index].dismissOnClick !== false) {
                        this.remove(id);
                    }
                }
            });
        });
        
        // Keyboard navigation
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.remove(id);
            }
        });
        
        // Progress bar animation
        if (duration > 0) {
            const progressBar = element.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.animationDuration = `${duration}ms`;
            }
        }
    }
    
    createActionsHTML(actions) {
        return `
            <div class="notification-actions">
                ${actions.map((action, index) => `
                    <button class="notification-action btn btn-${action.style || 'outline'}" data-index="${index}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Clear timer
        if (notification.timer) {
            clearTimeout(notification.timer);
        }
        
        // Add remove animation
        notification.element.classList.add('removing');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }
    
    removeAll() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }
    
    pauseTimer(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.timer) return;
        
        clearTimeout(notification.timer);
        notification.isPaused = true;
        
        // Pause progress bar animation
        const progressBar = notification.element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
        }
    }
    
    resumeTimer(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isPaused) return;
        
        notification.isPaused = false;
        notification.timer = setTimeout(() => {
            this.remove(id);
        }, notification.remainingTime);
        
        // Resume progress bar animation
        const progressBar = notification.element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.animationPlayState = 'running';
        }
    }
    
    pauseAllTimers() {
        this.notifications.forEach((notification, id) => {
            if (notification.timer && !notification.isPaused) {
                this.pauseTimer(id);
            }
        });
    }
    
    resumeAllTimers() {
        this.notifications.forEach((notification, id) => {
            if (notification.isPaused) {
                this.resumeTimer(id);
            }
        });
    }
    
    // Convenience methods
    success(message, duration = this.defaultDuration, actions = null) {
        return this.show(message, 'success', duration, actions);
    }
    
    error(message, duration = 0, actions = null) {
        return this.show(message, 'error', duration, actions);
    }
    
    warning(message, duration = this.defaultDuration, actions = null) {
        return this.show(message, 'warning', duration, actions);
    }
    
    info(message, duration = this.defaultDuration, actions = null) {
        return this.show(message, 'info', duration, actions);
    }
    
    // Utility methods
    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    getTypeTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || titles.info;
    }
    
    // Public API methods
    getNotification(id) {
        return this.notifications.get(id);
    }
    
    getAllNotifications() {
        return Array.from(this.notifications.values());
    }
    
    getNotificationCount() {
        return this.notifications.size;
    }
    
    hasNotifications() {
        return this.notifications.size > 0;
    }
    
    // Settings
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }
    
    setMaxNotifications(max) {
        this.maxNotifications = max;
    }
    
    // Batch operations
    showBatch(notifications) {
        notifications.forEach(({ message, type, duration, actions }) => {
            this.show(message, type, duration, actions);
        });
    }
    
    // Toast-style notifications
    toast(message, type = 'info') {
        return this.show(message, type, 3000);
    }
    
    // Persistent notifications (no auto-dismiss)
    persistent(message, type = 'info', actions = null) {
        return this.show(message, type, 0, actions);
    }
}

