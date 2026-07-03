/**
 * Wizard Controller
 * Manages the assessment wizard flow
 * 
 * Version: 1.1
 * Purpose: Navigation and flow control for the wizard
 * 
 * Why this exists:
 * - Separates wizard logic from rendering
 * - Handles navigation events
 * - Manages step transitions
 */

const WizardController = (function() {
    'use strict';
    
    let totalSteps = 0;
    let isComplete = false;
    
    /**
     * Initialize the wizard
     */
    function init() {
        const steps = AssessmentData.getAllSteps();
        totalSteps = steps.length;
        
        // Set up event listeners
        const elements = UIRenderer.elements;
        
        elements.startBtn?.addEventListener('click', function() {
            startWizard();
        });
        
        elements.backBtn?.addEventListener('click', function() {
            goBack();
        });
        
        elements.nextBtn?.addEventListener('click', function() {
            goForward();
        });
        
        elements.restartBtn?.addEventListener('click', function() {
            restart();
        });
        
        // Check for saved state
        const hasSaved = StateManager.loadFromStorage();
        if (hasSaved && StateManager.isComplete()) {
            // Restore results
            const scoreData = StateManager.getScoreData();
            if (scoreData) {
                const company = StateManager.getCompany();
                UIRenderer.renderResults(scoreData, company);
                UIRenderer.showScreen(SCREENS.RESULTS);
                return;
            }
        }
        
        if (hasSaved) {
            // Resume from saved step
            const stepIndex = StateManager.getCurrentStep();
            if (stepIndex > 0 && stepIndex < totalSteps) {
                renderStep(stepIndex);
                UIRenderer.showScreen(SCREENS.WIZARD);
                return;
            }
        }
        
        // Default: show landing
        UIRenderer.showScreen(SCREENS.LANDING);
    }
    
    /**
     * Start the wizard
     */
    function startWizard() {
        StateManager.reset();
        renderStep(0);
        UIRenderer.showScreen(SCREENS.WIZARD);
    }
    
    /**
     * Render a specific step
     * @param {number} stepIndex - Step index to render
     */
    function renderStep(stepIndex) {
        const steps = AssessmentData.getAllSteps();
        const step = steps[stepIndex];
        const state = {
            answers: StateManager.getAnswers(),
            company: StateManager.getCompany()
        };
        
        UIRenderer.renderStep(step, state, stepIndex, totalSteps);
    }
    
    /**
     * Go to the next step
     */
    function goForward() {
        const currentStep = StateManager.getCurrentStep();
        
        if (currentStep < totalSteps - 1) {
            // Move to next step
            const nextStep = currentStep + 1;
            StateManager.setCurrentStep(nextStep);
            renderStep(nextStep);
        } else {
            // Complete the assessment
            completeAssessment();
        }
    }
    
    /**
     * Go to the previous step
     */
    function goBack() {
        const currentStep = StateManager.getCurrentStep();
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            StateManager.setCurrentStep(prevStep);
            renderStep(prevStep);
        }
    }
    
    /**
     * Complete the assessment and show results
     */
    function completeAssessment() {
        const answers = StateManager.getAnswers();
        const company = StateManager.getCompany();
        
        // Compute scores
        const scoreData = ScoringEngine.computeResults(answers, company);
        StateManager.setScoreData(scoreData);
        
        // Render results
        UIRenderer.renderResults(scoreData, company);
        UIRenderer.showScreen(SCREENS.RESULTS);
    }
    
    /**
     * Restart the assessment
     */
    function restart() {
        StateManager.reset();
        UIRenderer.showScreen(SCREENS.LANDING);
        
        // Reset UI elements
        UIRenderer.elements.postCapture?.classList.remove('active');
        UIRenderer.elements.unlockBtn && (UIRenderer.elements.unlockBtn.style.display = 'inline-flex');
    }
    
    /**
     * Unlock the report (lead capture)
     * @returns {boolean} True if valid
     */
    function unlockReport() {
        const leadData = UIRenderer.getLeadData();
        const validation = ValidationService.validateLeadForm(leadData);
        
        if (!validation.valid) {
            const errors = Object.values(validation.errors).filter(Boolean);
            alert(errors.length > 0 ? errors.join('\n') : 'Please fill in all required fields.');
            return false;
        }
        
        StateManager.unlock();
        UIRenderer.showDownloadButton();
        return true;
    }
    
    /**
     * Download PDF report
     */
    function downloadPDF() {
        const scoreData = StateManager.getScoreData();
        const company = StateManager.getCompany();
        const leadData = UIRenderer.getLeadData();
        
        if (!scoreData) {
            alert('No assessment data available.');
            return;
        }
        
        try {
            PDFGenerator.downloadPDF(
                { company, scoreData, leadInfo: leadData },
                window.jspdf.jsPDF,
                `ATWA-Compliance-Assessment-${leadData.company || leadData.name || 'report'}.pdf`
            );
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Unable to generate PDF. Please try again.');
        }
    }
    
    /**
     * Book consultation - placeholder
     */
    function bookConsultation() {
        alert('This would open your booking calendar — wire this button to Calendly, Cal.com, or your CRM.');
    }
    
    /**
     * Initialize event listeners for results screen
     */
    function initResultsEvents() {
        const elements = UIRenderer.elements;
        
        elements.unlockBtn?.addEventListener('click', function() {
            unlockReport();
        });
        
        elements.downloadBtn?.addEventListener('click', function() {
            downloadPDF();
        });
        
        elements.bookBtn?.addEventListener('click', function() {
            bookConsultation();
        });
    }
    
    // Initialize events
    function initEvents() {
        initResultsEvents();
    }
    
    // Public API
    return {
        init,
        startWizard,
        renderStep,
        goForward,
        goBack,
        completeAssessment,
        restart,
        unlockReport,
        downloadPDF,
        initEvents
    };
})();