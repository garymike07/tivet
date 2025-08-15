// Theme Switcher Module

export class ThemeSwitcher {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.querySelector('.theme-icon');
        this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.setupSystemThemeListener();
    }
    
    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    setupSystemThemeListener() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    getPreferredTheme() {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    getStoredTheme() {
        return localStorage.getItem('tvet-theme');
    }
    
    storeTheme(theme) {
        localStorage.setItem('tvet-theme', theme);
    }
    
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#0f172a' : '#2563eb';
        }
        
        // Update theme icon
        this.updateThemeIcon(theme);
        
        // Store preference
        this.storeTheme(theme);
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('tvet:theme:changed', {
            detail: { theme }
        }));
        
        // Update CSS custom properties if needed
        this.updateCustomProperties(theme);
    }
    
    updateThemeIcon(theme) {
        if (this.themeIcon) {
            this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    updateCustomProperties(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            // Dark theme custom properties are handled in CSS
            // Additional JavaScript-based theme updates can go here
        } else {
            // Light theme custom properties
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Add transition class for smooth theme switching
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
        
        // Show notification
        this.showThemeChangeNotification(newTheme);
    }
    
    showThemeChangeNotification(theme) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = `Switched to ${theme} theme`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: var(--white);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    // Public methods
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark' || theme === 'auto') {
            if (theme === 'auto') {
                localStorage.removeItem('tvet-theme');
                this.applyTheme(this.getPreferredTheme());
            } else {
                this.applyTheme(theme);
            }
        }
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    isSystemDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Theme-specific utilities
    getThemeColors() {
        const computedStyle = getComputedStyle(document.documentElement);
        return {
            primary: computedStyle.getPropertyValue('--primary-color').trim(),
            secondary: computedStyle.getPropertyValue('--secondary-color').trim(),
            background: computedStyle.getPropertyValue('--white').trim(),
            text: computedStyle.getPropertyValue('--gray-900').trim()
        };
    }
    
    // High contrast mode support
    setupHighContrastMode() {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        
        const handleContrastChange = (e) => {
            document.documentElement.toggleClass('high-contrast', e.matches);
        };
        
        mediaQuery.addEventListener('change', handleContrastChange);
        handleContrastChange(mediaQuery);
    }
    
    // Reduced motion support
    setupReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionChange = (e) => {
            document.documentElement.toggleClass('reduced-motion', e.matches);
        };
        
        mediaQuery.addEventListener('change', handleMotionChange);
        handleMotionChange(mediaQuery);
    }
}

