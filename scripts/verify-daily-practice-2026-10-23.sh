#!/usr/bin/env bash
# Verifies daily/2026-10-23.md ## 实践 body matches the calendar practice upload (verbatim).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${ROOT}/uploads/calendar-practice-2026-10-23_bd4a.md"
DAILY="${ROOT}/daily/2026-10-23.md"

if [[ ! -f "$SOURCE" ]]; then
  SOURCE="/home/ubuntu/.cursor/projects/workspace/uploads/calendar-practice-2026-10-23_bd4a.md"
fi

python3 - "$SOURCE" "$DAILY" <<'PY'
import sys
from pathlib import Path

source_path = Path(sys.argv[1])
daily_path = Path(sys.argv[2])

source_bytes = source_path.read_bytes()
# Body: everything after first line (title) and its following newline
first_nl = source_bytes.find(b"\n")
if first_nl == -1:
    sys.exit("source: no newline after title")
rest = source_bytes[first_nl + 1 :]
if rest.startswith(b"\n"):
    rest = rest[1:]
elif rest.startswith(b"\r\n"):
    rest = rest[2:]
expected = rest

daily_text = daily_path.read_text(encoding="utf-8")
marker = "（用户笔记原文 · 2026-10-23）"
idx = daily_text.find(marker)
if idx == -1:
    sys.exit("daily: missing practice label")
after = daily_text[idx + len(marker) :]
if after.startswith("\r\n\r\n"):
    after = after[2:]
elif after.startswith("\n\n"):
    after = after[2:]
elif after.startswith("\r\n"):
    after = after[2:]
elif after.startswith("\n"):
    after = after[1:]
# Trim only the ## 复盘 section and below from practice block
for section in ("\n## 复盘", "\r\n## 复盘"):
    cut = after.find(section)
    if cut != -1:
        after = after[:cut]
        break
actual = after.encode("utf-8")

if actual != expected:
    import difflib
    exp_s = expected.decode("utf-8")
    act_s = actual.decode("utf-8")
    print("MISMATCH between daily ## 实践 body and upload source body.", file=sys.stderr)
    for line in difflib.unified_diff(
        exp_s.splitlines(keepends=True),
        act_s.splitlines(keepends=True),
        fromfile="expected (upload)",
        tofile="actual (daily)",
    ):
        sys.stderr.write(line)
    sys.exit(1)

print("OK: daily/2026-10-23.md practice body matches upload verbatim.")
PY
