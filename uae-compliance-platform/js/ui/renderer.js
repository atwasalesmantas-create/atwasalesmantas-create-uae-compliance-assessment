/**
 * UI Renderer
 * Handles DOM rendering and updates
 * 
 * Version: 1.1
 * Purpose: Centralized UI rendering
 * 
 * Why this exists:
 * - Separates DOM manipulation from logic
 * - Makes UI consistent
 * - Easy to update templates
 * - Supports accessibility
 */

const UIRenderer = (function() {
    'use strict';
    
    /**
     * Get DOM elements
     */
    const elements = {};
    
    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.stepContent = document.getElementById('stepContent');
        elements.progressFill = document.getElementById('progressFill');
        elements.progressCount = document.getElementById('progressCount');
        elements.backBtn = document.getElementById('backBtn');
        elements.nextBtn = document.getElementById('nextBtn');
        elements.startBtn = document.getElementById('startAssessmentBtn');
        elements.restartBtn = document.getElementById('restartBtn');
        elements.unlockBtn = document.getElementById('unlockBtn');
        elements.downloadBtn = document.getElementById('downloadPdfBtn');
        elements.bookBtn = document.getElementById('bookConsultBtn');
        elements.postCapture = document.getElementById('postCapture');
        elements.leadName = document.getElementById('leadName');
        elements.leadCompany = document.getElementById('leadCompany');
        elements.leadEmail = document.getElementById('leadEmail');
        elements.leadPhone = document.getElementById('leadPhone');
        elements.leadConsult = document.getElementById('leadConsult');
        
        // Results elements
        elements.gaugeScore = document.getElementById('gaugeScore');
        elements.gaugeArc = document.getElementById('gaugeArc');
        elements.gaugeTier = document.getElementById('gaugeTier');
        elements.companyNameLabel = document.getElementById('companyNameLabel');
        elements.resultsSummary = document.getElementById('resultsSummary');
        elements.valueScoreNum = document.getElementById('valueScoreNum');
        elements.riskCountNum = document.getElementById('riskCountNum');
        elements.strengthCountNum = document.getElementById('strengthCountNum');
        elements.categoryRows = document.getElementById('categoryRows');
        elements.strengthsList = document.getElementById('strengthsList');
        elements.risksList = document.getElementById('risksList');
        elements.actionsList = document.getElementById('actionsList');
    }
    
    /**
     * Show a screen
     * @param {string} screenId - Screen ID
     */
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Render a wizard step
     * @param {Object} step - Step data
     * @param {Object} state - Current state { answers, company }
     * @param {number} stepIndex - Current step index
     * @param {number} totalSteps - Total steps
     */
    function renderStep(step, state, stepIndex, totalSteps) {
        const container = elements.stepContent;
        if (!container) return;
        
        // Update progress
        elements.progressCount.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
        elements.progressFill.style.width = `${(stepIndex / (totalSteps - 1)) * 100}%`;
        elements.backBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
        elements.nextBtn.textContent = stepIndex === totalSteps - 1 ? 'See my results →' : 'Continue →';
        
        let html = `<div class="step-eyebrow">${step.eyebrow}</div>`;
        html += `<h2 class="step-title">${step.title}</h2>`;
        
        // Add description if available
        if (step.description) {
            html += `<p class="help-text">${step.description}</p>`;
        }
        
        if (step.id === 'company') {
            // Company fields
            step.fields.forEach(f => {
                html += `<div class="field-group"><label class="q-label">${f.label}</label>`;
                
                if (f.type === 'options') {
                    html += `<div class="option-grid" data-field="${f.id}">`;
                    f.options.forEach(opt => {
                        const sel = state.company[f.id] === opt ? 'selected' : '';
                        html += `<button type="button" class="option-btn ${sel}" data-value="${opt}">${opt}</button>`;
                    });
                    html += `</div>`;
                } else {
                    const value = state.company[f.id] || '';
                    html += `<input class="q-input" type="${f.type}" placeholder="${f.placeholder || ''}" value="${value}">`;
                }
                
                html += `</div>`;
            });
        } else {
            // Scored questions
            step.questions.forEach(q => {
                html += `<div class="field-group"><label class="q-label">${q.text}</label>`;
                html += `<div class="option-grid" data-qid="${q.id}">`;
                
                q.options.forEach(opt => {
                    const selected = state.answers[q.id] && 
                                    state.answers[q.id].label === opt.label ? 'selected' : '';
                    html += `<button type="button" class="option-btn ${selected}" data-label="${opt.label}" data-points="${opt.points}">${opt.label}</button>`;
                });
                
                html += `</div></div>`;
            });
        }
        
        container.innerHTML = html;
        
        // Attach event listeners for options
        container.querySelectorAll('.option-grid').forEach(grid => {
            const fieldId = grid.dataset.field;
            const qid = grid.dataset.qid;
            
            grid.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // Deselect others in this group
                    grid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    if (fieldId) {
                        // Company field
                        const value = this.dataset.value;
                        StateManager.setCompany({ [fieldId]: value });
                    } else if (qid) {
                        // Question answer
                        const value = {
                            label: this.dataset.label,
                            points: parseInt(this.dataset.points) || 0
                        };
                        StateManager.setAnswer(qid, value);
                    }
                    
                    // Validate after change
                    validateStep(step, state);
                });
            });
        });
        
        // Attach input events for text inputs
        container.querySelectorAll('input.q-input').forEach(input => {
            input.addEventListener('input', function() {
                const fieldId = this.closest('.field-group')?.querySelector('.q-label')?.textContent?.trim() || '';
                // Find field by label (simplified)
                const field = step.fields.find(f => f.label === fieldId);
                if (field) {
                    StateManager.setCompany({ [field.id]: this.value });
                }
                validateStep(step, state);
            });
        });
        
        // Validate initial state
        validateStep(step, state);
    }
    
    /**
     * Validate current step
     * @param {Object} step - Step data
     * @param {Object} state - Current state
     */
    function validateStep(step, state) {
        let complete = true;
        
        if (step.id === 'company') {
            step.fields.forEach(f => {
                if (!state.company[f.id]) complete = false;
            });
        } else {
            step.questions.forEach(q => {
                if (!state.answers[q.id]) complete = false;
            });
        }
        
        elements.nextBtn.disabled = !complete;
    }
    
    /**
     * Render results screen
     * @param {Object} scoreData - Computed score data
     * @param {Object} company - Company data
     */
    function renderResults(scoreData, company) {
        if (!scoreData) return;
        
        const { overall, valueScore, strengths, risks, actions, tier, categoryScores } = scoreData;
        const categoryIds = COMPLIANCE_CATEGORIES;
        
        // Gauge
        elements.gaugeScore.textContent = overall;
        elements.gaugeScore.style.color = tier.color;
        elements.gaugeTier.textContent = tier.label;
        elements.gaugeTier.style.color = tier.color;
        
        const circumference = 2 * Math.PI * 94;
        const arcLen = (overall / 100) * circumference;
        elements.gaugeArc.setAttribute('stroke', tier.color);
        elements.gaugeArc.setAttribute('stroke-dasharray', `${arcLen} ${circumference}`);
        
        // Company label
        elements.companyNameLabel.textContent = company.industry ? `Your Results · ${company.industry}` : 'Your Results';
        
        // Summary
        elements.resultsSummary.textContent = `Based on your ${company.legalForm || ''} business with ${(company.employees || '').toLowerCase()} employees, here is your scored risk profile across six compliance categories, prepared by ATWA Accounting & Taxation.`;
        
        // Value metrics
        elements.valueScoreNum.textContent = valueScore;
        elements.riskCountNum.textContent = risks.length;
        elements.strengthCountNum.textContent = strengths.length;
        
        // Category rows
        elements.categoryRows.innerHTML = '';
        categoryIds.forEach(id => {
            const c = categoryScores[id];
            if (!c) return;
            const t = ScoringEngine.getTier(c.healthScore);
            elements.categoryRows.innerHTML += `
                <div class="cat-row">
                    <div class="cat-name">${CATEGORY_NAMES[id] || id}</div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width:${c.healthScore}%; background:${t.color};"></div>
                    </div>
                    <div class="cat-score">${c.healthScore}</div>
                </div>
            `;
        });
        
        // Strengths
        elements.strengthsList.innerHTML = strengths.length 
            ? strengths.slice(0, 6).map(s => `<li><span class="mark good">✓</span>${s}</li>`).join('')
            : '<li><span class="mark risk">–</span>No strong points flagged yet — plenty of room to build a track record.</li>';
        
        // Risks
        elements.risksList.innerHTML = risks.length
            ? risks.slice(0, 6).map(r => `<li><span class="mark risk">⚠</span>${r.text} — <strong>${r.label}</strong></li>`).join('')
            : '<li><span class="mark good">✓</span>No material risks flagged. Well managed.</li>';
        
        // Actions
        elements.actionsList.innerHTML = actions.map((a, i) => `
            <div class="action-item">
                <div class="action-priority">Priority ${i + 1}</div>
                <div>
                    <h4>${a.title}</h4>
                    <p>${a.text}</p>
                    <span class="action-service">ATWA service: ${a.service}</span>
                </div>
            </div>
        `).join('');
        
        // Unlock UI
        elements.postCapture.classList.remove('active');
        elements.unlockBtn.style.display = 'inline-flex';
    }
    
    /**
     * Show PDF download button
     */
    function showDownloadButton() {
        elements.postCapture.classList.add('active');
        elements.unlockBtn.style.display = 'none';
    }
    
    /**
     * Get lead capture data
     * @returns {Object} Lead data
     */
    function getLeadData() {
        return {
            name: elements.leadName?.value?.trim() || '',
            company: elements.leadCompany?.value?.trim() || '',
            email: elements.leadEmail?.value?.trim() || '',
            phone: elements.leadPhone?.value?.trim() || '',
            consult: elements.leadConsult?.checked || false
        };
    }
    
    /**
     * Initialize renderer
     */
    function init() {
        cacheElements();
    }
    
    // Public API
    return {
        init,
        showScreen,
        renderStep,
        renderResults,
        validateStep,
        showDownloadButton,
        getLeadData,
        elements
    };
})();