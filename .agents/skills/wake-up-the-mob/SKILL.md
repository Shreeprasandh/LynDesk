---
name: wake-up-the-mob
description: Magic setup command. Manages The Seven Shadows - an automated squad of 7 specialized read-only AI auditors (Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta).
---

# 🌑 "The Seven Shadows" Protocol

This skill manages **The Seven Shadows** - an automated squad of 7 specialized READ-ONLY AI auditors.

## 🔮 Flexible Magic Wake-Up Phrases (Enable / Unpause)
Saying **ANY** of these phrases will wake up/enable The Seven Shadows and remove any pause flag:
- **Full Squad Wake Up**: `wake up shadows` / `shadows wake up` / `wake up mob`
- **Individual Shadow Wake Up**: `wake up [name]` / `[name] wake up` (e.g. `wake up alpha`, `beta wake up`)

## 🏃 Audit Execution & Arise Commands (Run Audit)
Saying **ANY** of these phrases will trigger an immediate audit run:
- **Full Squad Run**: `arise shadows` / `shadows arise`, `git commit` (pre-commit trigger), `run shadows` / `shadows run`.
- **Individual Shadow Run**:
  - `arise alpha` / `alpha arise` / `run alpha` / `alpha run` (Logic Auditor)
  - `arise beta` / `beta arise` / `run beta` / `beta run` (Secret Sentinel)
  - `arise gamma` / `gamma arise` / `run gamma` / `gamma run` (Schema Validator)
  - `arise delta` / `delta arise` / `run delta` / `delta run` (UI & A11y Inspector)
  - `arise epsilon` / `epsilon arise` / `run epsilon` / `epsilon run` (Test Sentinel)
  - `arise zeta` / `zeta arise` / `run zeta` / `zeta run` (Performance Accelerator)
  - `arise eta` / `eta arise` / `run eta` / `eta run` (RLS & DB Security Guardian)

## ⏸️ Disable / Halt Phrases
Saying **ANY** of these phrases will pause auditing until re-awakened:
- `disable shadows` / `shadows disable`
- `halt shadows` / `shadows halt`
- `sleep shadows` / `shadows sleep`
- `disable mob`

---

## 👥 The Seven Shadows Members

1. **🕵️‍♂️ Alpha (`alpha` / Logic Auditor)**: Deep logic mismatches, Next.js 15/16 async params, unhandled promises.
2. **🛡️ Beta (`beta` / Secret Sentinel)**: Hardcoded API keys, exposed secrets, unauthenticated route leaks.
3. **🎯 Gamma (`gamma` / Schema Validator)**: UI payloads vs. SQL schema alignment, client type safety.
4. **♿ Delta (`delta` / UI & A11y Inspector)**: Accessibility violations, missing ARIA labels, image alt attributes.
5. **🧪 Epsilon (`epsilon` / Test Sentinel)**: API route test coverage, unhandled mock rejections.
6. **⚡ Zeta (`zeta` / Performance Accelerator)**: Leftover debug logs, bundle size overhead.
7. **🔒 Eta (`eta` / RLS Guardian)**: Supabase RLS enablement, insecure policies, smart solution recommendations.

---

## ⚙️ Rules & Contracts

- **Execution Trigger**: **`git commit`** (pre-commit hook with `--commit`) OR explicit user commands like **`"run shadows"`** / **`"shadows run"`** / **`"run alpha"`** ONLY.
- **Strict Execution Lock**: `scripts/mob_audit.js` will automatically halt and abort if executed without `--commit` or `--manual` authorization flags.
- **Report Location**: Single master file [`mob_audit_report.md`](file:///C:/Users/shree/shree_projects/eventtracker/mob_audit_report.md).
- **Strict Read-Only**: Shadows NEVER modify project code.
- **Fixing Command**: **`"Fix shadows report"`** or **`"Fix mob report"`** (Main agent applies approved fixes).
- **Mandatory Approval for Large Changes**: If fixing an issue requires touching >3 files, refactoring core architecture, or altering data schemas, the agent MUST present a plan and ask for explicit user permission first.

