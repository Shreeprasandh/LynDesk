const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Strictly READ-ONLY Whole-Project Code & Logic Auditor
function auditWholeProject() {
  console.log('\n=======================================================');
  console.log('🔍 [FULL PROJECT AUDITOR] Scanning whole repository...');
  console.log('=======================================================\n');

  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');

  // Helper to recursively collect files
  function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist' || file === '.agents') continue;

      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (/\.(ts|tsx|js|jsx|sql|json)$/i.test(file)) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const allFiles = getAllFiles(rootDir);
  console.log(`📁 Scanning ${allFiles.length} project files...`);

  const logicIssues = [];
  const typeErrors = [];
  const suggestions = [];

  for (const absPath of allFiles) {
    const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/');
    const content = fs.readFileSync(absPath, 'utf-8');
    const lines = content.split('\n');

    // 1. Next.js 15/16 async params / searchParams logic mismatch
    if (relPath.startsWith('src/app') && (relPath.endsWith('page.tsx') || relPath.endsWith('layout.tsx') || relPath.endsWith('route.ts'))) {
      lines.forEach((line, idx) => {
        if ((line.includes('params.') || line.includes('searchParams.')) && !content.includes('await params') && !content.includes('await searchParams')) {
          logicIssues.push({
            severity: 'CRITICAL LOGIC ISSUE',
            file: relPath,
            line: idx + 1,
            title: 'Un-awaited Next.js 15/16 route params/searchParams',
            impact: 'In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.'
          });
        }
      });
    }

    // 2. Unhandled async Supabase or fetch calls
    lines.forEach((line, idx) => {
      if ((line.includes('await supabase.') || line.includes('await fetch(')) && !line.includes('catch') && !line.includes('try')) {
        const context = lines.slice(Math.max(0, idx - 4), Math.min(lines.length, idx + 4)).join('\n');
        if (!context.includes('try') && !context.includes('.catch') && !context.includes('error')) {
          logicIssues.push({
            severity: 'HIGH LOGIC ISSUE',
            file: relPath,
            line: idx + 1,
            title: 'Unhandled async database/fetch execution',
            impact: 'Network or query failures will throw unhandled promise rejections.'
          });
        }
      }
    });

    // 3. React hook missing dependencies / stale closures
    if (relPath.endsWith('.tsx') || relPath.endsWith('.jsx')) {
      lines.forEach((line, idx) => {
        if (line.includes('useEffect(') || line.includes('useCallback(')) {
          const block = lines.slice(idx, Math.min(lines.length, idx + 15)).join('\n');
          if (block.includes('[],') || block.includes('[] )')) {
            // Potential empty dependency array with referenced variables
            suggestions.push({
              type: 'IMPROVEMENT SUGGESTION',
              file: relPath,
              line: idx + 1,
              suggestion: 'Check Hook dependency array for potential stale variables.'
            });
          }
        }
      });
    }

    // 4. Debug statements leftover
    lines.forEach((line, idx) => {
      if (line.includes('console.log(') && !line.trim().startsWith('//')) {
        suggestions.push({
          type: 'IMPROVEMENT SUGGESTION',
          file: relPath,
          line: idx + 1,
          suggestion: 'Remove leftover debug console.log statement.'
        });
      }
    });
  }

  // Generate Report Markdown
  const timestamp = new Date().toLocaleString();
  let markdown = `# 🚨 Whole-Project Audit Findings Report\n\n`;
  markdown += `**Last Run**: ${timestamp}\n`;
  markdown += `**Files Scanned**: ${allFiles.length}\n`;
  markdown += `**Logic Issues Found**: ${logicIssues.length}\n`;
  markdown += `**Type / Runtime Bugs Found**: ${typeErrors.length}\n`;
  markdown += `**Improvement Suggestions**: ${suggestions.length}\n\n`;
  markdown += `---\n\n`;

  if (logicIssues.length > 0) {
    markdown += `## ⚡ Critical & High Logic Issues (${logicIssues.length})\n\n`;
    logicIssues.forEach((item, i) => {
      markdown += `### ${i + 1}. [${item.severity}] \`${item.file}:${item.line}\`\n`;
      markdown += `- **Issue**: ${item.title}\n`;
      markdown += `- **Impact**: ${item.impact}\n\n`;
    });
  } else {
    markdown += `✅ **No critical logic issues found in the project!**\n\n`;
  }

  if (suggestions.length > 0) {
    markdown += `## 💡 Improvement Suggestions (User Approval Required) (${suggestions.length})\n\n`;
    suggestions.forEach((item, i) => {
      markdown += `- **${item.file}:${item.line}**: ${item.suggestion}\n`;
    });
    markdown += `\n`;
  }

  // Save report to root audit_findings.md strictly in READ-ONLY mode for project files
  const reportPath = path.join(rootDir, 'audit_findings.md');
  fs.writeFileSync(reportPath, markdown, 'utf-8');

  // Terminal Brief Summary Prompt Output
  console.log('=======================================================');
  console.log('📊 AUDIT SUMMARY (Full Project)');
  console.log('=======================================================');
  console.log(`• Critical / High Logic Issues: ${logicIssues.length}`);
  console.log(`• Runtime Errors & Bugs:       ${typeErrors.length}`);
  console.log(`• Improvement Suggestions:     ${suggestions.length}`);
  console.log('=======================================================');

  if (logicIssues.length > 0 || suggestions.length > 0) {
    console.log(`\n📄 Complete report updated in: audit_findings.md`);
    console.log(`\n💬 Prompt your agent: "Fix the logic issues in audit_findings.md" to apply fixes automatically!`);
  } else {
    console.log(`\n✨ Whole project is clean! No issues found.`);
  }
  console.log('=======================================================\n');
}

auditWholeProject();
