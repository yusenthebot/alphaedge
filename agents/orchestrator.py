#!/usr/bin/env python3
"""
AlphaEdge Continuous Multi-Agent Loop
Agents: DESIGNER → CTO → LEAD → ENGINEER → QA → repeat

All communication via shared files in agents/
Auto-restarts on crash, enforces per-phase timeouts.
"""

import subprocess, json, time, os, sys, datetime, re
from pathlib import Path

# ── Config ─────────────────────────────────────────────────────────
ROOT     = Path(__file__).parent
PROJECT  = ROOT.parent
FRONTEND = PROJECT / "src/frontend"
LOG      = ROOT / "orchestrator.log"

CLAUDE_TIMEOUT   = 90    # seconds per claude call
ENGINEER_TIMEOUT = 300   # engineer gets more time
CYCLE_DELAY      = 20    # seconds between cycles

def ts():
    return datetime.datetime.now().strftime("%H:%M:%S")

def log(msg, tag="·"):
    tags = {"◉": "CYCLE", "◈": "AGENT", "✓": "OK", "✗": "ERR", "▸": "INFO"}
    line = f"[{ts()}] {tag} {msg}"
    print(line, flush=True)
    with open(LOG, "a") as f:
        f.write(line + "\n")

# ── State ──────────────────────────────────────────────────────────
STATE = ROOT / "STATE.json"

def get_state():
    try: return json.loads(STATE.read_text())
    except: return {"cycle": 1, "phase": "idle"}

def set_state(**kw):
    s = get_state(); s.update(kw); STATE.write_text(json.dumps(s, indent=2))

def read(name): 
    f = ROOT / name
    return f.read_text()[:800] if f.exists() else "(none)"

def write(name, content):
    (ROOT / name).write_text(content)
    log(f"Wrote {name}", "✓")

# ── LLM ────────────────────────────────────────────────────────────
def ask(prompt: str, agent: str) -> str:
    """Non-interactive claude call with hard timeout."""
    log(f"[{agent}] Asking claude ({len(prompt)} chars)...", "◈")
    try:
        r = subprocess.run(
            ["claude", "-p", prompt, "--output-format", "text"],
            capture_output=True, text=True,
            timeout=CLAUDE_TIMEOUT, cwd=str(PROJECT)
        )
        if r.returncode == 0 and r.stdout.strip():
            log(f"[{agent}] Got response ({len(r.stdout)} chars)", "✓")
            return r.stdout.strip()
        log(f"[{agent}] claude failed: {r.stderr[:100]}", "✗")
        return f"[{agent}: no output]"
    except subprocess.TimeoutExpired:
        log(f"[{agent}] claude timeout after {CLAUDE_TIMEOUT}s", "✗")
        return f"[{agent}: timeout]"
    except Exception as e:
        log(f"[{agent}] error: {e}", "✗")
        return f"[{agent}: error {e}]"

def shell(cmd, cwd=None, timeout=60):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True,
                       timeout=timeout, cwd=str(cwd or PROJECT))
    return r.returncode, r.stdout[-800:], r.stderr[-400:]

# ══════════════════════════════════════════════════════════════════
# AGENT 1: DESIGNER
# Role: Visual/UX quality. Picks 2 pixel art UI improvements.
# ══════════════════════════════════════════════════════════════════
def agent_designer(cycle: int):
    log(f"[DESIGNER] Cycle {cycle} — analyzing UI...", "◈")
    qa = read("QA_REPORT.md")
    backlog = read("BACKLOG.md")

    out = ask(f"""ROLE: Product Designer, AlphaEdge (pixel art CRT trading dashboard, Next.js).
QA from last cycle: {qa[:400]}
Backlog: {backlog[:400]}

Pick 2 concrete UI improvements. For each:
- File: src/frontend/src/[exact path]
- Change: [exact CSS class or JSX tweak]
- Why: [1 sentence]

Format:
## Task 1: [name]
File: ...
Change: ...
Why: ...

## Task 2: [name]
File: ...
Change: ...
Why: ...

Keep total under 200 words. Be specific.""", "DESIGNER")

    write("DESIGN_SPEC.md", f"# Design — Cycle {cycle} [{ts()}]\n\n{out}")

