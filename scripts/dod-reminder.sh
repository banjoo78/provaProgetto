#!/bin/bash
# Definition of Done checklist
# Run before merging: ./scripts/dod-reminder.sh

echo "Definition of Done Checklist:"
echo "[ ] Implementation complete and tested"
echo "[ ] Test book created/updated in docs/test-books/"
echo "[ ] All docs updated (architecture, API, setup, etc.)"
echo "[ ] Code reviewed (/code-reviewer approval)"
echo "[ ] QA tested (/qa-engineer approval)"
echo "[ ] Security audit passed (if applicable)"
echo "[ ] Tech lead validated findings"
echo "[ ] GitHub issue linked in commit"
echo ""
read -p "All items checked? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Definition of Done not met. Do not merge."
    exit 1
fi
