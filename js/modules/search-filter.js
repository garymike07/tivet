// Search and Filter Module

export class SearchFilter {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.filters = {};
        this.searchHistory = this.loadSearchHistory();
        this.searchIndex = new Map();
        this.debounceTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.buildSearchIndex();
        this.initializeFilters();
    }
    
    setupEventListeners() {
        // Search input events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            this.searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
            
            this.searchInput.addEventListener('blur', () => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => this.hideSearchSuggestions(), 200);
            });
            
            this.searchInput.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });
        }
        
        // Search button
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => {
                this.performSearch(this.searchInput.value);
            });
        }
        
        // Filter change events
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-select') || e.target.classList.contains('filter-checkbox')) {
                this.handleFilterChange();
            }
        });
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // Search shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearchInput();
            }
            
            if (e.key === '/' && !this.isInputFocused()) {
                e.preventDefault();
                this.focusSearchInput();
            }
        });
    }
    
    buildSearchIndex() {
        // This would be populated with actual data
        // For now, we'll use placeholder data
        const searchableItems = [
            { id: 'welding-001', type: 'course', title: 'Welding Fundamentals', keywords: ['welding', 'arc', 'mig', 'safety'] },
            { id: 'electrical-001', type: 'course', title: 'Electrical Basics', keywords: ['electrical', 'wiring', 'circuits', 'safety'] },
            { id: 'plumbing-001', type: 'course', title: 'Plumbing Essentials', keywords: ['plumbing', 'pipes', 'fitting', 'repair'] }
        ];
        
        searchableItems.forEach(item => {
            this.searchIndex.set(item.id, item);
        });
    }
    
    initializeFilters() {
        // Initialize filter states
        this.filters = {
            trade: 'all',
            level: 'all',
            duration: 'all',
            price: 'all',
            rating: 'all'
        };
        
        // Set up filter elements
        this.setupFilterElements();
    }
    
    setupFilterElements() {
        // Trade filter
        const tradeFilter = document.getElementById('trade-filter');
        if (tradeFilter) {
            this.populateTradeFilter(tradeFilter);
        }
        
        // Level filter
        const levelFilter = document.getElementById('level-filter');
        if (levelFilter) {
            this.populateLevelFilter(levelFilter);
        }
        
        // Duration filter
        const durationFilter = document.getElementById('duration-filter');
        if (durationFilter) {
            this.populateDurationFilter(durationFilter);
        }
        
        // Price range filter
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            this.setupPriceRangeFilter(priceRange);
        }
        
        // Rating filter
        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) {
            this.populateRatingFilter(ratingFilter);
        }
    }
    
    handleSearchInput(query) {
        // Debounce search input
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (query.length >= 2) {
                this.showSearchSuggestions(query);
                this.performLiveSearch(query);
            } else {
                this.hideSearchSuggestions();
                this.clearSearchResults();
            }
        }, 300);
    }
    
    handleSearchKeydown(e) {
        const suggestions = this.searchSuggestions?.querySelectorAll('.search-suggestion');
        
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.performSearch(e.target.value);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSuggestions('down', suggestions);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions('up', suggestions);
                break;
                
            case 'Escape':
                this.hideSearchSuggestions();
                e.target.blur();
                break;
        }
    }
    
    performSearch(query) {
        if (!query.trim()) return;
        
        // Add to search history
        this.addToSearchHistory(query);
        
        // Perform the actual search
        const results = this.search(query);
        
        // Display results
        this.displaySearchResults(results, query);
        
        // Hide suggestions
        this.hideSearchSuggestions();
        
        // Update URL with search parameters
        this.updateURL({ search: query });
        
        // Dispatch search event
        document.dispatchEvent(new CustomEvent('tvet:search:performed', {
            detail: { query, results }
        }));
    }
    
    performLiveSearch(query) {
        const results = this.search(query);
        this.displayLiveSearchResults(results, query);
    }
    
    search(query) {
        const lowercaseQuery = query.toLowerCase();
        const results = [];
        
        // Search through indexed items
        this.searchIndex.forEach((item, id) => {
            let score = 0;
            
            // Title match (highest priority)
            if (item.title.toLowerCase().includes(lowercaseQuery)) {
                score += 10;
            }
            
            // Keyword match
            item.keywords.forEach(keyword => {
                if (keyword.toLowerCase().includes(lowercaseQuery)) {
                    score += 5;
                }
            });
            
            // Fuzzy matching for typos
            if (this.fuzzyMatch(item.title, query) || 
                item.keywords.some(keyword => this.fuzzyMatch(keyword, query))) {
                score += 2;
            }
            
            if (score > 0) {
                results.push({ ...item, score });
            }
        });
        
        // Sort by relevance score
        results.sort((a, b) => b.score - a.score);
        
        // Apply current filters
        return this.applyFilters(results);
    }
    
    fuzzyMatch(text, query) {
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Simple fuzzy matching - can be improved with more sophisticated algorithms
        let textIndex = 0;
        let queryIndex = 0;
        
        while (textIndex < textLower.length && queryIndex < queryLower.length) {
            if (textLower[textIndex] === queryLower[queryIndex]) {
                queryIndex++;
            }
            textIndex++;
        }
        
        return queryIndex === queryLower.length;
    }
    
    applyFilters(results) {
        return results.filter(item => {
            // Apply trade filter
            if (this.filters.trade !== 'all' && item.trade !== this.filters.trade) {
                return false;
            }
            
            // Apply level filter
            if (this.filters.level !== 'all' && item.level !== this.filters.level) {
                return false;
            }
            
            // Apply duration filter
            if (this.filters.duration !== 'all') {
                const duration = this.parseDuration(item.duration);
                if (!this.matchesDurationFilter(duration, this.filters.duration)) {
                    return false;
                }
            }
            
            // Apply price filter
            if (this.filters.price !== 'all') {
                const price = this.parsePrice(item.price);
                if (!this.matchesPriceFilter(price, this.filters.price)) {
                    return false;
                }
            }
            
            // Apply rating filter
            if (this.filters.rating !== 'all') {
                if (item.rating < parseFloat(this.filters.rating)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    handleFilterChange() {
        // Update filter values
        this.updateFilterValues();
        
        // Re-apply search with new filters
        const currentQuery = this.searchInput?.value || '';
        if (currentQuery) {
            this.performLiveSearch(currentQuery);
        } else {
            // Show all filtered results
            this.displayFilteredResults();
        }
        
        // Update URL
        this.updateURL(this.filters);
        
        // Dispatch filter change event
        document.dispatchEvent(new CustomEvent('tvet:filters:changed', {
            detail: { filters: this.filters }
        }));
    }
    
    updateFilterValues() {
        const tradeFilter = document.getElementById('trade-filter');
        const levelFilter = document.getElementById('level-filter');
        const durationFilter = document.getElementById('duration-filter');
        const priceRange = document.getElementById('price-range');
        const ratingFilter = document.getElementById('rating-filter');
        
        if (tradeFilter) this.filters.trade = tradeFilter.value;
        if (levelFilter) this.filters.level = levelFilter.value;
        if (durationFilter) this.filters.duration = durationFilter.value;
        if (priceRange) this.filters.price = priceRange.value;
        if (ratingFilter) this.filters.rating = ratingFilter.value;
    }
    
    clearAllFilters() {
        // Reset filter values
        this.filters = {
            trade: 'all',
            level: 'all',
            duration: 'all',
            price: 'all',
            rating: 'all'
        };
        
        // Reset filter elements
        const filterElements = document.querySelectorAll('.filter-select, .filter-checkbox');
        filterElements.forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = 'all';
            }
        });
        
        // Refresh results
        this.handleFilterChange();
        
        // Show notification
        document.dispatchEvent(new CustomEvent('tvet:notify', {
            detail: {
                message: 'All filters cleared',
                type: 'info',
                duration: 2000
            }
        }));
    }
    
    // Search Suggestions
    showSearchSuggestions(query = '') {
        if (!this.searchSuggestions) return;
        
        const suggestions = this.generateSuggestions(query);
        
        if (suggestions.length > 0) {
            this.searchSuggestions.innerHTML = suggestions.map(suggestion => 
                `<div class="search-suggestion" data-value="${suggestion.value}">
                    <span class="suggestion-icon">${this.getSuggestionIcon(suggestion.type)}</span>
                    <span class="suggestion-text">${suggestion.text}</span>
                    <span class="suggestion-type">${suggestion.type}</span>
                </div>`
            ).join('');
            
            // Add click listeners to suggestions
            this.searchSuggestions.querySelectorAll('.search-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    const value = suggestion.getAttribute('data-value');
                    this.searchInput.value = value;
                    this.performSearch(value);
                });
            });
            
            this.searchSuggestions.classList.add('show');
        } else {
            this.hideSearchSuggestions();
        }
    }
    
    generateSuggestions(query) {
        const suggestions = [];
        
        // Add search history suggestions
        if (query === '') {
            this.searchHistory.slice(0, 3).forEach(historyItem => {
                suggestions.push({
                    value: historyItem,
                    text: historyItem,
                    type: 'history'
                });
            });
        }
        
        // Add matching course suggestions
        if (query.length >= 2) {
            const matches = this.search(query).slice(0, 5);
            matches.forEach(match => {
                suggestions.push({
                    value: match.title,
                    text: match.title,
                    type: match.type
                });
            });
        }
        
        // Add popular searches
        if (query === '') {
            const popularSearches = ['welding', 'electrical', 'plumbing', 'hvac'];
            popularSearches.forEach(search => {
                suggestions.push({
                    value: search,
                    text: search,
                    type: 'popular'
                });
            });
        }
        
        return suggestions;
    }
    
    hideSearchSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.classList.remove('show');
        }
    }
    
    navigateSuggestions(direction, suggestions) {
        if (!suggestions || suggestions.length === 0) return;
        
        const currentActive = document.querySelector('.search-suggestion.active');
        let nextIndex = 0;
        
        if (currentActive) {
            const currentIndex = Array.from(suggestions).indexOf(currentActive);
            currentActive.classList.remove('active');
            
            if (direction === 'down') {
                nextIndex = (currentIndex + 1) % suggestions.length;
            } else {
                nextIndex = currentIndex === 0 ? suggestions.length - 1 : currentIndex - 1;
            }
        }
        
        suggestions[nextIndex].classList.add('active');
        this.searchInput.value = suggestions[nextIndex].getAttribute('data-value');
    }
    
    // Display Methods
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No results found for "${query}"</h3>
                    <p>Try adjusting your search terms or filters</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="results-header">
                    <h3>Search Results for "${query}" (${results.length})</h3>
                </div>
                <div class="results-grid">
                    ${results.map(result => this.createResultCard(result)).join('')}
                </div>
            `;
        }
        
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    displayLiveSearchResults(results, query) {
        // Update results without scrolling
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            this.displaySearchResults(results, query);
        }
    }
    
    displayFilteredResults() {
        // Show all items that match current filters
        const allItems = Array.from(this.searchIndex.values());
        const filteredItems = this.applyFilters(allItems);
        this.displaySearchResults(filteredItems, 'filtered results');
    }
    
    createResultCard(result) {
        return `
            <div class="result-card ${result.type}" data-id="${result.id}">
                <div class="result-icon">${this.getSuggestionIcon(result.type)}</div>
                <div class="result-content">
                    <h4 class="result-title">${result.title}</h4>
                    <p class="result-type">${result.type}</p>
                    <div class="result-score">Relevance: ${result.score}</div>
                </div>
            </div>
        `;
    }
    
    // Utility Methods
    getSuggestionIcon(type) {
        const icons = {
            course: '📚',
            trainer: '👨‍🏫',
            history: '🕒',
            popular: '🔥'
        };
        return icons[type] || '📄';
    }
    
    parseDuration(duration) {
        const match = duration.match(/(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)/i);
        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            return unit.startsWith('hour') ? value : value / 60;
        }
        return 0;
    }
    
    parsePrice(price) {
        const match = price.match(/\$(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }
    
    matchesDurationFilter(duration, filter) {
        switch (filter) {
            case 'short': return duration < 2;
            case 'medium': return duration >= 2 && duration <= 5;
            case 'long': return duration > 5;
            default: return true;
        }
    }
    
    matchesPriceFilter(price, filter) {
        switch (filter) {
            case 'free': return price === 0;
            case 'low': return price > 0 && price <= 50;
            case 'medium': return price > 50 && price <= 100;
            case 'high': return price > 100;
            default: return true;
        }
    }
    
    // Search History
    addToSearchHistory(query) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        
        // Remove if already exists
        const index = this.searchHistory.indexOf(trimmedQuery);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
        }
        
        // Add to beginning
        this.searchHistory.unshift(trimmedQuery);
        
        // Limit history size
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        
        // Save to localStorage
        this.saveSearchHistory();
    }
    
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('tvet-search-history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load search history:', error);
            return [];
        }
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem('tvet-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }
    
    // URL Management
    updateURL(params) {
        const url = new URL(window.location);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all') {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        window.history.replaceState({}, '', url);
    }
    
    // Filter Population Methods
    populateTradeFilter(filterElement) {
        const trades = ['all', 'welding', 'electrical', 'plumbing', 'hvac', 'carpentry', 'automotive'];
        filterElement.innerHTML = trades.map(trade => 
            `<option value="${trade}">${trade === 'all' ? 'All Trades' : trade.charAt(0).toUpperCase() + trade.slice(1)}</option>`
        ).join('');
    }
    
    populateLevelFilter(filterElement) {
        const levels = ['all', 'beginner', 'intermediate', 'advanced'];
        filterElement.innerHTML = levels.map(level => 
            `<option value="${level}">${level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}</option>`
        ).join('');
    }
    
    populateDurationFilter(filterElement) {
        const durations = [
            { value: 'all', label: 'Any Duration' },
            { value: 'short', label: 'Short (< 2 hours)' },
            { value: 'medium', label: 'Medium (2-5 hours)' },
            { value: 'long', label: 'Long (> 5 hours)' }
        ];
        filterElement.innerHTML = durations.map(duration => 
            `<option value="${duration.value}">${duration.label}</option>`
        ).join('');
    }
    
    populateRatingFilter(filterElement) {
        const ratings = [
            { value: 'all', label: 'Any Rating' },
            { value: '4.5', label: '4.5+ Stars' },
            { value: '4.0', label: '4.0+ Stars' },
            { value: '3.5', label: '3.5+ Stars' }
        ];
        filterElement.innerHTML = ratings.map(rating => 
            `<option value="${rating.value}">${rating.label}</option>`
        ).join('');
    }
    
    setupPriceRangeFilter(filterElement) {
        // Setup price range slider or select
        const priceOptions = [
            { value: 'all', label: 'Any Price' },
            { value: 'free', label: 'Free' },
            { value: 'low', label: '$1 - $50' },
            { value: 'medium', label: '$51 - $100' },
            { value: 'high', label: '$100+' }
        ];
        filterElement.innerHTML = priceOptions.map(option => 
            `<option value="${option.value}">${option.label}</option>`
        ).join('');
    }

    // Public API Methods
    focusSearchInput() {
        if (this.searchInput) {
            this.searchInput.focus();
            this.searchInput.select();
        }
    }
    
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.contentEditable === 'true'
        );
    }
    
    clearSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }
    
    getActiveFilters() {
        return Object.entries(this.filters)
            .filter(([key, value]) => value !== 'all')
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    }
    
    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.handleFilterChange();
    }
}

