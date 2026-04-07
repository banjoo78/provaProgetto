#!/bin/bash
# Daily memory backup cron job
# Add to crontab: 0 2 * * * /path/to/scripts/backup-memory.sh

MEMORY_DIR="$HOME/.claude/projects/$(cat .claude/memory-path.txt 2>/dev/null | md5sum | cut -d' ' -f1)/memory"
BACKUP_DIR="$MEMORY_DIR/backups"
mkdir -p "$BACKUP_DIR"

if [ -d "$MEMORY_DIR" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    tar -czf "$BACKUP_DIR/memory_$TIMESTAMP.tar.gz" -C "$(dirname "$MEMORY_DIR")" "$(basename "$MEMORY_DIR")"
    # Keep last 30 days of backups
    find "$BACKUP_DIR" -name "memory_*.tar.gz" -mtime +30 -delete
fi
