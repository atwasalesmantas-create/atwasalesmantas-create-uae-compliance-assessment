/**
 * Application Constants
 * Shared constants used across the application
 * 
 * Version: 1.1
 * Purpose: Maintain consistency across modules
 */

// Category IDs for compliance assessment
const COMPLIANCE_CATEGORIES = [
    'accounting',
    'vat', 
    'corptax',
    'payroll',
    'audit',
    'licenses'
];

// Human-readable category names
const CATEGORY_NAMES = {
    accounting: 'Accounting',
    vat: 'VAT',
    corptax: 'Corporate Tax',
    payroll: 'Payroll',
    audit: 'Audit',
    licenses: 'Licenses & Governance'
};

// Risk levels for flagging
const RISK_LEVELS = {
    NONE: 0,
    LOW: 3,
    MEDIUM: 6,
    HIGH: 10,
    CRITICAL: 15
};

// Score ranges for tier classification
const SCORE_TIERS = {
    EXCELLENT: { min: 85, max: 100, label: 'Excellent', color: '#5C8A6B' },
    GOOD: { min: 70, max: 84, label: 'Good', color: '#7A9B6B' },
    ATTENTION: { min: 50, max: 69, label: 'Needs Attention', color: '#CFA23D' },
    HIGH_RISK: { min: 30, max: 49, label: 'High Risk', color: '#BE6A3D' },
    CRITICAL: { min: 0, max: 29, label: 'Immediate Action Required', color: '#A6373A' }
};

// Screen IDs for navigation
const SCREENS = {
    LANDING: 'screen-landing',
    WIZARD: 'screen-wizard',
    RESULTS: 'screen-results'
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMPLIANCE_CATEGORIES,
        CATEGORY_NAMES,
        RISK_LEVELS,
        SCORE_TIERS,
        SCREENS
    };
}