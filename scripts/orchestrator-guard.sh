#!/bin/bash
# Pre-commit hook: prevent orchestrator from directly modifying code
# Run this in .git/hooks/pre-commit

if git diff --cached --name-only | grep -qE '\.(ts|tsx|js|jsx|py|java|go|rs|sql)$'; then
    echo "ERROR: Orchestrator must not commit code directly."
    echo "Use skill agents: /backend-dev, /frontend-dev, /db-engineer, etc."
    exit 1
fi
