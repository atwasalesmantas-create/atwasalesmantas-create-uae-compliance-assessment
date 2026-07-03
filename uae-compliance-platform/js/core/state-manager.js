/**
 * State Manager
 * Manages application state with proper getters and setters
 * 
 * Version: 1.1
 * Purpose: Centralized state management with validation
 * 
 * Why this exists:
 * - Prevents global variable pollution
 * - Enables state persistence (localStorage)
 * - Makes state changes predictable and trackable
 * - Simplifies testing
 */

const StateManager = (function() {
    'use strict';
    
    // Private state object - not directly accessible
    let state = {
        currentStep: 0,
        answers: {},
        company: {},
        unlocked: false,
        scoreData: null,
        isComplete: false
    };
    
    // Private methods
    
    /**
     * Validates company data before saving
     * @param {Object} data - Company data to validate
     * @returns {Object} Validated company data
     */
    function validateCompanyData(data) {
        const validFields = ['legalForm', 'yearEstablished', 'employees', 'turnover', 'industry'];
        const cleaned = {};
        
        validFields.forEach(field => {
            if (data[field] !== undefined && data[field] !== null) {
                cleaned[field] = data[field];
            }
        });
        
        return cleaned;
    }
    
    /**
     * Validates answer data
     * @param {Object} data - Answers to validate
     * @returns {Object} Validated answers
     */
    function validateAnswers(data) {
        // Only keep answers that have a question ID and a value
        const cleaned = {};
        Object.keys(data).forEach(key => {
            if (data[key] && typeof data[key] === 'object' && data[key].label !== undefined) {
                cleaned[key] = {
                    label: data[key].label,
                    points: data[key].points || 0
                };
            }
        });
        return cleaned;
    }
    
    // Public API
    return {
        /**
         * Get the current step index
         * @returns {number} Current step (0-based)
         */
        getCurrentStep() {
            return state.currentStep;
        },
        
        /**
         * Set the current step
         * @param {number} step - Step index to set
         */
        setCurrentStep(step) {
            if (typeof step === 'number' && step >= 0) {
                state.currentStep = step;
                this.saveToStorage();
            }
        },
        
        /**
         * Get all answers
         * @returns {Object} Copy of answers object
         */
        getAnswers() {
            return { ...state.answers };
        },
        
        /**
         * Get a specific answer
         * @param {string} questionId - ID of the question
         * @returns {Object|null} Answer object or null if not found
         */
        getAnswer(questionId) {
            return state.answers[questionId] || null;
        },
        
        /**
         * Set an answer
         * @param {string} questionId - ID of the question
         * @param {Object} value - Answer object with label and points
         */
        setAnswer(questionId, value) {
            if (questionId && value && typeof value === 'object') {
                state.answers[questionId] = {
                    label: value.label || '',
                    points: value.points || 0
                };
                this.saveToStorage();
            }
        },
        
        /**
         * Get company data
         * @returns {Object} Copy of company data
         */
        getCompany() {
            return { ...state.company };
        },
        
        /**
         * Set company data (merges with existing)
         * @param {Object} data - Company data to set
         */
        setCompany(data) {
            const validated = validateCompanyData(data);
            state.company = { ...state.company, ...validated };
            this.saveToStorage();
        },
        
        /**
         * Check if report is unlocked
         * @returns {boolean} True if unlocked
         */
        isUnlocked() {
            return state.unlocked;
        },
        
        /**
         * Unlock the report
         */
        unlock() {
            state.unlocked = true;
            this.saveToStorage();
        },
        
        /**
         * Get score data
         * @returns {Object|null} Score data or null
         */
        getScoreData() {
            return state.scoreData ? { ...state.scoreData } : null;
        },
        
        /**
         * Set score data
         * @param {Object} data - Score data to set
         */
        setScoreData(data) {
            if (data && typeof data === 'object') {
                state.scoreData = { ...data };
                state.isComplete = true;
                this.saveToStorage();
            }
        },
        
        /**
         * Check if assessment is complete
         * @returns {boolean} True if complete
         */
        isComplete() {
            return state.isComplete;
        },
        
        /**
         * Reset all state
         */
        reset() {
            state = {
                currentStep: 0,
                answers: {},
                company: {},
                unlocked: false,
                scoreData: null,
                isComplete: false
            };
            this.clearStorage();
        },
        
        /**
         * Save state to localStorage
         * (Auto-saves when state changes)
         */
        saveToStorage() {
            try {
                if (APP_CONFIG.features.localStorage) {
                    const serialized = JSON.stringify(state);
                    localStorage.setItem('atwa_assessment_state', serialized);
                }
            } catch (e) {
                // Silently fail - localStorage not available
                console.debug('State save skipped:', e.message);
            }
        },
        
        /**
         * Load state from localStorage
         * @returns {boolean} True if state was loaded
         */
        loadFromStorage() {
            try {
                if (APP_CONFIG.features.localStorage) {
                    const saved = localStorage.getItem('atwa_assessment_state');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        // Validate and merge
                        if (parsed.answers) {
                            state.answers = validateAnswers(parsed.answers);
                        }
                        if (parsed.company) {
                            state.company = validateCompanyData(parsed.company);
                        }
                        if (typeof parsed.currentStep === 'number') {
                            state.currentStep = parsed.currentStep;
                        }
                        if (parsed.unlocked) {
                            state.unlocked = parsed.unlocked;
                        }
                        if (parsed.scoreData) {
                            state.scoreData = parsed.scoreData;
                        }
                        if (parsed.isComplete) {
                            state.isComplete = parsed.isComplete;
                        }
                        return true;
                    }
                }
            } catch (e) {
                console.debug('State load failed:', e.message);
            }
            return false;
        },
        
        /**
         * Clear localStorage state
         */
        clearStorage() {
            try {
                if (APP_CONFIG.features.localStorage) {
                    localStorage.removeItem('atwa_assessment_state');
                }
            } catch (e) {
                // Silently fail
            }
        }
    };
})();