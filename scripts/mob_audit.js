const fs = require('fs');
const path = require('path');

// 🕶️ THE MOB: Perfected 6-Agent Consolidated Multi-Agent Auditor (STRICTLY READ-ONLY)
function runPerfectedMob() {
  const rootDir = process.cwd();
  const disabledFlagPath = path.join(rootDir, '.mob_disabled');

  // Check if The Mob is currently halted/disabled
  if (fs.existsSync(disabledFlagPath)) {
    console.log('⚡ [THE MOB IS ASLEEP] Mob auditing is currently disabled. Say "wake up the mob" to re-enable.\n');
    return;
  }

  console.log('\n=======================================================');
  console.log('🕶️  [THE MOB IS AWAKE] Running 6-Agent Squad Audit...');
  console.log('=======================================================\n');

  function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (['node_modules', '.next', '.git', 'dist', '.agents'].includes(file)) continue;

      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (/\.(ts|tsx|js|jsx|sql|json|env.*)$/i.test(file)) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const allFiles = getAllFiles(rootDir);
  console.log(`📁 6 Agents inspecting ${allFiles.length} project files...\n`);

  const logicIssues = [];
  const securityLeaks = [];
  const schemaMismatches = [];
  const perfSuggestions = [];
  const a11yIssues = [];
  const testCoverage = [];

  for (const absPath of allFiles) {
    const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/');
    const content = fs.readFileSync(absPath, 'utf-8');
    const lines = content.split('\n');

    // 1. 🕵️‍♂️ LOGIC AUDITOR
    if (relPath.startsWith('src/app') && (relPath.endsWith('page.tsx') || relPath.endsWith('layout.tsx') || relPath.endsWith('route.ts'))) {
      lines.forEach((line, idx) => {
        if ((line.includes('params.') || line.includes('searchParams.')) && !content.includes('await params') && !content.includes('await searchParams')) {
          logicIssues.push({
            agent: '🕵️‍♂️ Logic Auditor',
            file: relPath,
            line: idx + 1,
            issue: 'Un-awaited Next.js 15/16 route params/searchParams',
            impact: 'In Next.js 15+, route params are Promises. Direct access causes runtime crashes.'
          });
        }
      });
    }

    lines.forEach((line, idx) => {
      if ((line.includes('await supabase.') || line.includes('await fetch(')) && !line.includes('catch') && !line.includes('try')) {
        const context = lines.slice(Math.max(0, idx - 4), Math.min(lines.length, idx + 4)).join('\n');
        if (!context.includes('try') && !context.includes('.catch') && !context.includes('error')) {
          logicIssues.push({
            agent: '🕵️‍♂️ Logic Auditor',
            file: relPath,
            line: idx + 1,
            issue: 'Unhandled async database/fetch operation',
            impact: 'Network failure or DB error will cause unhandled promise rejection.'
          });
        }
      }
    });

    // 2. 🛡️ SECRET SENTINEL
    lines.forEach((line, idx) => {
      if (relPath.endsWith('scripts/mob_audit.js')) return;
      if (line.match(/(service_role_key|secret_key|private_key|bearer\s+[a-zA-z0-9_-]{20,})/i) && !relPath.endsWith('.env.local') && !relPath.endsWith('.env')) {
        if (!line.includes('process.env.')) {
          securityLeaks.push({
            agent: '🛡️ Secret Sentinel',
            file: relPath,
            line: idx + 1,
            leak: 'Potential exposed secret or API key token in source code',
            risk: 'CRITICAL - Secrets should only exist in server-side process.env'
          });
        }
      }
    });

    // 3. 🎯 SCHEMA VALIDATOR
    lines.forEach((line, idx) => {
      if (line.includes('NEXT_PUBLIC_SUPABASE_URL') && relPath.startsWith('src/app/api') && line.includes('createClient')) {
        schemaMismatches.push({
          agent: '🎯 Schema Validator',
          file: relPath,
          line: idx + 1,
          issue: 'API Route Handler using browser Supabase client instead of server admin client',
          impact: 'Server route handlers should use server Supabase client for RLS bypass or proper auth context.'
        });
      }
    });

    // 4. ⚡ PERFORMANCE ACCELERATOR
    lines.forEach((line, idx) => {
      if (line.includes('console.log(') && !line.trim().startsWith('//')) {
        perfSuggestions.push({
          agent: '⚡ Perf Accelerator',
          file: relPath,
          line: idx + 1,
          suggestion: 'Remove leftover debug console.log statement to reduce bundle overhead.'
        });
      }
    });

    // 5. ♿ UI & A11Y INSPECTOR
    if (relPath.endsWith('.tsx') || relPath.endsWith('.jsx')) {
      lines.forEach((line, idx) => {
        if (line.includes('<button') && !line.includes('aria-label') && !line.includes('aria-labelledby') && line.includes('<lucide') || line.includes('<Icon')) {
          a11yIssues.push({
            agent: '♿ UI & A11y Inspector',
            file: relPath,
            line: idx + 1,
            issue: 'Icon button missing `aria-label` attribute',
            impact: 'Screen readers cannot announce button purpose to visually impaired users.'
          });
        }
        if (line.includes('<img ') && !line.includes('alt=')) {
          a11yIssues.push({
            agent: '♿ UI & A11y Inspector',
            file: relPath,
            line: idx + 1,
            issue: 'HTML <img> tag missing `alt` description',
            impact: 'Accessibility violation and non-descriptive fallback image.'
          });
        }
      });
    }

    // 6. 🧪 TEST SENTINEL
    if (relPath.startsWith('src/app/api') && relPath.endsWith('route.ts')) {
      const routeName = relPath.replace('src/app/api/', '').replace('/route.ts', '');
      const testFile = `src/__tests__/${routeName}.test.ts`;
      if (!fs.existsSync(path.join(rootDir, testFile))) {
        testCoverage.push({
          agent: '🧪 Test Sentinel',
          file: relPath,
          line: 1,
          notice: `API Route \`${relPath}\` is missing dedicated test suite (${testFile}).`
        });
      }
    }
  }

  // Compile Single Master Report Markdown
  const timestamp = new Date().toLocaleString();
  let report = `# 🕶️ THE MOB: Complete Master Audit Report\n\n`;
  report += `**Last Scan**: ${timestamp}\n`;
  report += `**Files Inspected**: ${allFiles.length}\n`;
  report += `**Auditor Squad**: 6 Specialized READ-ONLY Agents\n\n`;

  report += `### 📊 Master Executive Summary\n`;
  report += `| Subagent | Domain | Findings Count | Status |\n`;
  report += `| :--- | :--- | :--- | :--- |\n`;
  report += `| 🕵️‍♂️ **Logic Auditor** | Logic Mismatches & Async Bugs | **${logicIssues.length}** | ${logicIssues.length > 0 ? '⚠️ Action Required' : '✅ Clean'} |\n`;
  report += `| 🛡️ **Secret Sentinel** | Security & Secret Leaks | **${securityLeaks.length}** | ${securityLeaks.length > 0 ? '🚨 Critical Risk' : '✅ Safe'} |\n`;
  report += `| 🎯 **Schema Validator** | DB & API Contract Alignment | **${schemaMismatches.length}** | ${schemaMismatches.length > 0 ? '⚠️ Check Client' : '✅ Clean'} |\n`;
  report += `| ⚡ **Perf Accelerator** | Bundle & Log Optimization | **${perfSuggestions.length}** | ${perfSuggestions.length > 0 ? '💡 User Approval' : '✅ Optimized'} |\n`;
  report += `| ♿ **UI & A11y Inspector** | Accessibility & ARIA Compliance | **${a11yIssues.length}** | ${a11yIssues.length > 0 ? '♿ Check A11y' : '✅ Accessible'} |\n`;
  report += `| 🧪 **Test Sentinel** | Route & Unit Test Coverage | **${testCoverage.length}** | ${testCoverage.length > 0 ? '🧪 Needs Coverage' : '✅ Covered'} |\n\n`;
  report += `---\n\n`;

  if (logicIssues.length > 0) {
    report += `## 🕵️‍♂️ 1. Logic Auditor Findings (${logicIssues.length})\n\n`;
    logicIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (securityLeaks.length > 0) {
    report += `## 🛡️ 2. Secret Sentinel Findings (${securityLeaks.length})\n\n`;
    securityLeaks.forEach((item, i) => {
      report += `### ${i + 1}. ⚠️ \`${item.file}:${item.line}\`\n`;
      report += `- **Leak**: ${item.leak}\n`;
      report += `- **Risk**: ${item.risk}\n\n`;
    });
  }

  if (schemaMismatches.length > 0) {
    report += `## 🎯 3. Schema Validator Findings (${schemaMismatches.length})\n\n`;
    schemaMismatches.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (a11yIssues.length > 0) {
    report += `## ♿ 4. UI & A11y Inspector Findings (${a11yIssues.length})\n\n`;
    a11yIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (testCoverage.length > 0) {
    report += `## 🧪 5. Test Sentinel Notices (${testCoverage.length})\n\n`;
    testCoverage.forEach((item, i) => {
      report += `- **${item.file}**: ${item.notice}\n`;
    });
    report += `\n`;
  }

  if (perfSuggestions.length > 0) {
    report += `## ⚡ 6. Performance Accelerator Suggestions (User Approval Required) (${perfSuggestions.length})\n\n`;
    perfSuggestions.forEach((item) => {
      report += `- **\`${item.file}:${item.line}\`**: ${item.suggestion}\n`;
    });
  }

  // Write single master report (STRICTLY READ-ONLY on source code)
  fs.writeFileSync(path.join(rootDir, 'mob_audit_report.md'), report, 'utf-8');

  // Print Terminal Executive Summary
  console.log('=======================================================');
  console.log('🕶️  THE MOB: MASTER AUDIT SUMMARY');
  console.log('=======================================================');
  console.log(`🕵️‍♂️  Logic Auditor:     ${logicIssues.length} issues`);
  console.log(`🛡️  Secret Sentinel:   ${securityLeaks.length} leaks`);
  console.log(`🎯  Schema Validator:  ${schemaMismatches.length} contract issues`);
  console.log(`♿  A11y Inspector:    ${a11yIssues.length} accessibility issues`);
  console.log(`🧪  Test Sentinel:     ${testCoverage.length} untested routes`);
  console.log(`⚡  Perf Accelerator:  ${perfSuggestions.length} suggestions`);
  console.log('=======================================================');

  console.log(`\n📄 Single Master Report saved to: mob_audit_report.md`);
  console.log(`\n💬 Prompt your agent: "Fix mob report" to apply approved fixes!`);
  console.log('=======================================================\n');
}

runPerfectedMob();
