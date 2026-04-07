#!/bin/bash
# Sync skill files from theOracle when updated

TEMPLATE_DIR="${1:-.}"
if [ ! -d "$TEMPLATE_DIR/agents/skills" ]; then
    echo "Error: theOracle agents/skills directory not found"
    exit 1
fi

SKILLS_DIR="$HOME/.claude/skills"
for skill_dir in "$TEMPLATE_DIR/agents/skills"/*/; do
    if [ -f "$skill_dir/SKILL.md" ]; then
        skill_name=$(basename "$skill_dir")
        target_dir="$SKILLS_DIR/$skill_name"
        mkdir -p "$target_dir"
        cp "$skill_dir/SKILL.md" "$target_dir/SKILL.md"
    fi
done

echo "Skills synced to $SKILLS_DIR"
