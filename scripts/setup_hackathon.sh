#!/usr/bin/env bash
set -euo pipefail

# REPO'yu belirtmek istersen: export REPO="owner/repo"
REPO="cengizhankose/stacks-yield-agg"

echo "Using repo: $REPO"

echo ">> Create labels"
gh label create "priority:high"   -R "$REPO" -c "#d73a4a" -d "High priority"   || true
gh label create "priority:medium" -R "$REPO" -c "#fbca04" -d "Medium priority" || true
gh label create "priority:low"    -R "$REPO" -c "#c2e0c6" -d "Low priority"    || true

gh label create "area:frontend"   -R "$REPO" -c "#1d76db" -d "Frontend"        || true
gh label create "area:backend"    -R "$REPO" -c "#0e8a16" -d "Backend/Contracts" || true
gh label create "area:contracts"  -R "$REPO" -c "#5319e7" -d "Smart contracts" || true
gh label create "area:data"       -R "$REPO" -c "#0052cc" -d "Data/Adapters"   || true

gh label create "type:feature"    -R "$REPO" -c "#a2eeef" -d "Feature"         || true
gh label create "type:task"       -R "$REPO" -c "#e4e669" -d "Task"            || true
gh label create "type:test"       -R "$REPO" -c "#bfe5bf" -d "Test"            || true
gh label create "type:docs"       -R "$REPO" -c "#d4c5f9" -d "Docs"            || true
gh label create "type:chore"      -R "$REPO" -c "#ffffff" -d "Chore"           || true
gh label create "type:release" -R "$REPO" -c "#fef2c0" -d "Release/deployment task" || true

gh label create "status:blocker"      -R "$REPO" -c "#b60205" -d "Blocker"     || true
gh label create "status:needs-spec"   -R "$REPO" -c "#fef2c0" -d "Needs spec"  || true
gh label create "status:needs-review" -R "$REPO" -c "#bfdadc" -d "Needs review"|| true

echo ">> Create milestones"
for d in 1 2 3 4 5; do
  gh milestone create "Hackathon Day $d" -R "$REPO" --description "Day $d scope" || true
done

echo "Done."
