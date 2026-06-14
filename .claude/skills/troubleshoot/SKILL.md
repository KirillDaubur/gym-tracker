---
name: troubleshoot
description: Investigate bugs, failing tests, errors, or repeated unsuccessful fixes before making code changes.
---

# Debug First

Use when:
- A bug or error is reported.
- A test or command fails.
- A previous fix did not work.
- The user asks for investigation or root-cause analysis.

## Rule

Do not change code immediately.

First investigate and explain the failure.

## Required Output

1. Observed facts
2. Possible causes (ranked by likelihood)
3. Most likely cause
4. Evidence supporting it
5. Evidence contradicting it
6. Diagnostics to confirm or reject it
7. Files, logs, tests, or commands to inspect next

## Workflow

1. Review errors, logs, failing tests, commands, and recent changes.
2. Identify the exact failure point.
3. Generate 3-5 hypotheses.
4. Rank them by likelihood.
5. For the leading hypothesis:
   - Explain how to prove or disprove it.
   - Specify the next diagnostic step.
6. Only after evidence is gathered, propose a minimal fix.
7. Ask before making code changes unless implementation was explicitly requested.

## Constraints

- Separate facts from assumptions.
- Base hypotheses on observable evidence.
- Do not repeat failed fixes.
- Do not make broad refactors.
- Prefer small, reversible changes.
- Provide a verification command and expected result.