// Quiz Engine Module

export class QuizEngine {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = null;
        this.timeLimit = null;
        this.timer = null;
        this.quizContainer = document.getElementById('quiz-container');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for quiz start events
        document.addEventListener('tvet:quiz:start', (e) => {
            this.startQuiz(e.detail.quizType, e.detail.options);
        });
        
        // Listen for answer selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                this.handleAnswerSelection(e);
            }
        });
        
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-next')) {
                this.nextQuestion();
            } else if (e.target.classList.contains('quiz-prev')) {
                this.previousQuestion();
            } else if (e.target.classList.contains('quiz-submit')) {
                this.submitQuiz();
            } else if (e.target.classList.contains('quiz-restart')) {
                this.restartQuiz();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.currentQuiz) {
                this.handleKeyboardNavigation(e);
            }
        });
        
        // Prevent page refresh during quiz
        window.addEventListener('beforeunload', (e) => {
            if (this.currentQuiz && !this.isQuizCompleted()) {
                e.preventDefault();
                e.returnValue = 'You have an active quiz. Are you sure you want to leave?';
            }
        });
    }
    
    async startQuiz(quizType, options = {}) {
        try {
            // Load quiz data
            this.currentQuiz = await this.loadQuizData(quizType);
            
            if (!this.currentQuiz) {
                throw new Error(`Quiz data not found for type: ${quizType}`);
            }
            
            // Initialize quiz state
            this.currentQuestionIndex = 0;
            this.answers = new Array(this.currentQuiz.questions.length).fill(null);
            this.startTime = new Date();
            this.timeLimit = options.timeLimit || this.currentQuiz.timeLimit;
            
            // Setup quiz container
            this.setupQuizContainer();
            
            // Start timer if time limit is set
            if (this.timeLimit) {
                this.startTimer();
            }
            
            // Display first question
            this.displayQuestion(0);
            
            // Show quiz modal/container
            this.showQuizInterface();
            
            // Dispatch quiz started event
            document.dispatchEvent(new CustomEvent('tvet:quiz:started', {
                detail: { 
                    quizType, 
                    questionCount: this.currentQuiz.questions.length,
                    timeLimit: this.timeLimit
                }
            }));
            
        } catch (error) {
            console.error('Failed to start quiz:', error);
            this.showError('Failed to load quiz. Please try again.');
        }
    }
    
    async loadQuizData(quizType) {
        // In a real application, this would load from an API or import the appropriate quiz module
        const quizModules = {
            'welding': () => import('../quizzes/welding-assessments.js'),
            'electrical': () => import('../quizzes/electrical-assessments.js'),
            'plumbing': () => import('../quizzes/plumbing-assessments.js'),
            'hvac': () => import('../quizzes/hvac-assessments.js'),
            'automotive': () => import('../quizzes/automotive-assessments.js')
        };
        
        try {
            if (quizModules[quizType]) {
                const module = await quizModules[quizType]();
                return module.getQuizData();
            } else {
                // Fallback to sample quiz data
                return this.getSampleQuizData(quizType);
            }
        } catch (error) {
            console.error(`Failed to load quiz module for ${quizType}:`, error);
            return this.getSampleQuizData(quizType);
        }
    }
    
    getSampleQuizData(quizType) {
        // Sample quiz data for demonstration
        return {
            id: `${quizType}-assessment`,
            title: `${quizType.charAt(0).toUpperCase() + quizType.slice(1)} Assessment`,
            description: `Test your knowledge of ${quizType} fundamentals`,
            timeLimit: 1800, // 30 minutes in seconds
            passingScore: 70,
            questions: [
                {
                    id: 1,
                    type: 'multiple-choice',
                    question: `What is the most important safety consideration in ${quizType}?`,
                    options: [
                        'Proper equipment maintenance',
                        'Personal protective equipment (PPE)',
                        'Following safety protocols',
                        'All of the above'
                    ],
                    correctAnswer: 3,
                    explanation: 'All safety considerations are equally important and work together to ensure a safe working environment.',
                    points: 10
                },
                {
                    id: 2,
                    type: 'multiple-choice',
                    question: `Which tool is essential for ${quizType} work?`,
                    options: [
                        'Hammer',
                        'Screwdriver',
                        'Specialized equipment',
                        'Measuring tape'
                    ],
                    correctAnswer: 2,
                    explanation: 'Specialized equipment is designed specifically for the trade and ensures proper results.',
                    points: 10
                },
                {
                    id: 3,
                    type: 'true-false',
                    question: `${quizType.charAt(0).toUpperCase() + quizType.slice(1)} work requires proper training and certification.`,
                    correctAnswer: true,
                    explanation: 'Proper training and certification ensure safety and quality workmanship.',
                    points: 10
                }
            ]
        };
    }
    
    setupQuizContainer() {
        if (!this.quizContainer) {
            // Create quiz container if it doesn't exist
            this.quizContainer = document.createElement('div');
            this.quizContainer.id = 'quiz-container';
            this.quizContainer.className = 'quiz-modal';
            document.body.appendChild(this.quizContainer);
        }
        
        this.quizContainer.innerHTML = `
            <div class="quiz-modal-content">
                <div class="quiz-header">
                    <h2 class="quiz-title">${this.currentQuiz.title}</h2>
                    <div class="quiz-info">
                        <span class="quiz-progress">Question <span id="current-question">1</span> of <span id="total-questions">${this.currentQuiz.questions.length}</span></span>
                        ${this.timeLimit ? '<span class="quiz-timer" id="quiz-timer">30:00</span>' : ''}
                    </div>
                    <button class="quiz-close" id="quiz-close">&times;</button>
                </div>
                
                <div class="quiz-body">
                    <div class="quiz-question-container" id="quiz-question-container">
                        <!-- Question content will be inserted here -->
                    </div>
                </div>
                
                <div class="quiz-footer">
                    <div class="quiz-navigation">
                        <button class="btn btn-secondary quiz-prev" id="quiz-prev" disabled>Previous</button>
                        <button class="btn btn-primary quiz-next" id="quiz-next">Next</button>
                        <button class="btn btn-primary quiz-submit" id="quiz-submit" style="display: none;">Submit Quiz</button>
                    </div>
                    
                    <div class="quiz-progress-bar">
                        <div class="progress-bar">
                            <div class="progress-fill" id="quiz-progress-fill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add close functionality
        const closeBtn = this.quizContainer.querySelector('#quiz-close');
        closeBtn.addEventListener('click', () => {
            this.confirmQuizExit();
        });
    }
    
    displayQuestion(index) {
        const question = this.currentQuiz.questions[index];
        const container = document.getElementById('quiz-question-container');
        
        if (!question || !container) return;
        
        let questionHTML = `
            <div class="quiz-question">
                <h3 class="question-text">${question.question}</h3>
                <div class="question-options">
        `;
        
        if (question.type === 'multiple-choice') {
            question.options.forEach((option, optionIndex) => {
                const isSelected = this.answers[index] === optionIndex;
                questionHTML += `
                    <label class="quiz-option-label">
                        <input type="radio" 
                               name="question-${question.id}" 
                               value="${optionIndex}" 
                               class="quiz-option"
                               data-question-index="${index}"
                               ${isSelected ? 'checked' : ''}>
                        <span class="option-text">${option}</span>
                    </label>
                `;
            });
        } else if (question.type === 'true-false') {
            const trueSelected = this.answers[index] === true;
            const falseSelected = this.answers[index] === false;
            
            questionHTML += `
                <label class="quiz-option-label">
                    <input type="radio" 
                           name="question-${question.id}" 
                           value="true" 
                           class="quiz-option"
                           data-question-index="${index}"
                           ${trueSelected ? 'checked' : ''}>
                    <span class="option-text">True</span>
                </label>
                <label class="quiz-option-label">
                    <input type="radio" 
                           name="question-${question.id}" 
                           value="false" 
                           class="quiz-option"
                           data-question-index="${index}"
                           ${falseSelected ? 'checked' : ''}>
                    <span class="option-text">False</span>
                </label>
            `;
        }
        
        questionHTML += `
                </div>
            </div>
        `;
        
        container.innerHTML = questionHTML;
        
        // Update progress
        this.updateQuizProgress();
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }
    
    handleAnswerSelection(e) {
        const questionIndex = parseInt(e.target.getAttribute('data-question-index'));
        let answer;
        
        if (e.target.value === 'true') {
            answer = true;
        } else if (e.target.value === 'false') {
            answer = false;
        } else {
            answer = parseInt(e.target.value);
        }
        
        this.answers[questionIndex] = answer;
        
        // Auto-advance to next question (optional)
        if (this.currentQuiz.autoAdvance && questionIndex === this.currentQuestionIndex) {
            setTimeout(() => {
                this.nextQuestion();
            }, 500);
        }
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion(this.currentQuestionIndex);
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion(this.currentQuestionIndex);
        }
    }
    
    updateQuizProgress() {
        // Update question counter
        const currentQuestionSpan = document.getElementById('current-question');
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
        }
        
        // Update progress bar
        const progressFill = document.getElementById('quiz-progress-fill');
        if (progressFill) {
            const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('quiz-prev');
        const nextBtn = document.getElementById('quiz-next');
        const submitBtn = document.getElementById('quiz-submit');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
        
        if (nextBtn && submitBtn) {
            if (isLastQuestion) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'inline-block';
                submitBtn.style.display = 'none';
            }
        }
    }
    
    startTimer() {
        if (!this.timeLimit) return;
        
        let remainingTime = this.timeLimit;
        const timerElement = document.getElementById('quiz-timer');
        
        this.timer = setInterval(() => {
            remainingTime--;
            
            if (timerElement) {
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Warning when 5 minutes left
                if (remainingTime === 300) {
                    timerElement.classList.add('timer-warning');
                    this.showTimerWarning('5 minutes remaining!');
                }
                
                // Critical warning when 1 minute left
                if (remainingTime === 60) {
                    timerElement.classList.add('timer-critical');
                    this.showTimerWarning('1 minute remaining!');
                }
            }
            
            if (remainingTime <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    timeUp() {
        clearInterval(this.timer);
        this.showTimerWarning('Time is up! Submitting quiz automatically.');
        setTimeout(() => {
            this.submitQuiz(true);
        }, 2000);
    }
    
    showTimerWarning(message) {
        document.dispatchEvent(new CustomEvent('tvet:notify', {
            detail: {
                message,
                type: 'warning',
                duration: 3000
            }
        }));
    }
    
    submitQuiz(timeUp = false) {
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Calculate results
        const results = this.calculateResults();
        
        // Record completion time
        const completionTime = new Date() - this.startTime;
        results.completionTime = completionTime;
        results.timeUp = timeUp;
        
        // Save results
        this.saveQuizResults(results);
        
        // Display results
        this.displayResults(results);
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('tvet:quiz:completed', {
            detail: {
                quizId: this.currentQuiz.id,
                score: results.score,
                passed: results.passed,
                completionTime,
                timeUp
            }
        }));
    }
    
    calculateResults() {
        let correctAnswers = 0;
        let totalPoints = 0;
        let earnedPoints = 0;
        const questionResults = [];
        
        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const isCorrect = this.isAnswerCorrect(question, userAnswer);
            
            totalPoints += question.points || 10;
            
            if (isCorrect) {
                correctAnswers++;
                earnedPoints += question.points || 10;
            }
            
            questionResults.push({
                questionId: question.id,
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation,
                points: isCorrect ? (question.points || 10) : 0
            });
        });
        
        const score = Math.round((earnedPoints / totalPoints) * 100);
        const passed = score >= (this.currentQuiz.passingScore || 70);
        
        return {
            score,
            passed,
            correctAnswers,
            totalQuestions: this.currentQuiz.questions.length,
            earnedPoints,
            totalPoints,
            questionResults
        };
    }
    
    isAnswerCorrect(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined) {
            return false;
        }
        
        if (question.type === 'true-false') {
            return userAnswer === question.correctAnswer;
        } else if (question.type === 'multiple-choice') {
            return userAnswer === question.correctAnswer;
        }
        
        return false;
    }
    
    displayResults(results) {
        const container = this.quizContainer.querySelector('.quiz-modal-content');
        
        container.innerHTML = `
            <div class="quiz-results">
                <div class="results-header">
                    <h2>Quiz Results</h2>
                    <div class="score-display ${results.passed ? 'passed' : 'failed'}">
                        <div class="score-circle">
                            <span class="score-percentage">${results.score}%</span>
                        </div>
                        <div class="score-status">
                            <h3>${results.passed ? 'Passed!' : 'Failed'}</h3>
                            <p>${results.correctAnswers} out of ${results.totalQuestions} correct</p>
                        </div>
                    </div>
                </div>
                
                <div class="results-details">
                    <div class="result-stats">
                        <div class="stat">
                            <span class="stat-label">Score</span>
                            <span class="stat-value">${results.score}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time Taken</span>
                            <span class="stat-value">${this.formatTime(results.completionTime)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Passing Score</span>
                            <span class="stat-value">${this.currentQuiz.passingScore || 70}%</span>
                        </div>
                    </div>
                    
                    <div class="question-review">
                        <h4>Question Review</h4>
                        ${results.questionResults.map((result, index) => `
                            <div class="question-result ${result.isCorrect ? 'correct' : 'incorrect'}">
                                <div class="question-header">
                                    <span class="question-number">Q${index + 1}</span>
                                    <span class="question-status">${result.isCorrect ? '✓' : '✗'}</span>
                                </div>
                                <div class="question-content">
                                    <p class="question-text">${result.question}</p>
                                    ${result.explanation ? `<p class="explanation">${result.explanation}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary quiz-restart">Retake Quiz</button>
                    <button class="btn btn-secondary quiz-close">Close</button>
                </div>
            </div>
        `;
        
        // Add event listeners for action buttons
        const restartBtn = container.querySelector('.quiz-restart');
        const closeBtn = container.querySelector('.quiz-close');
        
        restartBtn?.addEventListener('click', () => {
            this.restartQuiz();
        });
        
        closeBtn?.addEventListener('click', () => {
            this.closeQuiz();
        });
    }
    
    restartQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.answers = new Array(this.currentQuiz.questions.length).fill(null);
        this.startTime = new Date();
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Restart timer if needed
        if (this.timeLimit) {
            this.startTimer();
        }
        
        // Reset quiz container
        this.setupQuizContainer();
        this.displayQuestion(0);
    }
    
    saveQuizResults(results) {
        try {
            const quizHistory = JSON.parse(localStorage.getItem('tvet-quiz-history') || '[]');
            
            const quizResult = {
                quizId: this.currentQuiz.id,
                quizTitle: this.currentQuiz.title,
                date: new Date().toISOString(),
                ...results
            };
            
            quizHistory.unshift(quizResult);
            
            // Keep only last 50 results
            if (quizHistory.length > 50) {
                quizHistory.splice(50);
            }
            
            localStorage.setItem('tvet-quiz-history', JSON.stringify(quizHistory));
        } catch (error) {
            console.error('Failed to save quiz results:', error);
        }
    }
    
    // UI Methods
    showQuizInterface() {
        if (this.quizContainer) {
            this.quizContainer.classList.add('active');
            document.body.classList.add('quiz-active');
        }
    }
    
    closeQuiz() {
        if (this.quizContainer) {
            this.quizContainer.classList.remove('active');
            document.body.classList.remove('quiz-active');
        }
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Reset state
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.answers = [];
    }
    
    confirmQuizExit() {
        if (this.isQuizCompleted()) {
            this.closeQuiz();
            return;
        }
        
        const confirmed = confirm('Are you sure you want to exit the quiz? Your progress will be lost.');
        if (confirmed) {
            this.closeQuiz();
        }
    }
    
    showError(message) {
        document.dispatchEvent(new CustomEvent('tvet:notify', {
            detail: {
                message,
                type: 'error',
                duration: 5000
            }
        }));
    }
    
    // Utility Methods
    isQuizCompleted() {
        return this.quizContainer?.querySelector('.quiz-results') !== null;
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }
    
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowLeft':
                if (this.currentQuestionIndex > 0) {
                    this.previousQuestion();
                }
                break;
                
            case 'ArrowRight':
                if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
                    this.nextQuestion();
                }
                break;
                
            case 'Enter':
                if (this.currentQuestionIndex === this.currentQuiz.questions.length - 1) {
                    this.submitQuiz();
                } else {
                    this.nextQuestion();
                }
                break;
                
            case 'Escape':
                this.confirmQuizExit();
                break;
        }
    }
    
    // Public API Methods
    getQuizHistory() {
        try {
            return JSON.parse(localStorage.getItem('tvet-quiz-history') || '[]');
        } catch (error) {
            console.error('Failed to load quiz history:', error);
            return [];
        }
    }
    
    clearQuizHistory() {
        localStorage.removeItem('tvet-quiz-history');
    }
    
    getCurrentQuiz() {
        return this.currentQuiz;
    }
    
    isQuizActive() {
        return this.currentQuiz !== null && !this.isQuizCompleted();
    }
}

