// Progress Tracker Module

export class ProgressTracker {
    constructor() {
        this.storageKey = 'tvet-progress';
        this.progress = this.loadProgress();
        this.achievements = this.loadAchievements();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeProgressBars();
    }
    
    setupEventListeners() {
        // Listen for course completion events
        document.addEventListener('tvet:course:completed', (e) => {
            this.markCourseCompleted(e.detail.courseId, e.detail.score);
        });
        
        // Listen for lesson completion events
        document.addEventListener('tvet:lesson:completed', (e) => {
            this.markLessonCompleted(e.detail.courseId, e.detail.lessonId);
        });
        
        // Listen for quiz completion events
        document.addEventListener('tvet:quiz:completed', (e) => {
            this.recordQuizScore(e.detail.quizId, e.detail.score, e.detail.attempts);
        });
        
        // Listen for skill progress events
        document.addEventListener('tvet:skill:progress', (e) => {
            this.updateSkillProgress(e.detail.skill, e.detail.points);
        });
    }
    
    initializeProgressBars() {
        // Initialize progress bars on page load
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const courseId = bar.getAttribute('data-course-id');
            const progress = this.getCourseProgress(courseId);
            this.updateProgressBar(bar, progress);
        });
    }
    
    // Course Progress Methods
    markCourseCompleted(courseId, score = null) {
        if (!this.progress.courses[courseId]) {
            this.progress.courses[courseId] = {
                started: new Date().toISOString(),
                completed: null,
                progress: 0,
                lessons: {},
                quizzes: {},
                timeSpent: 0,
                lastAccessed: new Date().toISOString()
            };
        }
        
        this.progress.courses[courseId].completed = new Date().toISOString();
        this.progress.courses[courseId].progress = 100;
        this.progress.courses[courseId].lastAccessed = new Date().toISOString();
        
        if (score !== null) {
            this.progress.courses[courseId].finalScore = score;
        }
        
        // Update overall stats
        this.updateOverallStats();
        
        // Check for achievements
        this.checkAchievements();
        
        // Save progress
        this.saveProgress();
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('tvet:progress:course-completed', {
            detail: { courseId, score }
        }));
        
        // Show completion notification
        this.showCompletionNotification(courseId);
    }
    
    markLessonCompleted(courseId, lessonId) {
        if (!this.progress.courses[courseId]) {
            this.startCourse(courseId);
        }
        
        this.progress.courses[courseId].lessons[lessonId] = {
            completed: new Date().toISOString(),
            timeSpent: 0
        };
        
        this.progress.courses[courseId].lastAccessed = new Date().toISOString();
        
        // Update course progress
        this.updateCourseProgress(courseId);
        
        // Save progress
        this.saveProgress();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('tvet:progress:lesson-completed', {
            detail: { courseId, lessonId }
        }));
    }
    
    startCourse(courseId) {
        if (!this.progress.courses[courseId]) {
            this.progress.courses[courseId] = {
                started: new Date().toISOString(),
                completed: null,
                progress: 0,
                lessons: {},
                quizzes: {},
                timeSpent: 0,
                lastAccessed: new Date().toISOString()
            };
            
            this.saveProgress();
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('tvet:progress:course-started', {
                detail: { courseId }
            }));
        }
    }
    
    updateCourseProgress(courseId) {
        const courseData = this.progress.courses[courseId];
        if (!courseData) return;
        
        // Calculate progress based on completed lessons
        // This would need to be integrated with actual course structure
        const totalLessons = this.getTotalLessons(courseId);
        const completedLessons = Object.keys(courseData.lessons).length;
        
        if (totalLessons > 0) {
            courseData.progress = Math.round((completedLessons / totalLessons) * 100);
        }
        
        // Update progress bars on page
        this.updateProgressBarsForCourse(courseId);
    }
    
    // Quiz Progress Methods
    recordQuizScore(quizId, score, attempts = 1) {
        if (!this.progress.quizzes[quizId]) {
            this.progress.quizzes[quizId] = {
                attempts: [],
                bestScore: 0,
                totalAttempts: 0,
                firstAttempt: new Date().toISOString(),
                lastAttempt: null
            };
        }
        
        const quizData = this.progress.quizzes[quizId];
        quizData.attempts.push({
            score,
            date: new Date().toISOString(),
            timeSpent: 0
        });
        
        quizData.totalAttempts += 1;
        quizData.lastAttempt = new Date().toISOString();
        quizData.bestScore = Math.max(quizData.bestScore, score);
        
        // Update skill progress based on quiz performance
        this.updateSkillsFromQuiz(quizId, score);
        
        // Save progress
        this.saveProgress();
        
        // Check for achievements
        this.checkAchievements();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('tvet:progress:quiz-completed', {
            detail: { quizId, score, attempts: quizData.totalAttempts }
        }));
    }
    
    // Skill Progress Methods
    updateSkillProgress(skill, points) {
        if (!this.progress.skills[skill]) {
            this.progress.skills[skill] = {
                points: 0,
                level: 1,
                experience: 0,
                lastUpdated: new Date().toISOString()
            };
        }
        
        const skillData = this.progress.skills[skill];
        skillData.points += points;
        skillData.experience += points;
        skillData.lastUpdated = new Date().toISOString();
        
        // Calculate level based on experience
        const newLevel = this.calculateSkillLevel(skillData.experience);
        if (newLevel > skillData.level) {
            skillData.level = newLevel;
            this.showLevelUpNotification(skill, newLevel);
        }
        
        // Save progress
        this.saveProgress();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('tvet:progress:skill-updated', {
            detail: { skill, points, level: skillData.level }
        }));
    }
    
    calculateSkillLevel(experience) {
        // Simple level calculation - can be made more sophisticated
        if (experience < 100) return 1;
        if (experience < 300) return 2;
        if (experience < 600) return 3;
        if (experience < 1000) return 4;
        return 5;
    }
    
    // Achievement System
    checkAchievements() {
        const newAchievements = [];
        
        // Course completion achievements
        const completedCourses = this.getCompletedCoursesCount();
        if (completedCourses >= 1 && !this.achievements.includes('first-course')) {
            newAchievements.push('first-course');
        }
        if (completedCourses >= 5 && !this.achievements.includes('five-courses')) {
            newAchievements.push('five-courses');
        }
        if (completedCourses >= 10 && !this.achievements.includes('ten-courses')) {
            newAchievements.push('ten-courses');
        }
        
        // Quiz performance achievements
        const perfectQuizzes = this.getPerfectQuizCount();
        if (perfectQuizzes >= 1 && !this.achievements.includes('perfect-quiz')) {
            newAchievements.push('perfect-quiz');
        }
        if (perfectQuizzes >= 5 && !this.achievements.includes('quiz-master')) {
            newAchievements.push('quiz-master');
        }
        
        // Skill level achievements
        const maxSkillLevel = this.getMaxSkillLevel();
        if (maxSkillLevel >= 3 && !this.achievements.includes('skill-expert')) {
            newAchievements.push('skill-expert');
        }
        if (maxSkillLevel >= 5 && !this.achievements.includes('skill-master')) {
            newAchievements.push('skill-master');
        }
        
        // Add new achievements
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement);
            this.showAchievementNotification(achievement);
        });
        
        if (newAchievements.length > 0) {
            this.saveAchievements();
        }
    }
    
    // Data Access Methods
    getCourseProgress(courseId) {
        return this.progress.courses[courseId]?.progress || 0;
    }
    
    isCourseCompleted(courseId) {
        return this.progress.courses[courseId]?.completed !== null;
    }
    
    getQuizBestScore(quizId) {
        return this.progress.quizzes[quizId]?.bestScore || 0;
    }
    
    getSkillLevel(skill) {
        return this.progress.skills[skill]?.level || 1;
    }
    
    getSkillPoints(skill) {
        return this.progress.skills[skill]?.points || 0;
    }
    
    getCompletedCoursesCount() {
        return Object.values(this.progress.courses).filter(course => course.completed).length;
    }
    
    getPerfectQuizCount() {
        return Object.values(this.progress.quizzes).filter(quiz => quiz.bestScore === 100).length;
    }
    
    getMaxSkillLevel() {
        const skillLevels = Object.values(this.progress.skills).map(skill => skill.level);
        return skillLevels.length > 0 ? Math.max(...skillLevels) : 0;
    }
    
    getTotalTimeSpent() {
        return Object.values(this.progress.courses).reduce((total, course) => total + course.timeSpent, 0);
    }
    
    getOverallProgress() {
        const totalCourses = Object.keys(this.progress.courses).length;
        const completedCourses = this.getCompletedCoursesCount();
        return totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
    }
    
    // UI Update Methods
    updateProgressBar(progressBar, percentage) {
        const fill = progressBar.querySelector('.progress-fill');
        if (fill) {
            fill.style.width = `${percentage}%`;
            fill.setAttribute('aria-valuenow', percentage);
        }
        
        const text = progressBar.querySelector('.progress-text');
        if (text) {
            text.textContent = `${percentage}%`;
        }
    }
    
    updateProgressBarsForCourse(courseId) {
        const progressBars = document.querySelectorAll(`[data-course-id="${courseId}"] .progress-bar`);
        const progress = this.getCourseProgress(courseId);
        
        progressBars.forEach(bar => {
            this.updateProgressBar(bar, progress);
        });
    }
    
    // Notification Methods
    showCompletionNotification(courseId) {
        // This would integrate with the notification system
        document.dispatchEvent(new CustomEvent('tvet:notify', {
            detail: {
                message: `Congratulations! You've completed the course.`,
                type: 'success',
                duration: 5000
            }
        }));
    }
    
    showLevelUpNotification(skill, level) {
        document.dispatchEvent(new CustomEvent('tvet:notify', {
            detail: {
                message: `🎉 Level up! You've reached level ${level} in ${skill}!`,
                type: 'success',
                duration: 5000
            }
        }));
    }
    
    showAchievementNotification(achievement) {
        const achievementData = this.getAchievementData(achievement);
        document.dispatchEvent(new CustomEvent('tvet:notify', {
            detail: {
                message: `🏆 Achievement Unlocked: ${achievementData.title}!`,
                type: 'success',
                duration: 7000
            }
        }));
    }
    
    // Storage Methods
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
        
        return {
            courses: {},
            quizzes: {},
            skills: {},
            stats: {
                totalTimeSpent: 0,
                coursesStarted: 0,
                coursesCompleted: 0,
                quizzesTaken: 0,
                achievementsUnlocked: 0
            }
        };
    }
    
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
    
    loadAchievements() {
        try {
            const stored = localStorage.getItem('tvet-achievements');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
        
        return [];
    }
    
    saveAchievements() {
        try {
            localStorage.setItem('tvet-achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }
    
    // Utility Methods
    updateOverallStats() {
        this.progress.stats.coursesCompleted = this.getCompletedCoursesCount();
        this.progress.stats.coursesStarted = Object.keys(this.progress.courses).length;
        this.progress.stats.quizzesTaken = Object.keys(this.progress.quizzes).length;
        this.progress.stats.achievementsUnlocked = this.achievements.length;
    }
    
    getTotalLessons(courseId) {
        // This would need to be integrated with actual course data
        // For now, return a default value
        return 10;
    }
    
    updateSkillsFromQuiz(quizId, score) {
        // Map quiz to skills and award points based on performance
        const skillPoints = Math.round(score / 10); // 1 point per 10% score
        
        // This would need to map quizzes to specific skills
        const quizSkillMap = {
            'welding-basics': 'welding',
            'electrical-safety': 'electrical',
            'plumbing-fundamentals': 'plumbing'
        };
        
        const skill = quizSkillMap[quizId];
        if (skill) {
            this.updateSkillProgress(skill, skillPoints);
        }
    }
    
    getAchievementData(achievement) {
        const achievements = {
            'first-course': { title: 'First Steps', description: 'Complete your first course' },
            'five-courses': { title: 'Learning Streak', description: 'Complete 5 courses' },
            'ten-courses': { title: 'Dedicated Learner', description: 'Complete 10 courses' },
            'perfect-quiz': { title: 'Perfect Score', description: 'Get 100% on a quiz' },
            'quiz-master': { title: 'Quiz Master', description: 'Get perfect scores on 5 quizzes' },
            'skill-expert': { title: 'Skill Expert', description: 'Reach level 3 in any skill' },
            'skill-master': { title: 'Skill Master', description: 'Reach level 5 in any skill' }
        };
        
        return achievements[achievement] || { title: 'Unknown Achievement', description: '' };
    }
    
    // Public API Methods
    exportProgress() {
        return {
            progress: this.progress,
            achievements: this.achievements,
            exportDate: new Date().toISOString()
        };
    }
    
    importProgress(data) {
        if (data.progress) {
            this.progress = data.progress;
            this.saveProgress();
        }
        
        if (data.achievements) {
            this.achievements = data.achievements;
            this.saveAchievements();
        }
        
        // Refresh UI
        this.initializeProgressBars();
    }
    
    resetProgress() {
        this.progress = this.loadProgress();
        this.achievements = [];
        this.saveProgress();
        this.saveAchievements();
        
        // Refresh UI
        this.initializeProgressBars();
    }
}

