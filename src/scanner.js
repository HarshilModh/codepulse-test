const fs = require('fs');
const path = require('path');

// Vulnerability definitions and detection rules
const RULES = [
    {
        id: 'EVAL',
        name: 'Unsafe Dynamic Evaluation',
        severity: 'CRITICAL',
        description: 'Using eval() or new Function() with user-controlled input can lead to Remote Code Execution (RCE).',
        remediation: 'Avoid eval() completely. Use JSON.parse() for parsing JSON or safe lookup maps/functions.',
        test: (line) => /\beval\s*\([^)]+\)/.test(line) || /\bnew\s+Function\s*\([^)]*\)/.test(line)
    },
    {
        id: 'CMD_INJECTION',
        name: 'OS Command Injection',
        severity: 'CRITICAL',
        description: 'Executing shell commands with string concatenation or templates using variables can allow attackers to run arbitrary system commands.',
        remediation: 'Use spawn() or execFile() with separate argument arrays. Sanitize and validate all command arguments.',
        test: (line) => {
            const match = /\b(exec|execSync|spawn|spawnSync)\s*\((.+)\)/.exec(line);
            if (!match) return false;
            const args = match[2].trim();
            if (args.includes('+') || args.includes('`')) return true;
            if (!args.startsWith("'") && !args.startsWith('"') && !args.startsWith('`')) return true;
            return false;
        }
    },
    {
        id: 'HARDCODED_SECRET',
        name: 'Hardcoded Credential/Key',
        severity: 'HIGH',
        description: 'Storing secrets, API keys, or private tokens in source code risks exposure if the repository is leaked or accessed by unauthorized users.',
        remediation: 'Load secrets from environment variables (process.env) or a secure secrets manager.',
        test: (line) => {
            // Match assignments to key/secret/token variables with a string literal of length >= 12
            const match = /\b(secret|token|key|password|passwd|auth|api_key|stripe_secret|paypal_token)\b\s*[:=]\s*['"`]([a-zA-Z0-9_\-\.\:\/\+\=\%]{12,})['"`]/i.exec(line);
            if (match) {
                // Ignore obvious placeholder values
                const val = match[2].toLowerCase();
                if (val.includes('placeholder') || val.includes('todo') || val.includes('dummy') || val.includes('example')) {
                    return false;
                }
                return true;
            }
            return false;
        }
    },
    {
        id: 'WEAK_RNG',
        name: 'Insecure Random Number Generator',
        severity: 'LOW',
        description: 'Math.random() is cryptographically insecure and must not be used for security-sensitive operations (e.g., token generation, passwords, or session IDs).',
        remediation: 'Use crypto.randomBytes() or crypto.getRandomValues() for secure random numbers.',
        test: (line) => /\bMath\.random\s*\(\s*\)/.test(line)
    },
    {
        id: 'PATH_TRAVERSAL',
        name: 'Path Traversal Vulnerability',
        severity: 'HIGH',
        description: 'Reading or writing files using direct input concatenation without path sanitization can allow attackers to access arbitrary files on the filesystem.',
        remediation: 'Sanitize file paths. Use path.resolve() or path.join() and check if the resolved path starts with the intended base directory.',
        test: (line) => {
            // Match fs read/write operations using string concat or variables that look like inputs
            return /\bfs\.(?:readFile|readFileSync|createReadStream|writeFile|writeFileSync)\s*\(\s*([^)'"`]+|['"`].*?[\+\$].*?['"`])\s*[,)]/i.test(line) &&
                   !/\bpath\.(join|resolve|basename)\b/.test(line);
        }
    }
];

/**
 * Scans a code snippet (string) for security issues and metrics.
 * @param {string} code - The source code to scan
 * @param {string} filename - The relative name of the file
 * @returns {Object} Scan results
 */
function scanSnippet(code, filename = 'sandbox.js') {
    const lines = code.split(/\r?\n/);
    const vulnerabilities = [];
    
    let totalLines = lines.length;
    let commentLines = 0;
    let blankLines = 0;
    let complexityPoints = 1; // Base complexity
    
    lines.forEach((lineText, index) => {
        const lineNum = index + 1;
        const trimmed = lineText.trim();
        
        // Count comments and blanks
        if (trimmed === '') {
            blankLines++;
            return;
        }
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            commentLines++;
            return;
        }
        
        // Complexity heuristics
        // Count branches: if, for, while, catch, case, &&, ||, ?
        const complexityMatches = trimmed.match(/\b(if|for|while|catch|case)\b|&&|\|\||\?/g);
        if (complexityMatches) {
            complexityPoints += complexityMatches.length;
        }
        
        // Check rules
        RULES.forEach(rule => {
            if (rule.test(lineText)) {
                vulnerabilities.push({
                    file: filename,
                    line: lineNum,
                    code: trimmed,
                    ruleId: rule.id,
                    name: rule.name,
                    severity: rule.severity,
                    description: rule.description,
                    remediation: rule.remediation
                });
            }
        });
    });
    
    const codeLines = totalLines - commentLines - blankLines;
    
    // Calculate grade/score (out of 100)
    // Reduce score based on vulnerabilities and complexity density
    let score = 100;
    vulnerabilities.forEach(v => {
        if (v.severity === 'CRITICAL') score -= 25;
        else if (v.severity === 'HIGH') score -= 15;
        else if (v.severity === 'MEDIUM') score -= 8;
        else if (v.severity === 'LOW') score -= 3;
    });
    
    // Penalty for high complexity per line
    if (codeLines > 0) {
        const complexityDensity = complexityPoints / codeLines;
        if (complexityDensity > 0.3) {
            score -= Math.min(15, Math.round((complexityDensity - 0.3) * 50));
        }
    }
    
    score = Math.max(0, Math.min(100, score));
    
    // Determine rating grade
    let grade = 'A';
    if (score < 50) grade = 'F';
    else if (score < 65) grade = 'D';
    else if (score < 80) grade = 'C';
    else if (score < 90) grade = 'B';
    
    return {
        filename,
        metrics: {
            totalLines,
            codeLines,
            commentLines,
            blankLines,
            complexity: complexityPoints,
            score,
            grade
        },
        vulnerabilities
    };
}

/**
 * Scans a directory recursively and aggregates findings.
 * @param {string} dirPath - Path of directory to scan
 * @returns {Object} Aggregated results
 */
function scanDirectory(dirPath) {
    const filesToScan = [];
    
    function walk(currentDir) {
        const list = fs.readdirSync(currentDir);
        list.forEach(file => {
            const fullPath = path.join(currentDir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                const base = path.basename(fullPath);
                if (base !== 'node_modules' && base !== '.git' && base !== 'coverage' && base !== 'data') {
                    walk(fullPath);
                }
            } else if (stat.isFile() && file.endsWith('.js')) {
                filesToScan.push(fullPath);
            }
        });
    }
    
    try {
        walk(dirPath);
    } catch (err) {
        console.error("Error walking directory:", err);
        return { error: err.message };
    }
    
    let totalLines = 0;
    let totalCodeLines = 0;
    let totalCommentLines = 0;
    let totalBlankLines = 0;
    let totalComplexity = 0;
    let totalVulnerabilitiesCount = 0;
    
    const fileReports = [];
    const allVulnerabilities = [];
    
    filesToScan.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relPath = path.relative(dirPath, filePath);
            const report = scanSnippet(content, relPath);
            
            totalLines += report.metrics.totalLines;
            totalCodeLines += report.metrics.codeLines;
            totalCommentLines += report.metrics.commentLines;
            totalBlankLines += report.metrics.blankLines;
            totalComplexity += report.metrics.complexity;
            totalVulnerabilitiesCount += report.vulnerabilities.length;
            
            allVulnerabilities.push(...report.vulnerabilities);
            fileReports.push({
                file: relPath,
                metrics: report.metrics,
                vulnerabilitiesCount: report.vulnerabilities.length
            });
        } catch (err) {
            console.error(`Error scanning file ${filePath}:`, err);
        }
    });
    
    let averageScore = 100;
    if (fileReports.length > 0) {
        const sumScores = fileReports.reduce((sum, r) => sum + r.metrics.score, 0);
        averageScore = Math.round(sumScores / fileReports.length);
    }
    
    let grade = 'A';
    if (averageScore < 50) grade = 'F';
    else if (averageScore < 65) grade = 'D';
    else if (averageScore < 80) grade = 'C';
    else if (averageScore < 90) grade = 'B';
    
    return {
        metrics: {
            totalFiles: fileReports.length,
            totalLines,
            codeLines: totalCodeLines,
            commentLines: totalCommentLines,
            blankLines: totalBlankLines,
            complexity: totalComplexity,
            score: averageScore,
            grade
        },
        files: fileReports,
        vulnerabilities: allVulnerabilities
    };
}

module.exports = {
    scanSnippet,
    scanDirectory,
    RULES
};
