const fs = require('fs');
const path = require('path');

// 🌑 THE SEVEN SHADOWS: Automated 7-Agent Consolidated Auditor (STRICTLY READ-ONLY)
function runSevenShadows() {
  const rootDir = process.cwd();
  const disabledFlagPath = path.join(rootDir, '.mob_disabled');

  const args = process.argv.slice(2);
  const isCommitTrigger = args.includes('--commit') || !!process.env.GIT_DIR || !!process.env.GIT_PREFIX;
  const isManualTrigger = args.includes('--manual') || args.includes('--force') || process.env.MOB_ALLOW_RUN === 'true' || args.some(a => a.startsWith('--shadow=') || a.startsWith('--agent='));

  // Target Shadow Filter (e.g. --shadow=alpha)
  const targetArg = args.find(a => a.startsWith('--shadow=') || a.startsWith('--agent='));
  const targetShadow = targetArg ? targetArg.split('=')[1].toLowerCase() : null;

  if (!isCommitTrigger && !isManualTrigger) {
    console.log('\n🔒 [SHADOWS EXECUTION LOCK ACTIVE] Execution is locked. Trigger via `git commit` or commands like "run shadows" / "run alpha".\n');
    return;
  }

  // Check if The Seven Shadows are currently asleep/halted
  if (fs.existsSync(disabledFlagPath)) {
    console.log('⚡ [THE SEVEN SHADOWS ARE ASLEEP] Auditing is currently disabled. Say "wake up shadows" or "shadows wake up" to re-enable.\n');
    return;
  }

  console.log('\n=======================================================');
  if (targetShadow) {
    console.log(`🌑  [THE SEVEN SHADOWS] Arise ${targetShadow.toUpperCase()}...`);
  } else {
    console.log('🌑  [THE SEVEN SHADOWS HAVE ARISEN] Running 7-Shadow Audit...');
  }
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
  console.log(`📁 Shadows inspecting ${allFiles.length} project files...\n`);

  const logicIssues = [];      // Alpha
  const securityLeaks = [];    // Beta
  const schemaMismatches = []; // Gamma
  const a11yIssues = [];       // Delta
  const testCoverage = [];     // Epsilon
  const perfSuggestions = [];  // Zeta
  const rlsIssues = [];        // Eta

  const shouldRun = (name) => !targetShadow || targetShadow === name.toLowerCase();

  for (const absPath of allFiles) {
    const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/');
    const content = fs.readFileSync(absPath, 'utf-8');
    const lines = content.split('\n');

    // 1. 🕵️‍♂️ ALPHA (Logic Auditor)
    if (shouldRun('alpha') || shouldRun('logic-auditor')) {
      if (relPath.startsWith('src/app') && (relPath.endsWith('page.tsx') || relPath.endsWith('layout.tsx') || relPath.endsWith('route.ts'))) {
        lines.forEach((line, idx) => {
          if ((line.includes('params.') || line.includes('searchParams.')) && !content.includes('await params') && !content.includes('await searchParams')) {
            logicIssues.push({
              shadow: '🕵️‍♂️ Alpha',
              file: relPath,
              line: idx + 1,
              issue: 'Un-awaited Next.js 15/16 route params/searchParams',
              impact: 'In Next.js 15+, route params are Promises. Direct access causes runtime crashes.'
            });
          }
        });
      }

      lines.forEach((line, idx) => {
        if (relPath.startsWith('src/') && (line.includes('await supabase.') || line.includes('await fetch(')) && !line.includes('catch') && !line.includes('try')) {
          const context = lines.slice(Math.max(0, idx - 40), Math.min(lines.length, idx + 5)).join('\n');
          if (!context.includes('try {') && !context.includes('.catch(') && !context.includes('catch (')) {
            logicIssues.push({
              shadow: '🕵️‍♂️ Alpha',
              file: relPath,
              line: idx + 1,
              issue: 'Unhandled async database/fetch operation',
              impact: 'Network failure or DB error will cause unhandled promise rejection.'
            });
          }
        }
      });
    }

    // 2. 🛡️ BETA (Secret Sentinel)
    if (shouldRun('beta') || shouldRun('secret-sentinel')) {
      lines.forEach((line, idx) => {
        if (relPath.endsWith('scripts/mob_audit.js')) return;
        if (line.match(/(service_role_key|secret_key|private_key|bearer\s+[a-zA-z0-9_-]{20,})/i) && !relPath.endsWith('.env.local') && !relPath.endsWith('.env')) {
          if (!line.includes('process.env.')) {
            securityLeaks.push({
              shadow: '🛡️ Beta',
              file: relPath,
              line: idx + 1,
              leak: 'Potential exposed secret or API key token in source code',
              risk: 'CRITICAL - Secrets should only exist in server-side process.env'
            });
          }
        }
      });
    }

    // 3. 🎯 GAMMA (Schema Validator)
    if (shouldRun('gamma') || shouldRun('schema-validator')) {
      lines.forEach((line, idx) => {
        if (line.includes('NEXT_PUBLIC_SUPABASE_URL') && relPath.startsWith('src/app/api') && line.includes('createClient')) {
          schemaMismatches.push({
            shadow: '🎯 Gamma',
            file: relPath,
            line: idx + 1,
            issue: 'API Route Handler using browser Supabase client instead of server admin client',
            impact: 'Server route handlers should use server Supabase client for RLS bypass or proper auth context.'
          });
        }
      });
    }

    // 4. ♿ DELTA (UI & A11y Inspector)
    if (shouldRun('delta') || shouldRun('a11y-inspector')) {
      if (relPath.endsWith('.tsx') || relPath.endsWith('.jsx')) {
        lines.forEach((line, idx) => {
          if (line.includes('<button') && !line.includes('aria-label') && !line.includes('aria-labelledby') && (line.includes('<lucide') || line.includes('<Icon'))) {
            a11yIssues.push({
              shadow: '♿ Delta',
              file: relPath,
              line: idx + 1,
              issue: 'Icon button missing `aria-label` attribute',
              impact: 'Screen readers cannot announce button purpose to visually impaired users.'
            });
          }
          if (line.includes('<img ')) {
            const imgSnippet = lines.slice(idx, Math.min(lines.length, idx + 6)).join(' ');
            if (!imgSnippet.includes('alt=')) {
              a11yIssues.push({
                shadow: '♿ Delta',
                file: relPath,
                line: idx + 1,
                issue: 'HTML <img> tag missing `alt` description',
                impact: 'Accessibility violation and non-descriptive fallback image.'
              });
            }
          }
        });
      }
    }

    // 5. 🧪 EPSILON (Test Sentinel)
    if (shouldRun('epsilon') || shouldRun('test-sentinel')) {
      if (relPath.startsWith('src/app/api') && relPath.endsWith('route.ts')) {
        const routeName = relPath.replace('src/app/api/', '').replace('/route.ts', '');
        const testFile = `src/__tests__/${routeName}.test.ts`;
        if (!fs.existsSync(path.join(rootDir, testFile))) {
          testCoverage.push({
            shadow: '🧪 Epsilon',
            file: relPath,
            line: 1,
            notice: `API Route \`${relPath}\` is missing dedicated test suite (${testFile}).`
          });
        }
      }
    }

    // 6. ⚡ ZETA (Performance Accelerator)
    if (shouldRun('zeta') || shouldRun('perf-accelerator')) {
      lines.forEach((line, idx) => {
        if (relPath.startsWith('src/') && line.includes('console.log(') && !line.trim().startsWith('//')) {
          perfSuggestions.push({
            shadow: '⚡ Zeta',
            file: relPath,
            line: idx + 1,
            suggestion: 'Remove leftover debug console.log statement to reduce bundle overhead.'
          });
        }
      });
    }

    // 7. 🔒 ETA (RLS & DB Security Guardian)
    if (shouldRun('eta') || shouldRun('rls-sentinel')) {
      if (relPath.endsWith('.sql') || relPath.includes('supabase/migrations')) {
        const tableRegex = /CREATE\ TABLE\s+(?:IF\ NOT\ EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
        let match;
        const lowerContent = content.toLowerCase();

        while ((match = tableRegex.exec(content)) !== null) {
          const tableName = match[1];
          const isRlsEnabled = lowerContent.includes(`alter table public.${tableName} enable row level security`) || 
                               lowerContent.includes(`alter table ${tableName} enable row level security`);

          if (!isRlsEnabled) {
            const isTelemetryOrPublic = /log|event|inquiry|support|metric|track|feedback|audit/i.test(tableName);
            const isUserOwned = lowerContent.includes('user_id') || lowerContent.includes('profile_id') || lowerContent.includes('student_id') || lowerContent.includes('sender_id');

            let solution = '';
            if (isTelemetryOrPublic) {
              solution = `Telemetry / Public Write table detected (\`${tableName}\`).\n` +
                `  - **Option A (Client Ingestion - Public Write Policy)**:\n` +
                `    \`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\`\n` +
                `    \`CREATE POLICY "Allow public insert" ON public.${tableName} FOR INSERT TO anon, authenticated WITH CHECK (true);\`;\n` +
                `  - **Option B (Server API Route - RLS Bypass)**: Process writes in a Next.js API Route Handler using \`SUPABASE_SERVICE_ROLE_KEY\`.`;
            } else if (isUserOwned) {
              solution = `User-Owned Data table detected (\`${tableName}\`).\n` +
                `  - **Option A (User-Scoped RLS Policy)**:\n` +
                `    \`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\`\n` +
                `    \`CREATE POLICY "Users access own rows" ON public.${tableName} FOR ALL TO authenticated USING (auth.uid() = user_id);\``;
            } else {
              solution = `General Data Table detected (\`${tableName}\`).\n` +
                `  - **Recommended Approach**: Enable RLS (\`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\`) and define explicit SELECT/INSERT role policies, or bypass via Server Admin client.`;
            }

            rlsIssues.push({
              shadow: '🔒 Eta',
              file: relPath,
              line: 1,
              tableName: tableName,
              issue: `Table \`${tableName}\` is missing explicit Row Level Security (RLS) enablement.`,
              impact: `Client-side requests risk exposure or unexpected permission locks.`,
              solution: solution
            });
          }
        }
      }
    }
  }

  // Compile Single Master Report Markdown
  const timestamp = new Date().toLocaleString();
  let report = `# 🌑 THE SEVEN SHADOWS: Master Audit Report\n\n`;
  report += `**Last Scan**: ${timestamp}\n`;
  report += `**Files Inspected**: ${allFiles.length}\n`;
  report += `**Active Target**: ${targetShadow ? targetShadow.toUpperCase() : 'ALL 7 SHADOWS'}\n\n`;

  report += `### 📊 Master Executive Summary\n`;
  report += `| Shadow | Codename | Domain | Findings Count | Status |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- |\n`;
  report += `| 🕵️‍♂️ **Alpha** | Logic Auditor | Logic Mismatches & Async Bugs | **${logicIssues.length}** | ${logicIssues.length > 0 ? '⚠️ Action Required' : '✅ Clean'} |\n`;
  report += `| 🛡️ **Beta** | Secret Sentinel | Security & Secret Leaks | **${securityLeaks.length}** | ${securityLeaks.length > 0 ? '🚨 Critical Risk' : '✅ Safe'} |\n`;
  report += `| 🎯 **Gamma** | Schema Validator | DB & API Contract Alignment | **${schemaMismatches.length}** | ${schemaMismatches.length > 0 ? '⚠️ Check Client' : '✅ Clean'} |\n`;
  report += `| ♿ **Delta** | A11y Inspector | Accessibility & ARIA Compliance | **${a11yIssues.length}** | ${a11yIssues.length > 0 ? '♿ Check A11y' : '✅ Accessible'} |\n`;
  report += `| 🧪 **Epsilon** | Test Sentinel | Route & Unit Test Coverage | **${testCoverage.length}** | ${testCoverage.length > 0 ? '🧪 Needs Coverage' : '✅ Covered'} |\n`;
  report += `| ⚡ **Zeta** | Perf Accelerator | Bundle & Log Optimization | **${perfSuggestions.length}** | ${perfSuggestions.length > 0 ? '💡 User Approval' : '✅ Optimized'} |\n`;
  report += `| 🔒 **Eta** | RLS Guardian | Supabase RLS & DB Policies | **${rlsIssues.length}** | ${rlsIssues.length > 0 ? '🔒 RLS Missing' : '✅ Secured'} |\n\n`;
  report += `---\n\n`;

  if (logicIssues.length > 0) {
    report += `## 🕵️‍♂️ 1. Alpha (Logic Auditor) Findings (${logicIssues.length})\n\n`;
    logicIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (securityLeaks.length > 0) {
    report += `## 🛡️ 2. Beta (Secret Sentinel) Findings (${securityLeaks.length})\n\n`;
    securityLeaks.forEach((item, i) => {
      report += `### ${i + 1}. ⚠️ \`${item.file}:${item.line}\`\n`;
      report += `- **Leak**: ${item.leak}\n`;
      report += `- **Risk**: ${item.risk}\n\n`;
    });
  }

  if (schemaMismatches.length > 0) {
    report += `## 🎯 3. Gamma (Schema Validator) Findings (${schemaMismatches.length})\n\n`;
    schemaMismatches.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (a11yIssues.length > 0) {
    report += `## ♿ 4. Delta (UI & A11y Inspector) Findings (${a11yIssues.length})\n\n`;
    a11yIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (testCoverage.length > 0) {
    report += `## 🧪 5. Epsilon (Test Sentinel) Notices (${testCoverage.length})\n\n`;
    testCoverage.forEach((item, i) => {
      report += `- **${item.file}**: ${item.notice}\n`;
    });
    report += `\n`;
  }

  if (perfSuggestions.length > 0) {
    report += `## ⚡ 6. Zeta (Performance Accelerator) Suggestions (${perfSuggestions.length})\n\n`;
    perfSuggestions.forEach((item) => {
      report += `- **\`${item.file}:${item.line}\`**: ${item.suggestion}\n`;
    });
  }

  if (rlsIssues.length > 0) {
    report += `## 🔒 7. Eta (RLS & DB Security Guardian) Findings (${rlsIssues.length})\n\n`;
    rlsIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\` (Table: \`${item.tableName}\`)\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n`;
      report += `- **💡 Recommended Solution Approach**:\n${item.solution}\n\n`;
    });
  }

  // Write single master report
  fs.writeFileSync(path.join(rootDir, 'mob_audit_report.md'), report, 'utf-8');

  // Print Terminal Executive Summary
  console.log('=======================================================');
  console.log('🌑  THE SEVEN SHADOWS: MASTER AUDIT SUMMARY');
  console.log('=======================================================');
  console.log(`🕵️‍♂️  Alpha (Logic Auditor):     ${logicIssues.length} issues`);
  console.log(`🛡️  Beta (Secret Sentinel):   ${securityLeaks.length} leaks`);
  console.log(`🎯  Gamma (Schema Validator):  ${schemaMismatches.length} contract issues`);
  console.log(`♿  Delta (A11y Inspector):    ${a11yIssues.length} accessibility issues`);
  console.log(`🧪  Epsilon (Test Sentinel):   ${testCoverage.length} untested routes`);
  console.log(`⚡  Zeta (Perf Accelerator):   ${perfSuggestions.length} suggestions`);
  console.log(`🔒  Eta (RLS Guardian):        ${rlsIssues.length} DB policy risks`);
  console.log('=======================================================');

  console.log(`\n📄 Master Report saved to: mob_audit_report.md`);
  console.log(`\n💬 Prompt Luna: "Fix shadows report" to apply approved fixes!`);
  console.log('=======================================================\n');
}

runSevenShadows();
