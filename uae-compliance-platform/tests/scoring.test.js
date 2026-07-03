/**
 * Scoring Engine Tests
 * 
 * Version: 1.1
 * Purpose: Ensure scoring logic is correct
 * 
 * These tests verify that the scoring engine produces
 * expected results for various answer combinations.
 */

// Mock dependencies
const mockAnswers = {
    // Accounting - all good
    acc_bookkeeping: { label: 'Yes', points: 0 },
    acc_reports: { label: 'Yes', points: 0 },
    acc_prepares: { label: 'Internal accountant', points: 0 },
    
    // VAT - some issues
    vat_registered: { label: 'Yes', points: 0 },
    vat_frequency: { label: 'Monthly', points: 0 },
    vat_late: { label: 'Never', points: 0 },
    vat_notice: { label: 'No', points: 0 },
    
    // Corporate Tax - needs attention
    ct_registered: { label: 'No, but should be', points: 25 },
    ct_filed: { label: 'No', points: 20 },
    ct_relief: { label: 'No / not sure', points: 12 },
    
    // Payroll - good
    pay_wps: { label: 'Yes', points: 0 },
    pay_timely: { label: 'Yes', points: 0 },
    
    // Audit - needs attention
    audit_required: { label: 'Yes', points: 0 },
    audit_last: { label: 'Never / overdue', points: 22 },
    
    // Licenses - good
    lic_current: { label: 'Yes', points: 0 },
    lic_ubo: { label: 'Yes', points: 0 },
    lic_tracked: { label: 'Yes', points: 0 },
    
    // Value - good
    val_profit: { label: 'Yes', points: 0 },
    val_mgmt: { label: 'Yes', points: 0 },
    val_payroll_cost: { label: 'Yes', points: 0 },
    val_taxfc: { label: 'Yes', points: 0 },
    val_cashflow: { label: 'Yes', points: 0 }
};

// Test suite
function runTests() {
    console.log('Running Scoring Engine Tests...');
    let passed = 0;
    let failed = 0;
    
    // Test 1: Category scoring
    const scoredSteps = AssessmentData.getScoredSteps();
    const accountingStep = scoredSteps.find(s => s.id === 'accounting');
    const result = ScoringEngine.calculateCategoryScore(accountingStep.questions, mockAnswers);
    
    if (result.healthScore === 100) {
        console.log('✓ Test 1 passed: Accounting category score 100%');
        passed++;
    } else {
        console.log(`✗ Test 1 failed: Expected 100, got ${result.healthScore}`);
        failed++;
    }
    
    // Test 2: Risk identification
    const allQuestions = AssessmentData.getAllQuestions();
    const risks = ScoringEngine.identifyRisks(allQuestions, mockAnswers);
    
    // Should find at least corporate tax and audit risks
    const hasCorpTaxRisk = risks.some(r => r.qid === 'ct_registered');
    const hasAuditRisk = risks.some(r => r.qid === 'audit_last');
    
    if (hasCorpTaxRisk && hasAuditRisk) {
        console.log('✓ Test 2 passed: Risk identification works');
        passed++;
    } else {
        console.log(`✗ Test 2 failed: Missing expected risks`);
        failed++;
    }
    
    // Test 3: Tier classification
    const excellentTier = ScoringEngine.getTier(95);
    if (excellentTier.key === 'excellent') {
        console.log('✓ Test 3 passed: Tier classification for excellent');
        passed++;
    } else {
        console.log(`✗ Test 3 failed: Expected 'excellent', got '${excellentTier.key}'`);
        failed++;
    }
    
    const criticalTier = ScoringEngine.getTier(15);
    if (criticalTier.key === 'critical') {
        console.log('✓ Test 4 passed: Tier classification for critical');
        passed++;
    } else {
        console.log(`✗ Test 4 failed: Expected 'critical', got '${criticalTier.key}'`);
        failed++;
    }
    
    // Test 4: Overall score calculation
    const categoryScores = {};
    scoredSteps.forEach(step => {
        const result = ScoringEngine.calculateCategoryScore(step.questions, mockAnswers);
        categoryScores[step.id] = result;
    });
    const overall = ScoringEngine.calculateOverallScore(categoryScores, COMPLIANCE_CATEGORIES);
    // Should be somewhere around 65-75 depending on weighting
    if (overall >= 60 && overall <= 80) {
        console.log(`✓ Test 5 passed: Overall score ${overall} within expected range`);
        passed++;
    } else {
        console.log(`✗ Test 5 failed: Overall score ${overall} outside expected range`);
        failed++;
    }
    
    console.log(`\nTests complete: ${passed} passed, ${failed} failed`);
    return { passed, failed };
}

// Run tests if in Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests };
}

// Run automatically in browser
if (typeof window !== 'undefined') {
    // Delay to ensure all modules are loaded
    setTimeout(runTests, 500);
}