---
name: wake-up-the-mob
description: Magic setup command. When the user says "Wake up the mob" in a new folder or project, this skill automatically deploys all 6 specialized read-only Mob subagents and installs the automatic git pre-commit trigger.
---

# 🕶️ "Wake Up The Mob" Skill

This skill manages **The Mob** - an automated squad of 6 specialized READ-ONLY AI auditors.

## 🔮 Flexible Magic Wake-Up Phrases
Saying **ANY** of these phrases will deploy/wake up The Mob and remove any pause flag:
- `wake up mob`
- `wakeup mob`
- `wakeup the mob`
- `wake up the mob`

## ⏸️ Disable / Halt Phrases
Saying **ANY** of these phrases will pause pre-commit auditing until re-awakened:
- `disable the mob`
- `disable mob`
- `halt mob`
- `sleep mob`

---

## 👥 The 6 Mob Squad Members

1. **🕵️‍♂️ Logic Auditor (`logic-auditor`)**: Deep logic mismatches, Next.js 15/16 async params, unhandled promises.
2. **🛡️ Secret Sentinel (`secret-sentinel`)**: Hardcoded API keys, exposed secrets, unauthenticated route leaks.
3. **🎯 Schema Validator (`schema-validator`)**: UI payloads vs. SQL schema alignment, client type safety.
4. **♿ UI & A11y Inspector (`a11y-inspector`)**: Accessibility violations, missing ARIA labels, image alt attributes.
5. **🧪 Test Sentinel (`test-sentinel`)**: API route test coverage, unhandled mock rejections.
6. **⚡ Performance Accelerator (`perf-accelerator`)**: Leftover debug logs, bundle size overhead.

---

## ⚙️ Rules & Contracts

- **Execution Trigger**: **`git commit`** ONLY (when Mob is active).
- **Report Location**: Single master file [`mob_audit_report.md`](file:///C:/Users/shree/shree_projects/eventtracker/mob_audit_report.md).
- **Strict Read-Only**: Subagents NEVER modify project code.
- **Fixing Command**: **`"Fix mob report"`** (Main agent applies approved fixes).
- **Mandatory Approval for Large Changes**: If fixing an issue requires touching >3 files, refactoring core architecture, or altering data schemas, the agent MUST present a plan and ask for explicit user permission first.
