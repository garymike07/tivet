// TVET Platform - Main Application JavaScript

// Import modules
import { NavigationManager } from './modules/navigation.js';
import { ThemeSwitcher } from './modules/theme-switcher.js';
import { ProgressTracker } from './modules/progress-tracker.js';
import { SearchFilter } from './modules/search-filter.js';
import { NotificationSystem } from './modules/notification-system.js';
import { QuizEngine } from './modules/quiz-engine.js';
import { coursesData } from './data/courses-data.js';
import { trainersData } from './data/trainers-data.js';

class TVETApp {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.data = {
            courses: coursesData,
            trainers: trainersData
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize TVET App:', error);
        }
    }
    
    async initializeApp() {
        try {
            // Show loading overlay
            this.showLoading();
            
            // Initialize core modules
            await this.initializeModules();
            
            // Initialize page-specific functionality
            this.initializePage();
            
            // Set up global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize animations and scroll effects
            this.initializeAnimations();
            
            // Hide loading overlay
            this.hideLoading();
            
            this.isInitialized = true;
            
            // Dispatch app ready event
            document.dispatchEvent(new CustomEvent('tvet:app:ready'));
            
            console.log('TVET Platform initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize TVET Platform:', error);
            this.modules.notifications?.show('Failed to initialize application', 'error');
        }
    }
    
    async initializeModules() {
        try {
            // Initialize Navigation Manager
            this.modules.navigation = new NavigationManager();
            
            // Initialize Theme Switcher
            this.modules.theme = new ThemeSwitcher();
            
            // Initialize Progress Tracker
            this.modules.progress = new ProgressTracker();
            
            // Initialize Search and Filter
            this.modules.search = new SearchFilter();
            
            // Initialize Notification System
            this.modules.notifications = new NotificationSystem();
            
            // Initialize Quiz Engine
            this.modules.quiz = new QuizEngine();
            
            console.log('All modules initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize modules:', error);
            throw error;
        }
    }
    
    initializePage() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'home':
                this.initializeHomePage();
                break;
            case 'courses':
                this.initializeCoursesPage();
                break;
            case 'trainers':
                this.initializeTrainersPage();
                break;
            case 'dashboard':
                this.initializeDashboardPage();
                break;
            default:
                this.initializeHomePage();
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('courses')) return 'courses';
        if (path.includes('trainers')) return 'trainers';
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('certifications')) return 'certifications';
        if (path.includes('community')) return 'community';
        return 'home';
    }
    
    initializeHomePage() {
        // Initialize hero section
        this.initializeHeroSection();
        
        // Initialize course showcase
        this.initializeCourseShowcase();
        
        // Initialize trainer preview
        this.initializeTrainerPreview();
        
        // Initialize assessment hub
        this.initializeAssessmentHub();
        
        // Initialize pricing section
        this.initializePricingSection();
        
        // Initialize stats counter animation
        this.initializeStatsCounter();
    }
    
    initializeHeroSection() {
        // Typing animation for hero title
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            const text = typingElement.getAttribute('data-text');
            this.typeWriter(typingElement, text, 50);
        }
        
        // Hero CTA buttons
        const startLearningBtn = document.getElementById('start-learning-btn');
        const watchDemoBtn = document.getElementById('watch-demo-btn');
        
        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', () => {
                this.scrollToSection('courses');
            });
        }
        
        if (watchDemoBtn) {
            watchDemoBtn.addEventListener('click', () => {
                this.openDemoModal();
            });
        }
        
        // Scroll indicator
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                this.scrollToSection('courses');
            });
        }
    }
    
    initializeCourseShowcase() {
        const coursesGrid = document.getElementById('courses-grid');
        if (coursesGrid) {
            this.renderCourses(this.data.courses.slice(0, 8)); // Show first 8 courses
        }
        
        // Initialize course filters
        this.initializeCourseFilters();
    }
    
    initializeTrainerPreview() {
        const trainersGrid = document.getElementById('trainers-grid');
        if (trainersGrid) {
            this.renderTrainers(this.data.trainers.slice(0, 4)); // Show first 4 trainers
        }
    }
    
    initializeAssessmentHub() {
        const assessmentCards = document.querySelectorAll('.assessment-start');
        assessmentCards.forEach(button => {
            button.addEventListener('click', (e) => {
                const assessmentType = e.target.getAttribute('data-assessment');
                this.startAssessment(assessmentType);
            });
        });
    }
    
    initializePricingSection() {
        const pricingToggle = document.getElementById('pricing-toggle');
        if (pricingToggle) {
            pricingToggle.addEventListener('change', (e) => {
                this.togglePricingPeriod(e.target.checked);
            });
        }
    }
    
    initializeCourseFilters() {
        const tradeFilter = document.getElementById('trade-filter');
        const levelFilter = document.getElementById('level-filter');
        const durationFilter = document.getElementById('duration-filter');
        const clearFilters = document.getElementById('clear-filters');
        
        if (tradeFilter) {
            tradeFilter.addEventListener('change', () => this.filterCourses());
        }
        
        if (levelFilter) {
            levelFilter.addEventListener('change', () => this.filterCourses());
        }
        
        if (durationFilter) {
            durationFilter.addEventListener('change', () => this.filterCourses());
        }
        
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearAllFilters());
        }
    }
    
    initializeStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    this.animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    setupGlobalEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Window scroll handler
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Click outside handler for dropdowns
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });
    }
    
    initializeAnimations() {
        // Scroll reveal animations
        this.initializeScrollReveal();
        
        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }
    
    initializeScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => observer.observe(el));
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);
        
        // Observe cards and sections
        const elementsToObserve = document.querySelectorAll('.course-card, .trainer-card, .assessment-card, .pricing-card');
        elementsToObserve.forEach(el => observer.observe(el));
    }
    
    // Course rendering
    renderCourses(courses) {
        const coursesGrid = document.getElementById('courses-grid');
        if (!coursesGrid) return;
        
        coursesGrid.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
        
        // Add event listeners to course cards
        this.addCourseCardListeners();
    }
    
    createCourseCard(course) {
        return `
            <div class="course-card" data-course-id="${course.id}" data-trade="${course.trade}" data-level="${course.level}" data-duration="${course.duration}">
                <img src="${course.thumbnail}" alt="${course.title}" class="course-thumbnail" loading="lazy">
                <div class="course-content">
                    <div class="course-meta">
                        <span class="course-level">${course.level}</span>
                        <span class="course-duration">${course.duration}</span>
                    </div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-footer">
                        <span class="course-price">${course.price}</span>
                        <div class="course-rating">
                            <span class="rating-stars">${this.generateStars(course.rating)}</span>
                            <span class="rating-text">${course.rating} (${course.reviews})</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Trainer rendering
    renderTrainers(trainers) {
        const trainersGrid = document.getElementById('trainers-grid');
        if (!trainersGrid) return;
        
        trainersGrid.innerHTML = trainers.map(trainer => this.createTrainerCard(trainer)).join('');
    }
    
    createTrainerCard(trainer) {
        return `
            <div class="trainer-card" data-trainer-id="${trainer.id}">
                <img src="${trainer.avatar}" alt="${trainer.name}" class="trainer-avatar" loading="lazy">
                <h3 class="trainer-name">${trainer.name}</h3>
                <p class="trainer-specialty">${trainer.specialty}</p>
                <div class="trainer-rating">
                    <span class="rating-stars">${this.generateStars(trainer.rating)}</span>
                    <span class="rating-text">${trainer.rating}</span>
                </div>
                <div class="trainer-stats">
                    <div class="trainer-stat">
                        <span class="trainer-stat-value">${trainer.students}</span>
                        <span class="trainer-stat-label">Students</span>
                    </div>
                    <div class="trainer-stat">
                        <span class="trainer-stat-value">${trainer.courses}</span>
                        <span class="trainer-stat-label">Courses</span>
                    </div>
                    <div class="trainer-stat">
                        <span class="trainer-stat-value">${trainer.experience}y</span>
                        <span class="trainer-stat-label">Experience</span>
                    </div>
                </div>
                <button class="btn btn-primary">View Profile</button>
            </div>
        `;
    }
    
    // Utility functions
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        if (hasHalfStar) {
            stars += '☆';
        }
        
        return stars;
    }
    
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }
    
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    filterCourses() {
        const tradeFilter = document.getElementById('trade-filter')?.value || 'all';
        const levelFilter = document.getElementById('level-filter')?.value || 'all';
        const durationFilter = document.getElementById('duration-filter')?.value || 'all';
        
        let filteredCourses = this.data.courses;
        
        if (tradeFilter !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.trade === tradeFilter);
        }
        
        if (levelFilter !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.level === levelFilter);
        }
        
        if (durationFilter !== 'all') {
            filteredCourses = filteredCourses.filter(course => {
                const duration = parseInt(course.duration);
                switch (durationFilter) {
                    case 'short': return duration < 2;
                    case 'medium': return duration >= 2 && duration <= 5;
                    case 'long': return duration > 5;
                    default: return true;
                }
            });
        }
        
        this.renderCourses(filteredCourses);
    }
    
    clearAllFilters() {
        document.getElementById('trade-filter').value = 'all';
        document.getElementById('level-filter').value = 'all';
        document.getElementById('duration-filter').value = 'all';
        this.renderCourses(this.data.courses);
    }
    
    togglePricingPeriod(isAnnual) {
        const monthlyPrices = document.querySelectorAll('.monthly-price');
        const annualPrices = document.querySelectorAll('.annual-price');
        
        if (isAnnual) {
            monthlyPrices.forEach(price => price.style.display = 'none');
            annualPrices.forEach(price => price.style.display = 'inline');
        } else {
            monthlyPrices.forEach(price => price.style.display = 'inline');
            annualPrices.forEach(price => price.style.display = 'none');
        }
    }
    
    startAssessment(type) {
        this.modules.notifications?.show(`Starting ${type} assessment...`, 'info');
        // Redirect to assessment page or open modal
        setTimeout(() => {
            this.modules.quiz?.startQuiz(type);
        }, 1000);
    }
    
    openDemoModal() {
        // Create and show demo modal
        this.modules.notifications?.show('Demo video coming soon!', 'info');
    }
    
    addCourseCardListeners() {
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const courseId = card.getAttribute('data-course-id');
                this.openCourseDetails(courseId);
            });
        });
    }
    
    openCourseDetails(courseId) {
        const course = this.data.courses.find(c => c.id === courseId);
        if (course) {
            // Navigate to course page or open modal
            window.location.href = `pages/courses/${course.slug}.html`;
        }
    }
    
    // Event handlers
    handleResize() {
        // Handle responsive behavior
        this.modules.navigation?.handleResize();
    }
    
    handleScroll() {
        // Handle scroll effects
        this.modules.navigation?.handleScroll();
        this.updateScrollProgress();
    }
    
    updateScrollProgress() {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        document.documentElement.style.setProperty('--scroll-progress', `${scrolled}%`);
    }
    
    handleKeyboardNavigation(e) {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.modules.search?.focusSearchInput();
                    break;
                case '/':
                    e.preventDefault();
                    this.modules.search?.focusSearchInput();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }
    
    handleClickOutside(e) {
        // Close dropdowns and modals when clicking outside
        if (!e.target.closest('.dropdown')) {
            this.closeDropdowns();
        }
    }
    
    handleFormSubmission(e) {
        // Handle form submissions
        if (e.target.classList.contains('contact-form')) {
            e.preventDefault();
            this.handleContactForm(e.target);
        }
    }
    
    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 500);
        }
    }
    
    closeModals() {
        // Close all open modals
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => modal.classList.remove('active'));
    }
    
    closeDropdowns() {
        // Close all open dropdowns
        const dropdowns = document.querySelectorAll('.dropdown.active');
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    }
}

// Initialize the application
const app = new TVETApp();

// Export for global access
window.TVETApp = app;

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered successfully:', registration);
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    });
}

export default TVETApp;

