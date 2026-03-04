#!/bin/bash
# AlphaEdge Multi-Agent Launcher
# Starts 5 specialized agents in separate tmux panes

SESSION="alphaedge-agents"
PROJECT="$HOME/Projects/alphaedge"
AGENTS="$PROJECT/agents"

echo "🚀 Launching AlphaEdge Multi-Agent System"
echo "Session: $SESSION"

# Kill existing session if running
tmux kill-session -t "$SESSION" 2>/dev/null
sleep 1

# Create new tmux session with first window for orchestrator
tmux new-session -d -s "$SESSION" -n "orchestrator" -x 220 -y 50

# ─── Window 1: Orchestrator (main loop) ───────────────────────────
tmux send-keys -t "$SESSION:orchestrator" \
  "cd $PROJECT && echo '◉ ORCHESTRATOR — Main Loop' && python3 $AGENTS/orchestrator.py 2>&1 | tee $AGENTS/orchestrator.log" Enter

sleep 1

# ─── Window 2: Status Monitor ─────────────────────────────────────
tmux new-window -t "$SESSION" -n "status"
tmux send-keys -t "$SESSION:status" \
  "watch -n 3 'echo \"=== AlphaEdge Agent Status ===\"; echo; echo \"[STATE]\"; cat $AGENTS/STATE.json; echo; echo \"[LAST QA]\"; tail -20 $AGENTS/QA_REPORT.md; echo; echo \"[LAST SPRINT]\"; tail -20 $AGENTS/SPRINT.md'" Enter

# ─── Window 3: Build watcher ──────────────────────────────────────
tmux new-window -t "$SESSION" -n "build"
tmux send-keys -t "$SESSION:build" \
  "cd $PROJECT/src/frontend && echo '🔨 Build Watcher' && echo 'Watching for changes...' && while true; do npm run build 2>&1 | tail -5; echo '---'; sleep 30; done" Enter

# ─── Window 4: Git log ────────────────────────────────────────────
tmux new-window -t "$SESSION" -n "git"
tmux send-keys -t "$SESSION:git" \
  "cd $PROJECT && watch -n 10 'echo \"=== Git Log ===\"; git log --oneline -10; echo; echo \"=== Changed Files ===\"; git status --short'" Enter

# ─── Window 5: Dev server + logs ──────────────────────────────────
tmux new-window -t "$SESSION" -n "devserver"
tmux send-keys -t "$SESSION:devserver" \
  "cd $PROJECT/src/frontend && pkill -f 'next dev' 2>/dev/null; sleep 1 && echo '🌐 Starting dev server...' && npm run dev -- --port 3001 2>&1 | tee $AGENTS/devserver.log" Enter

# Back to orchestrator
tmux select-window -t "$SESSION:orchestrator"

echo ""
echo "✓ All 5 agent windows launched!"
echo ""
echo "Windows:"
echo "  0: orchestrator — Main pipeline loop"
echo "  1: status       — Live state monitor"
echo "  2: build        — Build watcher"
echo "  3: git          — Git log monitor"
echo "  4: devserver    — Next.js dev server"
echo ""
echo "Attach with: tmux attach -t $SESSION"
echo "Kill with:   tmux kill-session -t $SESSION"
