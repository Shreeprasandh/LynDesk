const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Strictly READ-ONLY pre-commit code auditor for staged files
function runAudit() {
  console.log('\n🔍 [Git Pre-Commit Auditor] Inspecting staged files for logic errors & bugs...');

  try {
    // Get list of staged files
    const stagedFilesOutput = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
    const stagedFiles = stagedFilesOutput
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0 && /\.(ts|tsx|js|jsx|json|sql)$/i.test(f));

    if (stagedFiles.length === 0) {
      console.log('⚡ No code files staged for commit. Audit complete (0 ms).\n');
      return;
    }

    console.log(`📁 Staged code files to inspect (${stagedFiles.length}):`);
    stagedFiles.forEach(f => console.log(`   - ${f}`));

    const findings = [];
    const suggestions = [];

    // Analyze each staged file strictly in READ-ONLY mode
    for (const filePath of stagedFiles) {
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Logic Check 1: Next.js 15/16 async params / searchParams in Page/Layout components
      if (filePath.includes('src/app') && (filePath.endsWith('page.tsx') || filePath.endsWith('layout.tsx'))) {
        lines.forEach((line, idx) => {
          if (line.includes('params.') && !content.includes('await params') && !line.includes('await params')) {
            findings.push({
              severity: 'HIGH LOGIC ISSUE',
              file: filePath,
              line: idx + 1,
              issue: 'Direct access to `params` without `await` in Next.js 15+ Page/Layout component.',
              impact: 'In Next.js 15+, `params` is a Promise. Accessing properties synchronously causes runtime errors or undefined values.'
            });
          }
          if (line.includes('searchParams.') && !content.includes('await searchParams') && !line.includes('await searchParams')) {
            findings.push({
              severity: 'HIGH LOGIC ISSUE',
              file: filePath,
              line: idx + 1,
              issue: 'Direct access to `searchParams` without `await` in Next.js 15+ Page/Layout component.',
              impact: 'In Next.js 15+, `searchParams` is a Promise. Accessing properties synchronously causes runtime errors.'
            });
          }
        });
      }

      // Logic Check 2: Missing error handling in async fetch / Supabase queries
      lines.forEach((line, idx) => {
        if ((line.includes('await supabase.') || line.includes('await fetch(')) && !line.includes('catch') && !line.includes('try')) {
          const surrounding = lines.slice(Math.max(0, idx - 5), Math.min(lines.length, idx + 5)).join('\n');
          if (!surrounding.includes('try') && !surrounding.includes('.catch') && !surrounding.includes('error')) {
            findings.push({
              severity: 'MEDIUM LOGIC ISSUE',
              file: filePath,
              line: idx + 1,
              issue: 'Async call without error handling or try/catch wrapper.',
              impact: 'Network failures or database errors will throw unhandled exceptions and break the flow.'
            });
          }
        }
      });

      // Logic Check 3: Console.log leftover in production logic
      lines.forEach((line, idx) => {
        if (line.includes('console.log(') && !line.trim().startsWith('//')) {
          suggestions.push({
            type: 'IMPROVEMENT SUGGESTION (USER APPROVAL REQUIRED)',
            file: filePath,
            line: idx + 1,
            suggestion: 'Remove leftover `console.log` statement before pushing to production.'
          });
        }
      });
    }

    // Format findings into Markdown report
    const timestamp = new Date().toISOString();
    let reportMarkdown = `# 📋 Git Pre-Commit Audit Report\n\n`;
    reportMarkdown += `**Timestamp**: ${timestamp}\n`;
    reportMarkdown += `**Staged Files Audited**: ${stagedFiles.length}\n\n`;

    if (findings.length === 0 && suggestions.length === 0) {
      reportMarkdown += `✅ **No logic issues or bugs detected in staged files.**\n`;
      console.log('✅ [Pre-Commit Audit Passed] No logic issues detected.');
    } else {
      if (findings.length > 0) {
        reportMarkdown += `## ⚠️ Identified Logic Errors & Bugs (${findings.length})\n\n`;
        findings.forEach(f => {
          reportMarkdown += `### [${f.severity}] ${f.file}:${f.line}\n`;
          reportMarkdown += `- **Issue**: ${f.issue}\n`;
          reportMarkdown += `- **Impact**: ${f.impact}\n\n`;
        });
        console.log(`⚠️  Found ${findings.length} logic issue(s) in staged files. Logged to audit_findings.md.`);
      }

      if (suggestions.length > 0) {
        reportMarkdown += `## 💡 Improvement Suggestions (User Approval Required)\n\n`;
        suggestions.forEach(s => {
          reportMarkdown += `- **${s.file}:${s.line}**: ${s.suggestion}\n`;
        });
        console.log(`💡 Logged ${suggestions.length} improvement suggestion(s).`);
      }
    }

    // Strictly write findings ONLY to audit_findings.md (NEVER touches source files)
    const auditFilePath = path.join(process.cwd(), 'audit_findings.md');
    fs.writeFileSync(auditFilePath, reportMarkdown, 'utf-8');
    console.log(`📝 Full report saved to audit_findings.md\n`);

  } catch (err) {
    console.error('❌ Error during pre-commit audit execution:', err.message);
  }
}

runAudit();
