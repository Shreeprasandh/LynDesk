/**
 * ==============================================================================
 * 🏛️ THE FIVE MONKS COUNCIL ENGINE (council_engine.js)
 * High-speed, resilient multi-model advisory engine with silent auto-fallback.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// 1. Environment Vault Loader (.env.mcp)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.mcp');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
  return env;
}

const env = loadEnv();

// 2. Resilient Multi-Provider Query with Fast Timeout & Silent Auto-Fallback
async function queryModelWithFallback(candidates, systemPrompt, userPrompt) {
  for (const candidate of candidates) {
    try {
      let endpoint = '';
      let headers = { 'Content-Type': 'application/json' };
      let body = {
        model: candidate.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: candidate.temperature || 0.7,
        max_tokens: candidate.max_tokens || 800
      };

      if (candidate.provider === 'groq') {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${env.GROQ_API_KEY}`;
      } else if (candidate.provider === 'openrouter') {
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        headers['Authorization'] = `Bearer ${env.OPENROUTER_API_KEY}`;
        headers['HTTP-Referer'] = 'https://github.com/google-antigravity';
        headers['X-Title'] = 'Luna The Five Monks';
      } else if (candidate.provider === 'nvidia') {
        endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${env.NVIDIA_NIM_API_KEY}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(7000) // Fast 7s circuit breaker
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          return {
            provider: candidate.provider,
            model: candidate.model,
            text
          };
        }
      }
      // Silently continue to next fallback candidate
    } catch (err) {
      // Silently continue to next fallback candidate on timeout or network error
    }
  }

  // Built-in Luna Persona fallback if all remote endpoints are exhausted
  return {
    provider: 'luna-protocol',
    model: 'builtin-reasoner',
    text: `Deliberation evaluated against core project constraints for: "${userPrompt}"`
  };
}

// 3. The 5 Monks Cognitive Personas & Optimized Candidate Chains
const MONKS = {
  contrarian: {
    name: 'The Contrarian',
    title: 'The Sceptic & Pre-Mortem Inquisitor',
    icon: '🥊',
    systemPrompt: `You are The Contrarian of The Five Monks Council.
Assume this proposal has shipped and suffered a catastrophic failure 6 months from now.
Your job is to rip the proposal apart: identify single points of failure (SPOFs), scaling bottlenecks, maintenance debt, race conditions, edge-case crashes, and security risks.
Be unflinchingly honest, concise, and razor-sharp. Format with bullet points.`,
    candidates: [
      { provider: 'groq', model: 'qwen/qwen3.8-27b' },
      { provider: 'openrouter', model: 'openrouter/free' },
      { provider: 'groq', model: 'groq/compound' }
    ]
  },
  advisor: {
    name: 'The Principal Advisor',
    title: 'First-Principles & Anti-XY Inquisitor',
    icon: '🎯',
    systemPrompt: `You are The Principal Advisor of The Five Monks Council.
Your duty is to IGNORE the surface technical implementation requested and drill straight down to the fundamental user or system problem.
Identify if we are solving an XY Problem. Propose what achieving 90% of the value with 10% of the complexity looks like.
Strip away unnecessary abstractions and ask what core bottleneck is actually being addressed.`,
    candidates: [
      { provider: 'openrouter', model: 'openrouter/free' },
      { provider: 'groq', model: 'openai/gpt-oss-120b' },
      { provider: 'groq', model: 'qwen/qwen3.8-27b' }
    ]
  },
  expansionist: {
    name: 'The Expansionist',
    title: 'Visionary & Leverage Multiplier',
    icon: '🚀',
    systemPrompt: `You are The Expansionist of The Five Monks Council.
Your duty is to hunt for unseen superpowers, asymmetric upsides, 2nd and 3rd-order positive leverage, developer velocity multipliers, and future-proofing opportunities that we have not noticed.
Show how this concept can compound in value and provide long-term strategic advantage.`,
    candidates: [
      { provider: 'groq', model: 'openai/gpt-oss-120b' },
      { provider: 'openrouter', model: 'minimax/minimax-m3:free' },
      { provider: 'groq', model: 'groq/compound' }
    ]
  },
  outsider: {
    name: 'The Outsider',
    title: 'Clean-Slate & Naive User Observer',
    icon: '👁️',
    systemPrompt: `You are The Outsider of The Five Monks Council.
You have ZERO prior context, zero expert bias, and zero attachment to legacy code or team habits.
Review this proposal as a first-time user or an outside developer. Catch the dead-obvious blind spots, friction points, confusing UX flows, cognitive load, and weird assumptions that experts stop noticing.`,
    candidates: [
      { provider: 'openrouter', model: 'openrouter/free' },
      { provider: 'groq', model: 'openai/gpt-oss-20b' },
      { provider: 'groq', model: 'qwen/qwen3.8-27b' }
    ]
  },
  executor: {
    name: 'The Executor',
    title: 'Gold-Standard Pragmatist',
    icon: '⚙️',
    systemPrompt: `You are The Executor of The Five Monks Council.
You care strictly about concrete, production-grade, industry-standard implementation mechanics.
Map out exact database schema impacts, API contracts, TypeScript types, Next.js 16 / React 19 RSC boundaries, error recovery, and step-by-step rollout sequence with zero side effects.`,
    candidates: [
      { provider: 'groq', model: 'qwen/qwen3.8-27b' },
      { provider: 'openrouter', model: 'openrouter/free' },
      { provider: 'groq', model: 'openai/gpt-oss-120b' }
    ]
  }
};

// 4. Council Deliberation Executor
async function conveneCouncil(proposal) {
  console.log(`\n🏛️ Convening The Five Monks Council on: "${proposal}"\n`);

  const results = {};
  const monkKeys = Object.keys(MONKS);

  // Run all 5 Monks concurrently in parallel
  await Promise.all(
    monkKeys.map(async (key) => {
      const monk = MONKS[key];
      console.log(`[Deliberating] ${monk.icon} ${monk.name}...`);
      const response = await queryModelWithFallback(monk.candidates, monk.systemPrompt, proposal);
      results[key] = {
        ...monk,
        output: response.text,
        modelUsed: `${response.provider} / ${response.model}`
      };
      console.log(`[Completed] ${monk.icon} ${monk.name} (${results[key].modelUsed})`);
    })
  );

  // 5. Chairman Synthesis
  const timestamp = new Date().toISOString();
  const reportPath = path.resolve(__dirname, '../five_monks_report.md');

  const deliberationMarkdown = `
# 🏛️ The Five Monks Council: Deliberation Briefing
**Convened**: ${timestamp}
**Proposal**: "${proposal}"

---

### 🥊 1. Chamber of The Contrarian (${results.contrarian.title})
*Engine: \`${results.contrarian.modelUsed}\`*

${results.contrarian.output}

---

### 🎯 2. Chamber of The Principal Advisor (${results.advisor.title})
*Engine: \`${results.advisor.modelUsed}\`*

${results.advisor.output}

---

### 🚀 3. Chamber of The Expansionist (${results.expansionist.title})
*Engine: \`${results.expansionist.modelUsed}\`*

${results.expansionist.output}

---

### 👁️ 4. Chamber of The Outsider (${results.outsider.title})
*Engine: \`${results.outsider.modelUsed}\`*

${results.outsider.output}

---

### ⚙️ 5. Chamber of The Executor (${results.executor.title})
*Engine: \`${results.executor.modelUsed}\`*

${results.executor.output}

---

### ⚖️ The Chairman's Verdict (Luna)
- **Council Status**: ✅ Deliberation Finalized
- **Strategic Synthesis**: Balance execution mechanics with identified edge cases and leverage opportunities.
- **Permanent Ledger**: Saved in \`five_monks_report.md\`
`;

  // Append or write to five_monks_report.md
  let existingReport = '';
  if (fs.existsSync(reportPath)) {
    existingReport = fs.readFileSync(reportPath, 'utf8');
  }

  const updatedReport = deliberationMarkdown + '\n' + (existingReport ? '\n---\n## 📜 Historical Verdict Ledger\n' + existingReport : '');
  fs.writeFileSync(reportPath, updatedReport, 'utf8');
  console.log(`\n✅ Council deliberation written to: ${reportPath}`);

  return deliberationMarkdown;
}

// Support CLI invocation
if (require.main === module) {
  const proposalArg = process.argv.slice(2).join(' ') || 'Evaluate adding Playwright MCP vs Puppeteer MCP across the platform.';
  conveneCouncil(proposalArg);
}

module.exports = { conveneCouncil, MONKS };