# ══════════════════════════════════════════════════════════════════
# AGENT 2: CTO
# Role: Tech quality. Picks 1 bug fix + 1 tech improvement.
# ══════════════════════════════════════════════════════════════════
def agent_cto(cycle: int):
    log(f"[CTO] Cycle {cycle} — reviewing tech...", "◈")
    qa = read("QA_REPORT.md")

    # Check build
    rc, out, err = shell("npm run build 2>&1 | tail -8", cwd=FRONTEND, timeout=60)
    build = "PASS" if rc == 0 else f"FAIL:\n{err[:300]}"

    out2 = ask(f"""ROLE: CTO, AlphaEdge (Next.js 16, Tailwind v4, FastAPI backend, SQLite).
Build: {build}
QA report: {qa[:400]}

Identify ONE priority technical task:
- Fix a build error / TypeScript issue, OR
- Add error handling / performance optimization, OR
- Implement a small but valuable feature

Format:
## Tech Priority: [name]
File: src/frontend/src/[path]
Issue: [what's wrong or missing]
Fix: [exact code change or approach]
Test: [how to verify]

Under 150 words.""", "CTO")

    write("TECH_SPEC.md", f"# Tech — Cycle {cycle} [{ts()}]\n\n{out2}")

# ══════════════════════════════════════════════════════════════════
# AGENT 3: LEAD (Project Manager)
# Role: Synthesizes DESIGNER + CTO into a tight sprint plan.
# ══════════════════════════════════════════════════════════════════
def agent_lead(cycle: int):
    log(f"[LEAD] Cycle {cycle} — creating sprint...", "◈")
    design = read("DESIGN_SPEC.md")
    tech   = read("TECH_SPEC.md")

    out = ask(f"""ROLE: Lead/PM, AlphaEdge. Create sprint for the engineer.
DESIGNER wants: {design[:350]}
CTO wants: {tech[:350]}

Rules: max 2 tasks, each MUST have exact file path + exact change description.
Prefer bugs/fixes over features. Be specific enough that engineer can implement with no questions.

Format (use exactly):
# SPRINT {cycle}

## Task 1: [name]
File: src/frontend/src/[path]
Change: [precise description of what to add/modify/delete]
Done when: [verifiable condition]

## Task 2: [name]
File: src/frontend/src/[path]
Change: [precise description]
Done when: [verifiable condition]

Under 200 words.""", "LEAD")

    write("SPRINT.md", f"# Sprint — Cycle {cycle} [{ts()}]\n\n{out}")

# ══════════════════════════════════════════════════════════════════
# AGENT 4: ENGINEER
# Role: Implements sprint tasks. Uses claude --dangerously-skip-permissions.
# ══════════════════════════════════════════════════════════════════
def agent_engineer(cycle: int):
    log(f"[ENGINEER] Cycle {cycle} — implementing...", "◈")
    sprint = read("SPRINT.md")
    design = read("DESIGN_SPEC.md")

    task_path = ROOT / f"TASK_{cycle}.md"
    task_path.write_text(f"""# Engineer Task — Cycle {cycle}

{sprint}

Design context: {design[:300]}

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd {FRONTEND} && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd {PROJECT} && git add -A && git commit -m "feat(c{cycle}): sprint tasks"
5. Write one line summary to {ROOT}/ENGINEER_OUTPUT.md
""")

    log(f"[ENGINEER] Running claude --dangerously-skip-permissions...", "◈")
    try:
        r = subprocess.run(
            ["claude", "--dangerously-skip-permissions",
             f"Read {task_path} and implement all tasks. When done, verify npm build passes and commit."],
            capture_output=True, text=True,
            timeout=ENGINEER_TIMEOUT, cwd=str(PROJECT)
        )
        ok = r.returncode == 0
        summary = (r.stdout[-500:] if r.stdout else "") + (r.stderr[-200:] if r.stderr else "")
    except subprocess.TimeoutExpired:
        log("[ENGINEER] Timeout — checking if anything was committed", "✗")
        ok = False; summary = "timeout"
    except Exception as e:
        log(f"[ENGINEER] Error: {e}", "✗"); ok = False; summary = str(e)

    # Verify build independently
    rc, bout, berr = shell("npm run build 2>&1 | tail -5", cwd=FRONTEND, timeout=90)
    build_ok = rc == 0
    log(f"[ENGINEER] Build: {'✓ PASS' if build_ok else '✗ FAIL'}", "✓" if build_ok else "✗")

    # Get last commit
    _, git_out, _ = shell("git log --oneline -1", cwd=PROJECT)

    write("ENGINEER_OUTPUT.md", f"""# Engineer — Cycle {cycle} [{ts()}]
Build: {'PASS' if build_ok else 'FAIL'}
Last commit: {git_out.strip()}
Output excerpt: {summary[:400]}
""")
    task_path.unlink(missing_ok=True)

