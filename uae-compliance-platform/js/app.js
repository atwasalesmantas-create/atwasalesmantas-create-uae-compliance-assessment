/**
 * Application Entry Point
 * Initializes all modules and starts the application
 * 
 * Version: 1.1
 * Purpose: Bootstrap the application
 * 
 * Why this exists:
 * - Single entry point for the app
 * - Controls initialization order
 * - Handles global event delegation
 */

(function() {
    'use strict';
    
    /**
     * Initialize the application
     * Called when DOM is ready
     */
    function init() {
        console.log('ATWA Compliance Assessment v1.1.0');
        
        // Initialize modules in order
        UIRenderer.init();
        WizardController.init();
        WizardController.initEvents();
        
        // Set up global error handling
        window.addEventListener('error', function(e) {
            console.error('Application error:', e.message);
            // Could send to analytics service here
        });
        
        // Keyboard shortcuts (accessibility)
        document.addEventListener('keydown', function(e) {
            // Enter key on buttons
            if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
                e.target.click();
            }
            
            // Right arrow to advance (not in landing)
            if (e.key === 'ArrowRight' && !document.getElementById(SCREENS.LANDING).classList.contains('active')) {
                const nextBtn = UIRenderer.elements.nextBtn;
                if (nextBtn && !nextBtn.disabled) {
                    nextBtn.click();
                }
            }
            
            // Left arrow to go back (not in landing)
            if (e.key === 'ArrowLeft' && !document.getElementById(SCREENS.LANDING).classList.contains('active')) {
                const backBtn = UIRenderer.elements.backBtn;
                if (backBtn && backBtn.style.visibility !== 'hidden') {
                    backBtn.click();
                }
            }
        });
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();