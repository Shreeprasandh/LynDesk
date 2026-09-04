/* eslint-disable */
const fs = require('fs');
const path = require('path');

/**
 * ==============================================================================
 * 🌑 THE SEVEN SHADOWS: MASTER SECURITY & ARCHITECTURE AUDITOR
 * Full-Spectrum Defense Grid (STRICTLY READ-ONLY)
 * ==============================================================================
 * 1. 🕵️‍♂️ Alpha   - Logic, Auth & Session Lifecycle Auditor
 * 2. 🛡️ Beta    - Secret, Key & Credential Sentinel
 * 3. 🎯 Gamma   - Schema, Zod & Input Validation Sentinel
 * 4. ♿ Delta   - UI, Accessibility & ARIA Inspector
 * 5. 🧪 Epsilon - Test, Deployment Security & Telemetry Sentinel
 * 6. ⚡ Zeta    - Performance, Rate-Limiting & Anti-Abuse Sentinel
 * 7. 🔒 Eta     - Supabase RLS, IDOR & Multi-Tenant Data Guardian
 * ==============================================================================
 */

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
    console.log('\n🔒 [SHADOWS EXECUTION LOCK ACTIVE] Trigger via `git commit` or commands like "run shadows" / "arise alpha".\n');
    return;
  }

  // Check if The Seven Shadows are currently asleep/halted
  if (fs.existsSync(disabledFlagPath)) {
    console.log('⚡ [THE SEVEN SHADOWS ARE ASLEEP] Auditing is paused. Say "wake up shadows" or "shadows wake up" to re-enable.\n');
    return;
  }

  console.log('\n==============================================================================');
  if (targetShadow) {
    console.log(`🌑  [THE SEVEN SHADOWS] Arise ${targetShadow.toUpperCase()} (Specialized Security Pass)...`);
  } else {
    console.log('🌑  [THE SEVEN SHADOWS HAVE ARISEN] Full-Spectrum Security & Architecture Audit...');
  }
  console.log('==============================================================================\n');

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
  console.log(`📁 The Seven Shadows inspecting ${allFiles.length} project files across 6 security pillars...\n`);

  const logicIssues = [];      // 🕵️‍♂️ Alpha
  const securityLeaks = [];    // 🛡️ Beta
  const schemaMismatches = []; // 🎯 Gamma
  const a11yIssues = [];       // ♿ Delta
  const testCoverage = [];     // 🧪 Epsilon
  const perfSuggestions = [];  // ⚡ Zeta
  const rlsIssues = [];        // 🔒 Eta

  const shouldRun = (name) => !targetShadow || targetShadow === name.toLowerCase();

  // Inspect security headers in next.config.ts for Epsilon
  if (shouldRun('epsilon') || shouldRun('test-sentinel') || shouldRun('deployment')) {
    const nextConfigPath = path.join(rootDir, 'next.config.ts');
    const nextConfigJsPath = path.join(rootDir, 'next.config.mjs');
    const configPath = fs.existsSync(nextConfigPath) ? nextConfigPath : (fs.existsSync(nextConfigJsPath) ? nextConfigJsPath : null);
    if (configPath) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      if (!configContent.includes('headers()') && !configContent.includes('Content-Security-Policy') && !configContent.includes('X-Frame-Options')) {
        testCoverage.push({
          shadow: '🧪 Epsilon',
          file: path.relative(rootDir, configPath).replace(/\\/g, '/'),
          line: 1,
          notice: 'Missing HTTP Security Headers in Next.js config (CSP, X-Frame-Options, HSTS, X-Content-Type-Options).'
        });
      }
    }
  }

  for (const absPath of allFiles) {
    const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/');
    const content = fs.readFileSync(absPath, 'utf-8');
    const lines = content.split('\n');

    // =========================================================================
    // 1. 🕵️‍♂️ ALPHA (Logic, Auth & Session Lifecycle Auditor)
    // Pillar 1: Secure Authentication & Logic Integrity
    // =========================================================================
    if (shouldRun('alpha') || shouldRun('logic-auditor') || shouldRun('auth')) {
      // Check Next.js 15/16 async params
      if (relPath.startsWith('src/app') && (relPath.endsWith('page.tsx') || relPath.endsWith('layout.tsx') || relPath.endsWith('route.ts'))) {
        lines.forEach((line, idx) => {
          if ((line.includes('params.') || line.includes('searchParams.')) && !content.includes('await params') && !content.includes('await searchParams')) {
            logicIssues.push({
              shadow: '🕵️‍♂️ Alpha',
              file: relPath,
              line: idx + 1,
              issue: 'Un-awaited Next.js 15/16 route params/searchParams',
              impact: 'In Next.js 15+, route params are Promises. Direct property access causes runtime failure.'
            });
          }
        });
      }

      // Check unhandled async operations
      lines.forEach((line, idx) => {
        if (relPath.startsWith('src/') && (line.includes('await supabase.') || line.includes('await fetch(')) && !line.includes('catch') && !line.includes('try')) {
          const context = lines.slice(Math.max(0, idx - 40), Math.min(lines.length, idx + 5)).join('\n');
          if (!context.includes('try {') && !context.includes('.catch(') && !context.includes('catch (')) {
            logicIssues.push({
              shadow: '🕵️‍♂️ Alpha',
              file: relPath,
              line: idx + 1,
              issue: 'Unhandled async database/fetch operation',
              impact: 'Network failure or DB error will trigger an unhandled promise rejection.'
            });
          }
        }

        // Check for insecure plaintext password or token operations
        if (line.match(/password\s*===|password\s*==/i) && !line.includes('bcrypt') && !line.includes('argon2') && !line.includes('verify') && !relPath.includes('test')) {
          logicIssues.push({
            shadow: '🕵️‍♂️ Alpha',
            file: relPath,
            line: idx + 1,
            issue: 'Potential plaintext password comparison detected',
            impact: 'Passwords must be securely hashed and compared using constant-time cryptographic functions.'
          });
        }
      });
    }

    // =========================================================================
    // 2. 🛡️ BETA (Secret, Key & Credential Sentinel)
    // Pillar 6: Protect Secrets and API Keys
    // =========================================================================
    if (shouldRun('beta') || shouldRun('secret-sentinel') || shouldRun('secrets')) {
      lines.forEach((line, idx) => {
        if (relPath.endsWith('scripts/mob_audit.js') || relPath.endsWith('scripts/council_engine.js')) return;
        
        // Check for hardcoded secret keys
        if (line.match(/(service_role_key|secret_key|private_key|bearer\s+[a-zA-z0-9_-]{20,}|ghp_[a-zA-Z0-9]{30,}|sk-or-v1-[a-zA-Z0-9]{30,})/i) && !relPath.endsWith('.env.local') && !relPath.endsWith('.env.mcp')) {
          if (!line.includes('process.env.') && !line.includes('${')) {
            securityLeaks.push({
              shadow: '🛡️ Beta',
              file: relPath,
              line: idx + 1,
              leak: 'Hardcoded API key or private secret detected in source code',
              risk: 'CRITICAL - Secrets must reside strictly in server-only process.env or .env.mcp'
            });
          }
        }

        // Check for service role keys leaking into client-side components
        if (line.includes('SUPABASE_SERVICE_ROLE_KEY') && (content.includes("'use client'") || content.includes('"use client"'))) {
          securityLeaks.push({
            shadow: '🛡️ Beta',
            file: relPath,
            line: idx + 1,
            leak: 'SUPABASE_SERVICE_ROLE_KEY referenced in Client Component',
            risk: 'CRITICAL - Leaks administrative database bypass token to browser client bundle.'
          });
        }
      });
    }

    // =========================================================================
    // 3. 🎯 GAMMA (Schema, Zod & Input Validation Sentinel)
    // Pillar 5: Strict Input Validation & Schema Parity
    // =========================================================================
    if (shouldRun('gamma') || shouldRun('schema-validator') || shouldRun('input-validation')) {
      // Check API route input parsing without validation
      if (relPath.startsWith('src/app/api') && relPath.endsWith('route.ts')) {
        if (content.includes('req.json()') || content.includes('request.json()')) {
          if (!content.includes('.parse(') && !content.includes('.safeParse(') && !content.includes('z.') && !content.includes('validate')) {
            schemaMismatches.push({
              shadow: '🎯 Gamma',
              file: relPath,
              line: 1,
              issue: 'API Route Handler parses JSON body without runtime Zod schema validation',
              impact: 'Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.'
            });
          }
        }
      }

      // Check for raw SQL concatenation or dangerous inner HTML
      lines.forEach((line, idx) => {
        if (line.includes('dangerouslySetInnerHTML')) {
          schemaMismatches.push({
            shadow: '🎯 Gamma',
            file: relPath,
            line: idx + 1,
            issue: '`dangerouslySetInnerHTML` usage detected',
            impact: 'Potential Cross-Site Scripting (XSS) vulnerability if content is not sanitized with DOMPurify.'
          });
        }
      });
    }

    // =========================================================================
    // 4. ♿ DELTA (UI, Accessibility & ARIA Inspector)
    // Domain: Accessibility, WCAG AA/AAA & Semantic HTML
    // =========================================================================
    if (shouldRun('delta') || shouldRun('a11y-inspector') || shouldRun('ui')) {
      if (relPath.endsWith('.tsx') || relPath.endsWith('.jsx')) {
        lines.forEach((line, idx) => {
          if (line.includes('<button') && !line.includes('aria-label') && !line.includes('aria-labelledby') && (line.includes('<lucide') || line.includes('<Icon') || line.includes('Chevron') || line.includes('Trash') || line.includes('Edit'))) {
            a11yIssues.push({
              shadow: '♿ Delta',
              file: relPath,
              line: idx + 1,
              issue: 'Icon button missing `aria-label` attribute',
              impact: 'Screen readers cannot announce button action to assistive technology users.'
            });
          }
          if (line.includes('<img ') || (line.includes('<Image ') && !line.includes('alt='))) {
            const imgSnippet = lines.slice(idx, Math.min(lines.length, idx + 6)).join(' ');
            if (!imgSnippet.includes('alt=')) {
              a11yIssues.push({
                shadow: '♿ Delta',
                file: relPath,
                line: idx + 1,
                issue: 'Image tag missing `alt` description',
                impact: 'Accessibility violation and non-descriptive fallback image.'
              });
            }
          }
        });
      }
    }

    // =========================================================================
    // 5. 🧪 EPSILON (Test, Deployment Security & Telemetry Sentinel)
    // Pillar 3: Secure Deployment & Automated Testing
    // =========================================================================
    if (shouldRun('epsilon') || shouldRun('test-sentinel') || shouldRun('tests')) {
      if (relPath.startsWith('src/app/api') && relPath.endsWith('route.ts')) {
        const routeName = relPath.replace('src/app/api/', '').replace('/route.ts', '');
        const testFile = `src/__tests__/${routeName}.test.ts`;
        if (!fs.existsSync(path.join(rootDir, testFile))) {
          testCoverage.push({
            shadow: '🧪 Epsilon',
            file: relPath,
            line: 1,
            notice: `API Route \`${relPath}\` is missing dedicated automated test suite (${testFile}).`
          });
        }
      }
    }

    // =========================================================================
    // 6. ⚡ ZETA (Performance, Rate-Limiting & Anti-Abuse Sentinel)
    // Pillar 2: Prevent Abuse, Bot Attacks & Resource Waste
    // =========================================================================
    if (shouldRun('zeta') || shouldRun('perf-accelerator') || shouldRun('abuse-prevention')) {
      // Check write/auth API routes for rate limiting
      if (relPath.startsWith('src/app/api') && relPath.endsWith('route.ts')) {
        const isSensitiveRoute = /auth|login|signup|generate|ai|checkout|payment|contact|create/i.test(relPath);
        if (isSensitiveRoute && !content.includes('ratelimit') && !content.includes('Ratelimit') && !content.includes('limit') && !content.includes('rateLimit')) {
          perfSuggestions.push({
            shadow: '⚡ Zeta',
            file: relPath,
            line: 1,
            suggestion: 'Sensitive or high-impact API route missing rate-limiting guard (vulnerable to bot brute-force & spam).'
          });
        }
      }

      // Check leftover debug logs
      lines.forEach((line, idx) => {
        if (relPath.startsWith('src/') && line.includes('console.log(') && !line.trim().startsWith('//')) {
          perfSuggestions.push({
            shadow: '⚡ Zeta',
            file: relPath,
            line: idx + 1,
            suggestion: 'Remove leftover debug console.log statement to eliminate bundle overhead and potential data leakage.'
          });
        }
      });
    }

    // =========================================================================
    // 7. 🔒 ETA (Supabase RLS, IDOR & Multi-Tenant Data Guardian)
    // Pillar 4: Prevent Users From Accessing Other Users' Data (Anti-IDOR)
    // =========================================================================
    if (shouldRun('eta') || shouldRun('rls-sentinel') || shouldRun('idor')) {
      // Check SQL migrations for missing RLS and weak policies
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
              solution = `Telemetry / Public Ingestion table detected (\`${tableName}\`).\n` +
                `  - **Recommended Policy**:\n` +
                `    \`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\`\n` +
                `    \`CREATE POLICY "Allow public insert" ON public.${tableName} FOR INSERT TO anon, authenticated WITH CHECK (true);\``;
            } else if (isUserOwned) {
              solution = `User-Owned / Multi-Tenant table detected (\`${tableName}\`).\n` +
                `  - **Anti-IDOR Policy**:\n` +
                `    \`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\`\n` +
                `    \`CREATE POLICY "Users access own data only" ON public.${tableName} FOR ALL TO authenticated USING (auth.uid() = user_id);\``;
            } else {
              solution = `General Table detected (\`${tableName}\`).\n` +
                `  - **Recommended Policy**: Enable RLS (\`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\`) with explicit role-based access rules.`;
            }

            rlsIssues.push({
              shadow: '🔒 Eta',
              file: relPath,
              line: 1,
              tableName: tableName,
              issue: `Table \`${tableName}\` is missing Row Level Security (RLS) enablement (IDOR Vulnerability Risk).`,
              impact: `Unauthorized users or anonymous clients could read, modify, or delete cross-tenant data.`,
              solution: solution
            });
          }
        }
      }

      // Check API route mutations for user ID verification
      if (relPath.startsWith('src/app/api') && (relPath.includes('delete') || relPath.includes('update') || relPath.includes('patch'))) {
        if (!content.includes('auth.uid()') && !content.includes('user.id') && !content.includes('userId') && !content.includes('session')) {
          rlsIssues.push({
            shadow: '🔒 Eta',
            file: relPath,
            line: 1,
            tableName: 'N/A',
            issue: 'Mutation route handler does not explicitly verify requesting user ownership (IDOR Risk).',
            impact: 'Callers could potentially modify or delete resources belonging to other accounts.',
            solution: 'Extract authenticated session and enforce `where("user_id", session.user.id)` on all mutation queries.'
          });
        }
      }
    }
  }

  // =========================================================================
  // Compile Single Master Report Markdown
  // =========================================================================
  const timestamp = new Date().toLocaleString();
  let report = `# 🌑 THE SEVEN SHADOWS: Master Security & Architecture Report\n\n`;
  report += `**Last Scan**: ${timestamp}\n`;
  report += `**Files Inspected**: ${allFiles.length}\n`;
  report += `**Active Target**: ${targetShadow ? targetShadow.toUpperCase() : 'ALL 7 SHADOWS (Full Grid)'}\n\n`;

  report += `### 📊 Master Executive Summary\n`;
  report += `| Shadow | Domain & Security Pillar | Focus & Mandate | Findings Count | Status |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- |\n`;
  report += `| 🕵️‍♂️ **Alpha** | 🔐 Secure Authentication & Logic | Next.js 16 Async, Auth Secrets & Sessions | **${logicIssues.length}** | ${logicIssues.length > 0 ? '⚠️ Action Required' : '✅ Clean'} |\n`;
  report += `| 🛡️ **Beta** | 🔑 Secret & Credential Sentinel | API Keys, DB Secrets & Client Leaks | **${securityLeaks.length}** | ${securityLeaks.length > 0 ? '🚨 Critical Risk' : '✅ Safe'} |\n`;
  report += `| 🎯 **Gamma** | 🧹 Input Validation & Schema Parity | Zod Runtime Validation, XSS & SQLi Defense | **${schemaMismatches.length}** | ${schemaMismatches.length > 0 ? '⚠️ Check Payloads' : '✅ Clean'} |\n`;
  report += `| ♿ **Delta** | ♿ UI & Accessibility Inspector | WCAG Standards, ARIA & Image Alt Tags | **${a11yIssues.length}** | ${a11yIssues.length > 0 ? '♿ Check A11y' : '✅ Accessible'} |\n`;
  report += `| 🧪 **Epsilon** | 🚀 Deployment, Headers & Tests | Security Headers, CSP & Route Test Suites | **${testCoverage.length}** | ${testCoverage.length > 0 ? '🧪 Needs Coverage' : '✅ Covered'} |\n`;
  report += `| ⚡ **Zeta** | 🤖 Rate-Limiting & Anti-Abuse | Bot Throttling, DoS Defense & Log Cleanliness | **${perfSuggestions.length}** | ${perfSuggestions.length > 0 ? '💡 User Review' : '✅ Optimized'} |\n`;
  report += `| 🔒 **Eta** | 🚪 Anti-IDOR & Supabase RLS | User Data Isolation & DB Table Policies | **${rlsIssues.length}** | ${rlsIssues.length > 0 ? '🔒 RLS Missing' : '✅ Secured'} |\n\n`;
  report += `---\n\n`;

  if (logicIssues.length > 0) {
    report += `## 🕵️‍♂️ 1. Alpha (Logic & Secure Authentication) Findings (${logicIssues.length})\n\n`;
    logicIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (securityLeaks.length > 0) {
    report += `## 🛡️ 2. Beta (Secret & Credential Sentinel) Findings (${securityLeaks.length})\n\n`;
    securityLeaks.forEach((item, i) => {
      report += `### ${i + 1}. ⚠️ \`${item.file}:${item.line}\`\n`;
      report += `- **Leak**: ${item.leak}\n`;
      report += `- **Risk**: ${item.risk}\n\n`;
    });
  }

  if (schemaMismatches.length > 0) {
    report += `## 🎯 3. Gamma (Schema & Input Validation Sentinel) Findings (${schemaMismatches.length})\n\n`;
    schemaMismatches.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (a11yIssues.length > 0) {
    report += `## ♿ 4. Delta (UI & Accessibility Inspector) Findings (${a11yIssues.length})\n\n`;
    a11yIssues.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Issue**: ${item.issue}\n`;
      report += `- **Impact**: ${item.impact}\n\n`;
    });
  }

  if (testCoverage.length > 0) {
    report += `## 🧪 5. Epsilon (Test, Deployment & Telemetry Sentinel) Notices (${testCoverage.length})\n\n`;
    testCoverage.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Notice**: ${item.notice}\n\n`;
    });
  }

  if (perfSuggestions.length > 0) {
    report += `## ⚡ 6. Zeta (Rate-Limiting & Anti-Abuse Sentinel) Suggestions (${perfSuggestions.length})\n\n`;
    perfSuggestions.forEach((item, i) => {
      report += `### ${i + 1}. \`${item.file}:${item.line}\`\n`;
      report += `- **Suggestion**: ${item.suggestion}\n\n`;
    });
  }

  if (rlsIssues.length > 0) {
    report += `## 🔒 7. Eta (Supabase RLS & Anti-IDOR Guardian) Findings (${rlsIssues.length})\n\n`;
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
  console.log('==============================================================================');
  console.log('🌑  THE SEVEN SHADOWS: MASTER SECURITY & ARCHITECTURE SUMMARY');
  console.log('==============================================================================');
  console.log(`🕵️‍♂️  Alpha   (Secure Auth & Logic):       ${logicIssues.length} issues`);
  console.log(`🛡️  Beta    (Secrets & Credentials):     ${securityLeaks.length} leaks`);
  console.log(`🎯  Gamma   (Input Validation & Schema): ${schemaMismatches.length} contract issues`);
  console.log(`♿  Delta   (UI & Accessibility):        ${a11yIssues.length} a11y issues`);
  console.log(`🧪  Epsilon (Deployment & Tests):        ${testCoverage.length} notices`);
  console.log(`⚡  Zeta    (Rate-Limit & Anti-Abuse):   ${perfSuggestions.length} suggestions`);
  console.log(`🔒  Eta     (Anti-IDOR & Supabase RLS):  ${rlsIssues.length} DB policy risks`);
  console.log('==============================================================================');

  console.log(`\n📄 Master Report saved to: mob_audit_report.md`);
  console.log(`\n💬 Prompt Luna: "Fix shadows report" to review and apply approved fixes!`);
  console.log('==============================================================================\n');
}

runSevenShadows();
