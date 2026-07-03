/**
 * Assessment Data
 * Contains all questions, options, and scoring configuration
 * 
 * Version: 1.1
 * Purpose: Single source of truth for assessment content
 * 
 * Why this exists:
 * - Separates content from logic
 * - Makes updates easier
 * - Enables A/B testing
 * - Supports multiple languages
 */

const AssessmentData = (function() {
    'use strict';
    
    /**
     * Company information step
     * This is not scored - just collects business context
     */
    const companyStep = {
        id: 'company',
        title: 'Tell us about your business',
        eyebrow: 'Step 1 · Company information',
        fields: [
            {
                id: 'legalForm',
                label: 'Is your business Mainland or Free Zone?',
                type: 'options',
                options: ['Mainland', 'Free Zone', 'Offshore']
            },
            {
                id: 'yearEstablished',
                label: 'What year was the business established?',
                type: 'number',
                placeholder: 'e.g. 2019'
            },
            {
                id: 'employees',
                label: 'How many employees do you have?',
                type: 'options',
                options: ['None', '1–5', '6–20', '21–50', '50+']
            },
            {
                id: 'turnover',
                label: 'What is your approximate annual turnover?',
                type: 'options',
                options: ['Under AED 1M', 'AED 1M–3M', 'AED 3M–50M', 'AED 50M+']
            },
            {
                id: 'industry',
                label: 'What industry are you in?',
                type: 'options',
                options: ['Trading', 'Professional Services', 'Retail', 'Construction', 'Real Estate', 'Hospitality', 'Manufacturing', 'Other']
            }
        ]
    };
    
    /**
     * Scored question steps
     * Each question has options with point values
     * Lower points = lower risk / better compliance
     */
    const scoredSteps = [
        {
            id: 'accounting',
            title: 'Accounting',
            eyebrow: 'Step 2 · Accounting',
            description: 'Good accounting practices are the foundation of compliance.',
            questions: [
                {
                    id: 'acc_bookkeeping',
                    text: 'Do you maintain monthly bookkeeping?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'Quarterly', points: 5 },
                        { label: 'No', points: 15 },
                        { label: 'Not sure', points: 20 }
                    ]
                },
                {
                    id: 'acc_reports',
                    text: 'Do you receive monthly financial reports?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'Quarterly', points: 8 },
                        { label: 'Never', points: 15 }
                    ]
                },
                {
                    id: 'acc_prepares',
                    text: 'Who prepares your accounts?',
                    options: [
                        { label: 'Internal accountant', points: 0 },
                        { label: 'Outsourced firm', points: 0 },
                        { label: 'Freelancer', points: 8 },
                        { label: 'Nobody', points: 20 }
                    ]
                }
            ]
        },
        {
            id: 'vat',
            title: 'VAT',
            eyebrow: 'Step 3 · VAT',
            description: 'VAT compliance is critical to avoid FTA penalties.',
            questions: [
                {
                    id: 'vat_registered',
                    text: 'Is your business VAT registered?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No, not required', points: 0 },
                        { label: 'No, but should be', points: 25 },
                        { label: 'Not sure', points: 20 }
                    ]
                },
                {
                    id: 'vat_frequency',
                    text: 'How often do you file VAT returns?',
                    options: [
                        { label: 'Monthly', points: 0 },
                        { label: 'Quarterly', points: 0 },
                        { label: 'Irregularly', points: 15 },
                        { label: 'Not applicable', points: 0 }
                    ]
                },
                {
                    id: 'vat_late',
                    text: 'Have you had any late VAT filings?',
                    options: [
                        { label: 'Never', points: 0 },
                        { label: 'Once or twice', points: 10 },
                        { label: 'Frequently', points: 20 }
                    ]
                },
                {
                    id: 'vat_notice',
                    text: 'Have you ever received an FTA notice?',
                    options: [
                        { label: 'No', points: 0 },
                        { label: 'Yes, resolved', points: 10 },
                        { label: 'Yes, unresolved', points: 25 }
                    ]
                }
            ]
        },
        {
            id: 'corptax',
            title: 'Corporate Tax',
            eyebrow: 'Step 4 · Corporate tax',
            description: 'Corporate Tax registration and filing are now mandatory for most UAE businesses.',
            questions: [
                {
                    id: 'ct_registered',
                    text: 'Is your business registered for Corporate Tax?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 25 },
                        { label: 'Not sure', points: 20 }
                    ]
                },
                {
                    id: 'ct_filed',
                    text: 'If a return is due, has it been filed or is it on track?',
                    options: [
                        { label: 'Yes / on track', points: 0 },
                        { label: 'No', points: 20 },
                        { label: 'Not applicable yet', points: 0 }
                    ]
                },
                {
                    id: 'ct_relief',
                    text: 'Do you know whether you qualify for Small Business Relief?',
                    options: [
                        { label: 'Yes, confirmed', points: 0 },
                        { label: 'No / not sure', points: 12 }
                    ]
                }
            ]
        },
        {
            id: 'payroll',
            title: 'Payroll',
            eyebrow: 'Step 5 · Payroll',
            description: 'WPS compliance ensures your payroll meets MOHRE and Central Bank requirements.',
            questions: [
                {
                    id: 'pay_wps',
                    text: 'Is your payroll WPS compliant?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 20 },
                        { label: 'Not applicable', points: 0 }
                    ]
                },
                {
                    id: 'pay_timely',
                    text: 'Is payroll processed accurately and on time each month?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'Sometimes late', points: 10 },
                        { label: 'No / not applicable process', points: 18 }
                    ]
                }
            ]
        },
        {
            id: 'audit',
            title: 'Audit',
            eyebrow: 'Step 6 · Audit',
            description: 'Some UAE business types require audited financial statements.',
            questions: [
                {
                    id: 'audit_required',
                    text: 'Is an audit required for your license type?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 0 },
                        { label: 'Not sure', points: 8 }
                    ]
                },
                {
                    id: 'audit_last',
                    text: 'When was your last audit completed?',
                    options: [
                        { label: 'Within 12 months', points: 0 },
                        { label: '1–2 years ago', points: 10 },
                        { label: 'Never / overdue', points: 22 }
                    ]
                }
            ]
        },
        {
            id: 'licenses',
            title: 'Licenses & Governance',
            eyebrow: 'Step 7 · Licenses & governance',
            description: 'License renewal and UBO filings are key governance obligations.',
            questions: [
                {
                    id: 'lic_current',
                    text: 'Is your trade license current?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'Expiring soon', points: 8 },
                        { label: 'Expired', points: 25 }
                    ]
                },
                {
                    id: 'lic_ubo',
                    text: 'Is your UBO (Ultimate Beneficial Owner) information up to date?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'Not sure', points: 12 },
                        { label: 'No', points: 20 }
                    ]
                },
                {
                    id: 'lic_tracked',
                    text: 'Are your renewals tracked systematically?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'Somewhat', points: 6 },
                        { label: 'No', points: 14 }
                    ]
                }
            ]
        },
        {
            id: 'value',
            title: 'Business Value',
            eyebrow: 'Step 8 · Running the business',
            description: 'Proactive financial management supports better compliance and growth.',
            questions: [
                {
                    id: 'val_profit',
                    text: 'Do you review profit monthly?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 10 }
                    ]
                },
                {
                    id: 'val_mgmt',
                    text: 'Do you receive management reports?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 10 }
                    ]
                },
                {
                    id: 'val_payroll_cost',
                    text: 'Do you track payroll costs?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 8 }
                    ]
                },
                {
                    id: 'val_taxfc',
                    text: 'Do you forecast tax liabilities?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 8 }
                    ]
                },
                {
                    id: 'val_cashflow',
                    text: 'Do you maintain a cash-flow forecast?',
                    options: [
                        { label: 'Yes', points: 0 },
                        { label: 'No', points: 10 }
                    ]
                }
            ]
        }
    ];
    
    // All steps combined
    const allSteps = [companyStep, ...scoredSteps];
    
    // Public API
    return {
        /**
         * Get all assessment steps
         * @returns {Array} Array of step objects
         */
        getAllSteps() {
            return allSteps;
        },
        
        /**
         * Get the company step
         * @returns {Object} Company step object
         */
        getCompanyStep() {
            return companyStep;
        },
        
        /**
         * Get scored steps (all except company)
         * @returns {Array} Array of scored step objects
         */
        getScoredSteps() {
            return scoredSteps;
        },
        
        /**
         * Get a specific step by ID
         * @param {string} id - Step ID
         * @returns {Object|null} Step object or null
         */
        getStepById(id) {
            return allSteps.find(step => step.id === id) || null;
        },
        
        /**
         * Get all questions from scored steps
         * @returns {Array} Array of question objects
         */
        getAllQuestions() {
            const questions = [];
            scoredSteps.forEach(step => {
                step.questions.forEach(q => {
                    questions.push({
                        ...q,
                        category: step.id,
                        categoryTitle: step.title
                    });
                });
            });
            return questions;
        },
        
        /**
         * Get a question by ID
         * @param {string} id - Question ID
         * @returns {Object|null} Question object or null
         */
        getQuestionById(id) {
            for (const step of scoredSteps) {
                for (const q of step.questions) {
                    if (q.id === id) {
                        return { ...q, category: step.id };
                    }
                }
            }
            return null;
        },
        
        /**
         * Get the category for a question ID
         * @param {string} questionId - Question ID
         * @returns {string|null} Category ID or null
         */
        getCategoryForQuestion(questionId) {
            for (const step of scoredSteps) {
                if (step.questions.some(q => q.id === questionId)) {
                    return step.id;
                }
            }
            return null;
        },
        
        /**
         * Get maximum points for a question
         * @param {Object} question - Question object
         * @returns {number} Maximum points
         */
        getMaxPoints(question) {
            return Math.max(...question.options.map(o => o.points));
        }
    };
})();