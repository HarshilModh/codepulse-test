document.addEventListener('DOMContentLoaded', () => {
    const presetSelect = document.getElementById('presets-select');
    const codeEditor = document.getElementById('sandbox-code');
    const filenameInput = document.getElementById('sandbox-filename');
    const scanForm = document.getElementById('snippet-scan-form');
    const resultsCard = document.getElementById('scan-results-card');
    
    // 1. Handle Presets
    if (presetSelect && codeEditor) {
        presetSelect.addEventListener('change', () => {
            const presetVal = presetSelect.value;
            if (presetVal && PRESETS[presetVal]) {
                codeEditor.value = PRESETS[presetVal];
                
                // Auto-suggest logical filename
                if (presetVal === 'safe') filenameInput.value = 'app.js';
                else if (presetVal === 'eval') filenameInput.value = 'cookie-parser.js';
                else if (presetVal === 'cmd') filenameInput.value = 'pinger.js';
                else if (presetVal === 'secret') filenameInput.value = 'payment.js';
                else if (presetVal === 'sql') filenameInput.value = 'db-query.js';
                else if (presetVal === 'xss') filenameInput.value = 'name-renderer.js';
                else if (presetVal === 'nosql') filenameInput.value = 'user-auth.js';
                else if (presetVal === 'crypto') filenameInput.value = 'hasher.js';
                else if (presetVal === 'cors') filenameInput.value = 'cors-config.js';
                else if (presetVal === 'tls') filenameInput.value = 'tls-check.js';
                else filenameInput.value = 'vulnerable-server.js';
            }
        });
        
        // Initial setup - default to mixed to show off capabilities
        presetSelect.value = 'mixed';
        codeEditor.value = PRESETS.mixed;
        filenameInput.value = 'vulnerable-server.js';
    }

    // 2. Submit Sandbox Scan
    if (scanForm) {
        scanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const code = codeEditor.value;
            const filename = filenameInput.value || 'sandbox.js';
            
            if (!code.trim()) {
                alert('Please enter some code to analyze.');
                return;
            }
            
            const scanBtn = document.getElementById('btn-scan-snippet');
            const origHTML = scanBtn.innerHTML;
            scanBtn.disabled = true;
            scanBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;margin:0;display:inline-block;border-width:2px;vertical-align:middle;margin-right:8px;"></span> Scanning...';
            
            try {
                const response = await fetch('/api/scan/snippet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, filename })
                });
                
                const data = await response.json();
                scanBtn.disabled = false;
                scanBtn.innerHTML = origHTML;
                
                if (data.success) {
                    displayScanResults(data.scan, code);
                } else {
                    alert('Error running snippet scan: ' + data.error);
                }
            } catch (err) {
                scanBtn.disabled = false;
                scanBtn.innerHTML = origHTML;
                alert('Failed to connect to the backend scanner.');
            }
        });
    }

    // 3. Render Results UI
    function displayScanResults(scan, originalCode) {
        resultsCard.classList.remove('hidden');
        
        // Metrics Summary
        const gradeEl = document.getElementById('results-grade');
        const scoreEl = document.getElementById('results-score');
        const linesEl = document.getElementById('results-lines');
        const countEl = document.getElementById('results-vulns-count');
        const complexityEl = document.getElementById('results-complexity');
        
        gradeEl.textContent = `Grade ${scan.metrics.grade}`;
        gradeEl.className = `badge ${scan.metrics.grade === 'A' || scan.metrics.grade === 'B' ? 'bg-success' : 'bg-warning'}`;
        
        scoreEl.textContent = `${scan.metrics.score}%`;
        linesEl.textContent = scan.metrics.totalLines;
        countEl.textContent = scan.vulnerabilities.length;
        complexityEl.textContent = scan.metrics.complexity;
        
        // Render Issues List
        const listEl = document.getElementById('vulnerabilities-list');
        listEl.innerHTML = '';
        
        if (scan.vulnerabilities.length === 0) {
            listEl.innerHTML = `
                <div class="alert alert-success">
                    <i data-lucide="check-circle"></i> Excellent! No vulnerabilities detected in this snippet.
                </div>
            `;
        } else {
            scan.vulnerabilities.forEach(v => {
                const item = document.createElement('div');
                item.className = `vuln-detail-item border-${v.severity.toLowerCase()}`;
                
                item.innerHTML = `
                    <div class="vuln-detail-header flex-row-between">
                        <span class="vuln-name font-bold">${escapeHtml(v.name)}</span>
                        <span class="badge bg-${v.severity.toLowerCase()}">${v.severity}</span>
                    </div>
                    <div class="vuln-meta text-muted text-sm mt-1">
                        Line: ${v.line}
                    </div>
                    <p class="vuln-desc text-sm mt-2">${escapeHtml(v.description)}</p>
                    <div class="vuln-code-snippet mt-2">
                        <code>${escapeHtml(v.code)}</code>
                    </div>
                    <div class="vuln-remediation text-sm mt-2">
                        <strong>Remediation:</strong> ${escapeHtml(v.remediation)}
                    </div>
                `;
                listEl.appendChild(item);
            });
        }
        
        // Render Highlighted Code Line-by-Line
        const highlightsEl = document.getElementById('code-highlights-view');
        highlightsEl.innerHTML = '';
        
        const lines = originalCode.split(/\r?\n/);
        lines.forEach((lineText, idx) => {
            const lineNum = idx + 1;
            const lineVuln = scan.vulnerabilities.find(v => v.line === lineNum);
            
            const lineContainer = document.createElement('div');
            lineContainer.className = 'viewer-line';
            if (lineVuln) {
                lineContainer.classList.add(`line-vuln-${lineVuln.severity.toLowerCase()}`);
            }
            
            lineContainer.innerHTML = `
                <span class="line-number">${lineNum}</span>
                <span class="line-code">${escapeHtml(lineText || ' ')}</span>
            `;
            highlightsEl.appendChild(lineContainer);
        });
        
        // Re-trigger Lucide Icons inside the dynamically loaded container
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Scroll results card smoothly into view
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
