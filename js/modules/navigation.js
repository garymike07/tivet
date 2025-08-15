// Navigation Manager Module

export class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isMenuOpen = false;
        this.scrollThreshold = 100;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupScrollBehavior();
        this.setupActiveNavigation();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavLinkClick(e);
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    setupScrollBehavior() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (currentScrollY > this.scrollThreshold) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll (optional)
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                this.navbar?.classList.add('nav-hidden');
            } else {
                this.navbar?.classList.remove('nav-hidden');
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    setupActiveNavigation() {
        // Update active navigation based on current section
        const sections = document.querySelectorAll('section[id]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveNavLink(entry.target.id);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        this.navMenu?.classList.add('active');
        this.navToggle?.classList.add('active');
        this.isMenuOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first menu item for accessibility
        const firstLink = this.navMenu?.querySelector('.nav-link');
        firstLink?.focus();
    }
    
    closeMobileMenu() {
        this.navMenu?.classList.remove('active');
        this.navToggle?.classList.remove('active');
        this.isMenuOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    handleNavLinkClick(e) {
        const link = e.target;
        const href = link.getAttribute('href');
        
        // Handle internal links (anchors)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                this.scrollToSection(targetSection);
                this.setActiveNavLink(targetId);
                
                // Close mobile menu if open
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        } else if (href && !href.startsWith('http')) {
            // Handle internal page links
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }
    }
    
    scrollToSection(section) {
        const navbarHeight = this.navbar?.offsetHeight || 0;
        const targetPosition = section.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
    
    setActiveNavLink(sectionId) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        activeLink?.classList.add('active');
    }
    
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    handleScroll() {
        // Additional scroll handling if needed
    }
    
    // Public methods
    navigateTo(url) {
        window.location.href = url;
    }
    
    goBack() {
        window.history.back();
    }
    
    goForward() {
        window.history.forward();
    }
    
    reload() {
        window.location.reload();
    }
}

