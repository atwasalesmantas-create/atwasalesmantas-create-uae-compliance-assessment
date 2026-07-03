/**
 * Scoring Engine
 * Calculates compliance scores and risk assessments
 * 
 * Version: 1.1
 * Purpose: Business logic for scoring and risk analysis
 * 
 * Why this exists:
 * - Separates scoring logic from UI
 * - Makes scoring rules testable
 * - Enables scoring algorithm updates
 * - Supports weighted category scores
 */

const ScoringEngine = (function() {
    'use strict';
    
    /**
     * Calculate health score for a category
     * @param {Array} questions - Questions in the category
     * @param {Object} answers - User answers
     * @returns {Object} Score data for the category
     */
    function calculateCategoryScore(questions, answers) {
        let riskSum = 0;
        let maxRisk = 0;
        let answeredCount = 0;
        
        questions.forEach(q => {
            const chosen = answers[q.id];
            const maxPts = AssessmentData.getMaxPoints(q);
            maxRisk += maxPts;
            
            if (chosen) {
                riskSum += chosen.points || 0;
                answeredCount++;
            } else {
                // Unanswered questions get maximum points (worst case)
                riskSum += maxPts;
            }
        });
        
        // Calculate health score (100 - risk percentage)
        const healthScore = maxRisk > 0 
            ? Math.round(100 - (riskSum / maxRisk) * 100) 
            : 100;
        
        return {
            riskSum,
            maxRisk,
            healthScore,
            answeredCount,
            totalQuestions: questions.length
        };
    }
    
    /**
     * Calculate overall compliance score
     * @param {Object} categoryScores - Map of category scores
     * @param {Array} categoryIds - IDs of compliance categories
     * @returns {number} Overall score (0-100)
     */
    function calculateOverallScore(categoryScores, categoryIds) {
        const scores = categoryIds
            .map(id => categoryScores[id]?.healthScore || 0)
            .filter(score => score !== undefined && score !== null);
        
        if (scores.length === 0) return 0;
        
        // Weighted average - all categories equal weight
        const total = scores.reduce((a, b) => a + b, 0);
        return Math.round(total / scores.length);
    }
    
    /**
     * Determine risk tier based on score
     * @param {number} score - Score (0-100)
     * @returns {Object} Tier object with label and color
     */
    function getTier(score) {
        if (score >= 85) {
            return { label: 'Excellent', color: '#5C8A6B', key: 'excellent' };
        } else if (score >= 70) {
            return { label: 'Good', color: '#7A9B6B', key: 'good' };
        } else if (score >= 50) {
            return { label: 'Needs Attention', color: '#CFA23D', key: 'attention' };
        } else if (score >= 30) {
            return { label: 'High Risk', color: '#BE6A3D', key: 'highRisk' };
        } else {
            return { label: 'Immediate Action Required', color: '#A6373A', key: 'critical' };
        }
    }
    
    /**
     * Identify strengths (zero-risk answers)
     * @param {Array} questions - All scored questions
     * @param {Object} answers - User answers
     * @returns {Array} List of strength descriptions
     */
    function identifyStrengths(questions, answers) {
        const strengths = [];
        
        questions.forEach(q => {
            const chosen = answers[q.id];
            if (chosen && chosen.points === 0) {
                // Clean up question text for display
                let cleanText = q.text
                    .replace(/^(Do you|Is your|Are your|Have you|When was|Who prepares|How often)/, '')
                    .trim();
                strengths.push(`${cleanText} — ${chosen.label}`);
            }
        });
        
        return strengths;
    }
    
    /**
     * Identify risks (answers with points >= threshold)
     * @param {Array} questions - All scored questions
     * @param {Object} answers - User answers
     * @param {number} threshold - Points threshold for risk (default: 10)
     * @returns {Array} List of risk objects
     */
    function identifyRisks(questions, answers, threshold = 10) {
        const risks = [];
        
        questions.forEach(q => {
            const chosen = answers[q.id];
            if (chosen && chosen.points >= threshold) {
                risks.push({
                    qid: q.id,
                    text: q.text,
                    label: chosen.label,
                    points: chosen.points,
                    category: AssessmentData.getCategoryForQuestion(q.id)
                });
            }
        });
        
        // Sort by points descending (highest risk first)
        risks.sort((a, b) => b.points - a.points);
        
        return risks;
    }
    
    /**
     * Generate action recommendations based on risks
     * @param {Array} risks - List of risk objects
     * @param {Object} actionLibrary - Map of action definitions
     * @param {number} maxActions - Maximum actions to return
     * @returns {Array} List of action recommendations
     */
    function recommendActions(risks, actionLibrary, maxActions = 3) {
        const actions = [];
        
        for (const risk of risks) {
            const action = actionLibrary[risk.qid];
            if (action && actions.length < maxActions) {
                actions.push({
                    ...action,
                    priority: actions.length + 1
                });
            }
        }
        
        // If no risks found, provide a maintenance recommendation
        if (actions.length === 0) {
            actions.push({
                title: 'Maintain your current controls',
                text: 'No major risks were flagged. Keep your current bookkeeping, filing, and renewal routines in place, and revisit this assessment each quarter.',
                service: 'Annual Compliance Support',
                priority: 1
            });
        }
        
        return actions;
    }
    
    // Public API
    return {
        /**
         * Compute complete score data from answers
         * @param {Object} answers - User answers
         * @param {Object} company - Company data (for context)
         * @returns {Object} Complete score data
         */
        computeResults(answers, company) {
            const scoredSteps = AssessmentData.getScoredSteps();
            const allQuestions = AssessmentData.getAllQuestions();
            const categoryIds = COMPLIANCE_CATEGORIES;
            
            // Calculate per-category scores
            const categoryScores = {};
            scoredSteps.forEach(step => {
                const result = calculateCategoryScore(step.questions, answers);
                categoryScores[step.id] = {
                    name: step.title,
                    ...result
                };
            });
            
            // Calculate overall score (compliance categories only)
            const overall = calculateOverallScore(categoryScores, categoryIds);
            
            // Get value score (from 'value' category)
            const valueScore = categoryScores['value']?.healthScore || 0;
            
            // Identify strengths and risks
            const strengths = identifyStrengths(allQuestions, answers);
            const risks = identifyRisks(allQuestions, answers);
            
            // Generate actions (using actionLibrary)
            const actions = recommendActions(risks, actionLibrary);
            
            return {
                categoryScores,
                overall,
                valueScore,
                strengths,
                risks,
                actions,
                tier: getTier(overall),
                company: { ...company },
                totalQuestions: allQuestions.length,
                answeredQuestions: Object.keys(answers).length
            };
        },
        
        /**
         * Get tier for a score
         * @param {number} score - Score (0-100)
         * @returns {Object} Tier object
         */
        getTier,
        
        /**
         * Get all category IDs
         * @returns {Array} List of category IDs
         */
        getCategoryIds() {
            return [...COMPLIANCE_CATEGORIES];
        }
    };
})();

