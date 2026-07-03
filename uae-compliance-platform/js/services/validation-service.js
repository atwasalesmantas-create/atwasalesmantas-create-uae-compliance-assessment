/**
 * Validation Service
 * Provides validation functions for user input
 * 
 * Version: 1.1
 * Purpose: Centralized validation logic
 * 
 * Why this exists:
 * - Consistent validation across the app
 * - Clear error messages
 * - Easy to extend with new rules
 */

const ValidationService = (function() {
    'use strict';
    
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {Object} { valid: boolean, message: string }
     */
    function validateEmail(email) {
        if (!email || email.trim() === '') {
            return { valid: false, message: 'Email is required' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * Validate phone number
     * @param {string} phone - Phone to validate
     * @returns {Object} { valid: boolean, message: string }
     */
    function validatePhone(phone) {
        if (!phone || phone.trim() === '') {
            return { valid: false, message: 'Phone number is required' };
        }
        
        // UAE phone number format: +971 50 1234567 or 050 1234567
        const phoneRegex = /^(?:\+971|0)?[0-9]{9,10}$/;
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleaned)) {
            return { valid: false, message: 'Please enter a valid UAE phone number' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * Validate name
     * @param {string} name - Name to validate
     * @returns {Object} { valid: boolean, message: string }
     */
    function validateName(name) {
        if (!name || name.trim() === '') {
            return { valid: false, message: 'Name is required' };
        }
        
        if (name.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * Validate company name (optional)
     * @param {string} company - Company name
     * @returns {Object} { valid: boolean, message: string }
     */
    function validateCompany(company) {
        if (company && company.trim().length < 2) {
            return { valid: false, message: 'Company name must be at least 2 characters' };
        }
        return { valid: true, message: '' };
    }
    
    /**
     * Validate year
     * @param {string|number} year - Year to validate
     * @returns {Object} { valid: boolean, message: string }
     */
    function validateYear(year) {
        if (!year || year === '') {
            return { valid: false, message: 'Year is required' };
        }
        
        const num = Number(year);
        const currentYear = new Date().getFullYear();
        
        if (isNaN(num)) {
            return { valid: false, message: 'Please enter a valid year' };
        }
        
        if (num < 1970 || num > currentYear) {
            return { valid: false, message: `Year must be between 1970 and ${currentYear}` };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * Validate that a value is selected from options
     * @param {string} value - Selected value
     * @param {Array} options - Available options
     * @returns {Object} { valid: boolean, message: string }
     */
    function validateOptionSelected(value, options) {
        if (!value || value.trim() === '') {
            return { valid: false, message: 'Please select an option' };
        }
        
        if (options && !options.includes(value)) {
            return { valid: false, message: 'Invalid selection' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * Validate all lead capture fields
     * @param {Object} fields - { name, company, email, phone }
     * @returns {Object} { valid: boolean, errors: Object }
     */
    function validateLeadForm(fields) {
        const errors = {};
        let valid = true;
        
        const nameResult = validateName(fields.name);
        if (!nameResult.valid) {
            errors.name = nameResult.message;
            valid = false;
        }
        
        const emailResult = validateEmail(fields.email);
        if (!emailResult.valid) {
            errors.email = emailResult.message;
            valid = false;
        }
        
        const phoneResult = validatePhone(fields.phone);
        if (!phoneResult.valid) {
            errors.phone = phoneResult.message;
            valid = false;
        }
        
        const companyResult = validateCompany(fields.company);
        if (!companyResult.valid) {
            errors.company = companyResult.message;
            valid = false;
        }
        
        return { valid, errors };
    }
    
    /**
     * Check if a step is complete
     * @param {Object} step - Step object
     * @param {Object} state - Current state (answers or company)
     * @returns {boolean} True if complete
     */
    function isStepComplete(step, state) {
        if (step.id === 'company') {
            return step.fields.every(field => {
                return state[field.id] !== undefined && 
                       state[field.id] !== null && 
                       state[field.id] !== '';
            });
        }
        
        return step.questions.every(q => {
            return state[q.id] !== undefined && state[q.id] !== null;
        });
    }
    
    // Public API
    return {
        validateEmail,
        validatePhone,
        validateName,
        validateCompany,
        validateYear,
        validateOptionSelected,
        validateLeadForm,
        isStepComplete
    };
})();