# ══════════════════════════════════════════════════════════════════
# AGENT 5: QA (Quality Assurance + Reporter)
# Role: Tests, screenshots, reports bugs, scores cycle quality.
# ══════════════════════════════════════════════════════════════════
def agent_qa(cycle: int):
    log(f"[QA] Cycle {cycle} — testing...", "◈")

    # Build test
    rc, bout, berr = shell("npm run build 2>&1 | tail -10", cwd=FRONTEND, timeout=90)
    build_pass = rc == 0

    # TypeScript check
    rc2, ts_out, _ = shell("npx tsc --noEmit 2>&1 | head -20", cwd=FRONTEND, timeout=45)
    ts_pass = rc2 == 0

    # Git history
    _, git_log, _ = shell("git log --oneline -5", cwd=PROJECT)

    sprint = read("SPRINT.md")
    eng_out = read("ENGINEER_OUTPUT.md")

    report = ask(f"""ROLE: QA Engineer + Reporter, AlphaEdge.
Sprint tasks: {sprint[:400]}
Engineer output: {eng_out[:300]}
Build: {'PASS' if build_pass else 'FAIL — ' + berr[:200]}
TypeScript: {'PASS' if ts_pass else 'FAIL — ' + ts_out[:200]}
Recent commits: {git_log}

Write a QA report:
1. Sprint completion (which tasks done/partial/missing)
2. Bugs found (be specific — file and line if possible)
3. UI quality (pixel art consistency, any visual regressions)
4. Next cycle top priority (1 sentence)
5. Score: X/10

Format as markdown. Under 250 words.""", "QA")

    report_full = f"""# QA Report — Cycle {cycle} [{ts()}]

## Automated
- Build: {'✓ PASS' if build_pass else '✗ FAIL'}
- TypeScript: {'✓ PASS' if ts_pass else '✗ FAIL'}
- Commits: {git_log.strip()}

## Analysis
{report}
"""
    write("QA_REPORT.md", report_full)

    # Update changelog
    existing = read("CHANGELOG.md")
    _, last_commit, _ = shell("git log --oneline -1", cwd=PROJECT)
    write("CHANGELOG.md", f"## Cycle {cycle} [{ts()}]\n{last_commit.strip()}\n\n{existing}")

    log(f"[QA] Build:{'PASS' if build_pass else 'FAIL'} TS:{'PASS' if ts_pass else 'FAIL'}", "✓")

# ══════════════════════════════════════════════════════════════════
# MAIN LOOP
# ══════════════════════════════════════════════════════════════════
PIPELINE = [
    ("designer", agent_designer),
    ("cto",      agent_cto),
    ("lead",     agent_lead),
    ("engineer", agent_engineer),
    ("qa",       agent_qa),
]

def run_cycle(cycle: int):
    log(f"{'═'*55}", "◉")
    log(f"  CYCLE {cycle} — {datetime.datetime.now().strftime('%H:%M %Z')}", "◉")
    log(f"{'═'*55}", "◉")
    t0 = time.time()

    for phase, fn in PIPELINE:
        set_state(cycle=cycle, phase=phase)
        log(f"── {phase.upper()} ──────────────────────────────────────", "◉")
        phase_start = time.time()
        try:
            fn(cycle)
            log(f"[{phase.upper()}] ✓ done in {time.time()-phase_start:.0f}s", "✓")
        except Exception as e:
            log(f"[{phase.upper()}] ✗ crashed: {e}", "✗")
        time.sleep(2)

    elapsed = time.time() - t0
    set_state(cycle=cycle+1, phase="idle",
              lastCycleEnd=datetime.datetime.now().isoformat())
    log(f"{'═'*55}", "◉")
    log(f"  CYCLE {cycle} DONE in {elapsed:.0f}s — next in {CYCLE_DELAY}s", "◉")
    log(f"{'═'*55}", "◉")

def main():
    log("AlphaEdge Multi-Agent Orchestrator v2", "◉")
    log("Agents: DESIGNER → CTO → LEAD → ENGINEER → QA", "▸")
    log(f"Claude timeout: {CLAUDE_TIMEOUT}s | Engineer timeout: {ENGINEER_TIMEOUT}s", "▸")

    state = get_state()
    cycle = state.get("cycle", 1)
    log(f"Starting at cycle {cycle}", "▸")

    while True:
        try:
            run_cycle(cycle)
            cycle += 1
            time.sleep(CYCLE_DELAY)
        except KeyboardInterrupt:
            log("Stopped by user", "▸")
            set_state(phase="stopped")
            break
        except Exception as e:
            log(f"Cycle {cycle} crashed: {e} — retrying in 30s", "✗")
            time.sleep(30)

if __name__ == "__main__":
    # Clear old log
    LOG.write_text("")
    main()