/**
 * Action Library - Maps question IDs to recommended actions
 * This is business logic that will be used by the scoring engine
 */
const actionLibrary = {
    ct_registered: {
        title: 'Register for Corporate Tax',
        text: 'Corporate Tax registration is mandatory for most UAE businesses. Unregistered entities face penalties that grow the longer this is left unresolved.',
        service: 'Corporate Tax Registration'
    },
    vat_registered: {
        title: 'Confirm your VAT position',
        text: 'Clarify whether you meet the mandatory or voluntary VAT registration threshold, and register promptly if required.',
        service: 'VAT Registration'
    },
    vat_notice: {
        title: 'Resolve outstanding FTA notice',
        text: 'An unresolved FTA notice can escalate into penalties or an audit. Address this before your next filing deadline.',
        service: 'Tax Reconsideration & Exemption Services'
    },
    audit_last: {
        title: 'Schedule an audit',
        text: 'An overdue or missing audit can jeopardise license renewal and investor or bank confidence.',
        service: 'External Audit'
    },
    lic_current: {
        title: 'Renew your trade license',
        text: 'Operating on an expired license exposes the business to fines and can block other government transactions.',
        service: 'PRO Services — Document Renewals'
    },
    acc_bookkeeping: {
        title: 'Formalise monthly bookkeeping',
        text: 'Consistent monthly bookkeeping is the foundation every other compliance area depends on.',
        service: 'Bookkeeping & Record-Keeping'
    },
    acc_prepares: {
        title: 'Assign clear ownership of your accounts',
        text: 'Books with no consistent preparer are a leading cause of late filings and inaccurate tax positions.',
        service: 'Financial Statements Preparation'
    },
    pay_wps: {
        title: 'Bring payroll into WPS compliance',
        text: 'Non-compliant payroll can trigger MOHRE penalties and restrict future work permits.',
        service: 'Payroll Processing'
    },
    lic_ubo: {
        title: 'Update UBO records',
        text: 'Outdated UBO filings can delay license renewals and banking processes.',
        service: 'goAML Compliance Services'
    },
    vat_late: {
        title: 'Tighten your VAT filing calendar',
        text: 'Repeated late filings compound penalties and increase audit risk over time.',
        service: 'VAT Compliance Audit'
    },
    ct_relief: {
        title: 'Assess Small Business Relief eligibility',
        text: 'Confirming your eligibility could materially reduce your Corporate Tax liability.',
        service: 'Tax Planning & Advisory Services'
    },
    lic_tracked: {
        title: 'Set up a renewals tracker',
        text: 'A simple renewals calendar prevents license, UBO, and permit lapses before they happen.',
        service: 'PRO Services — Visa & Document Renewals'
    },
    acc_reports: {
        title: 'Move to monthly management reporting',
        text: 'Monthly reports let you catch issues — and opportunities — while there is still time to act.',
        service: 'Financial Statements Preparation'
    },
    pay_timely: {
        title: 'Stabilise your payroll cycle',
        text: 'Late or inconsistent payroll runs create compliance exposure and employee-relations risk.',
        service: 'Payroll Processing'
    },
    val_cashflow: {
        title: 'Build a rolling cash-flow forecast',
        text: 'A simple 13-week cash-flow view is one of the highest-leverage tools an SME owner can have.',
        service: 'Tax Planning & Advisory Services'
    },
    val_mgmt: {
        title: 'Start receiving management reports',
        text: 'Management reports translate raw bookkeeping into decisions you can actually act on.',
        service: 'Financial Statements Preparation'
    },
    val_taxfc: {
        title: 'Forecast upcoming tax liabilities',
        text: 'Knowing your tax position ahead of time avoids cash-flow surprises at filing time.',
        service: 'Tax Planning & Advisory Services'
    }
};