/**
 * PDF Generator Service
 * Handles PDF export of assessment results
 * 
 * Version: 1.1
 * Purpose: Professional PDF report generation
 * 
 * Why this exists:
 * - Separates PDF logic from UI
 * - Enables custom branding
 * - Makes PDF generation testable
 * - Supports future report templates
 */

const PDFGenerator = (function() {
    'use strict';
    
    /**
     * Generate a PDF report from assessment data
     * @param {Object} data - Assessment data { company, scoreData, leadInfo }
     * @param {Function} jsPDF - jsPDF constructor
     * @returns {jsPDF} PDF document object
     */
    function generateReport(data, jsPDF) {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 48;
        let y = 60;
        
        const { company, scoreData, leadInfo } = data;
        const tier = ScoringEngine.getTier(scoreData.overall);
        
        // ---------- HEADER ----------
        // Dark background header
        doc.setFillColor(10, 10, 11);
        doc.rect(0, 0, pageW, 74, 'F');
        
        // Brand name
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('ATWA', margin, 34);
        
        // Brand subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(184, 146, 61);
        doc.text('A C C O U N T I N G   &   T A X A T I O N', margin, 48);
        
        // Report title
        doc.setTextColor(210, 210, 210);
        doc.setFontSize(10);
        doc.text('Business Compliance & Risk Assessment Report', margin, 64);
        
        y = 108;
        
        // ---------- CLIENT INFO ----------
        doc.setTextColor(38, 37, 31);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        
        const clientName = leadInfo?.name || '—';
        const clientCompany = leadInfo?.company || '';
        doc.text(`Prepared for: ${clientName}${clientCompany ? ' · ' + clientCompany : ''}`, margin, y);
        y += 16;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(92, 90, 82);
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);
        y += 30;
        
        // ---------- COMPANY INFO ----------
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(38, 37, 31);
        doc.text('Company Information', margin, y);
        y += 8;
        
        doc.setDrawColor(220, 216, 204);
        doc.line(margin, y, pageW - margin, y);
        y += 16;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(92, 90, 82);
        
        const compLines = [
            `Legal form: ${company.legalForm || '—'}`,
            `Year established: ${company.yearEstablished || '—'}`,
            `Employees: ${company.employees || '—'}`,
            `Annual turnover: ${company.turnover || '—'}`,
            `Industry: ${company.industry || '—'}`
        ];
        
        compLines.forEach(line => {
            doc.text(line, margin, y);
            y += 15;
        });
        y += 12;
        
        // ---------- OVERALL SCORE ----------
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(38, 37, 31);
        doc.text('Overall Business Health', margin, y);
        y += 8;
        doc.line(margin, y, pageW - margin, y);
        y += 20;
        
        const [r, g, b] = hexToRgb(tier.color);
        doc.setFontSize(28);
        doc.setTextColor(r, g, b);
        doc.text(`${scoreData.overall} / 100`, margin, y);
        
        doc.setFontSize(11);
        doc.setTextColor(92, 90, 82);
        doc.text(tier.label, margin + 130, y - 2);
        y += 14;
        
        doc.setFontSize(10);
        doc.setTextColor(92, 90, 82);
        doc.text(`Business Value Score: ${scoreData.valueScore} / 100`, margin, y);
        y += 30;
        
        // ---------- CATEGORY BREAKDOWN ----------
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(38, 37, 31);
        doc.text('Category Breakdown', margin, y);
        y += 8;
        doc.line(margin, y, pageW - margin, y);
        y += 18;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const categoryIds = COMPLIANCE_CATEGORIES;
        categoryIds.forEach(id => {
            const c = scoreData.categoryScores[id];
            if (!c) return;
            const t = ScoringEngine.getTier(c.healthScore);
            const [cr, cg, cb] = hexToRgb(t.color);
            
            doc.setTextColor(38, 37, 31);
            doc.text(CATEGORY_NAMES[id] || id, margin, y);
            
            doc.setTextColor(cr, cg, cb);
            doc.text(`${c.healthScore} / 100  (${t.label})`, margin + 220, y);
            y += 16;
        });
        y += 16;
        
        // ---------- RISKS ----------
        if (y > 650) { doc.addPage(); y = 60; }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(38, 37, 31);
        doc.text('Key Risks', margin, y);
        y += 8;
        doc.line(margin, y, pageW - margin, y);
        y += 18;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(92, 90, 82);
        
        const riskLines = scoreData.risks.slice(0, 8);
        if (riskLines.length === 0) {
            doc.text('No material risks flagged.', margin, y);
            y += 16;
        } else {
            riskLines.forEach(r => {
                const wrapped = doc.splitTextToSize(`• ${r.text} — ${r.label}`, pageW - 2 * margin);
                doc.text(wrapped, margin, y);
                y += wrapped.length * 13 + 4;
                if (y > 750) { doc.addPage(); y = 60; }
            });
        }
        y += 16;
        
        // ---------- ACTIONS ----------
        if (y > 600) { doc.addPage(); y = 60; }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(38, 37, 31);
        doc.text('Recommended Actions', margin, y);
        y += 8;
        doc.line(margin, y, pageW - margin, y);
        y += 18;
        
        scoreData.actions.forEach((a, i) => {
            if (y > 700) { doc.addPage(); y = 60; }
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(184, 146, 61);
            doc.text(`Priority ${i + 1}: ${a.title}`, margin, y);
            y += 15;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(92, 90, 82);
            const wrapped = doc.splitTextToSize(a.text, pageW - 2 * margin);
            doc.text(wrapped, margin, y);
            y += wrapped.length * 13 + 4;
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(184, 146, 61);
            doc.text(`ATWA service: ${a.service}`, margin, y);
            y += 22;
        });
        
        // ---------- CONTACT ----------
        if (y > 640) { doc.addPage(); y = 60; }
        y += 6;
        
        doc.setDrawColor(220, 216, 204);
        doc.line(margin, y, pageW - margin, y);
        y += 18;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(38, 37, 31);
        doc.text('Contact ATWA Accounting & Taxation LLC', margin, y);
        y += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(92, 90, 82);
        
        const contactLines = [
            'Business Bay: Tamani Art Offices, 12th Floor, Office No. 1254, Dubai',
            'Garhoud: Zalfa Building, 3rd Floor, Office No. 104, Dubai',
            'Phone: +971 50 777 9293 · +971 50 777 9294',
            'Email: info@atwa.ae   ·   Web: www.atwa.ae'
        ];
        
        contactLines.forEach(line => {
            doc.text(line, margin, y);
            y += 14;
        });
        
        // ---------- DISCLAIMER ----------
        y += 12;
        doc.setDrawColor(220, 216, 204);
        doc.line(margin, y, pageW - margin, y);
        y += 16;
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(140, 140, 140);
        
        const disclaimer = doc.splitTextToSize(
            'This assessment is provided by ATWA Accounting & Taxation LLC for general informational purposes only and does not constitute legal, tax, or accounting advice. Scores are indicative, based solely on self-reported answers, and should not be relied upon for compliance decisions. Please consult a qualified advisor before acting on any recommendation shown here.',
            pageW - 2 * margin
        );
        doc.text(disclaimer, margin, y);
        
        return doc;
    }
    
    /**
     * Download PDF file
     * @param {Object} data - Assessment data
     * @param {Function} jsPDF - jsPDF constructor
     * @param {string} filename - Optional filename
     */
    function downloadPDF(data, jsPDF, filename) {
        const doc = generateReport(data, jsPDF);
        const defaultFilename = `ATWA-Compliance-Assessment-${data.company?.name || 'report'}.pdf`;
        doc.save(filename || defaultFilename);
    }
    
    /**
     * Helper: Convert hex color to RGB
     * @param {string} hex - Hex color code
     * @returns {Array} [r, g, b] values
     */
    function hexToRgb(hex) {
        const v = hex.replace('#', '');
        return [
            parseInt(v.substring(0, 2), 16),
            parseInt(v.substring(2, 4), 16),
            parseInt(v.substring(4, 6), 16)
        ];
    }
    
    // Public API
    return {
        generateReport,
        downloadPDF,
        hexToRgb
    };
})();