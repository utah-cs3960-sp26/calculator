#!/usr/bin/env python3
"""A tiny REPL to pretend to be an AI agent."""

import shlex
import subprocess
import difflib
from pathlib import Path

# Track edit history (first entry is original content)
edit_history: dict[str, list[str]] = {}

def cmd_bash(command: str) -> None:
    """Execute a shell command."""
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="")


def cmd_edit(path: str, old_str: str, new_str: str) -> None:
    """Replace old_str with new_str in file."""
    p = Path(path)
    if not p.exists():
        print(f"Error: {path} does not exist")
        return

    content = p.read_text()

    if old_str not in content:
        print(f"Error: old_str not found in {path}")
        return

    edit_history.setdefault(path, []).append(content)

    new_content = content.replace(old_str, new_str, 1)
    p.write_text(new_content)

    diff = difflib.unified_diff(
        content.splitlines(keepends=True),
        new_content.splitlines(keepends=True),
        fromfile=path,
        tofile=path,
    )
    print("".join(diff))


def cmd_undo_edit(path: str) -> None:
    """Undo the last edit to a file and show diff."""
    if path not in edit_history or not edit_history[path]:
        print(f"Error: no edits to undo for {path}")
        return

    p = Path(path)
    current = p.read_text()
    previous = edit_history[path].pop()

    p.write_text(previous)

    # Show diff
    diff = difflib.unified_diff(
        current.splitlines(keepends=True),
        previous.splitlines(keepends=True),
        fromfile=f"{path} (current)",
        tofile=f"{path} (restored)",
    )
    print("".join(diff))


def cmd_reset() -> None:
    """Reset all edited files to original versions."""
    for path, history in edit_history.items():
        if history:
            Path(path).write_text(history[0])
            print(f"Reset {path}")
    edit_history.clear()


def cmd_view(path: str) -> None:
    """View file contents."""
    p = Path(path)
    if not p.exists():
        print(f"Error: {path} does not exist")
        return
    print(p.read_text(), end="")


def cmd_help() -> None:
    """Show available commands."""
    print("""Commands:
  bash <command> ...       - Execute a shell command
  edit <file> <A> <B>      - Replace old_str with new_str in file
  view <file>              - View file contents
  undo <file>              - Undo last edit to file
  reset                    - Reset all edited files to original
  help                     - Show this help
  exit / quit              - Exit the REPL""")


def main() -> None:
    print("Agent REPL - type 'help' for commands")
    while True:
        try:
            line = input("agent> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not line:
            continue

        try:
            parts = shlex.split(line)
        except ValueError as e:
            print(f"Parse error: {e}")
            continue

        cmd = parts[0].lower()

        if cmd in ("exit", "quit"):
            break
        elif cmd == "help":
            cmd_help()
        elif cmd == "bash" and len(parts) >= 2:
            cmd_bash(parts[1:])
        elif cmd == "edit" and len(parts) == 4:
            cmd_edit(parts[1], parts[2], parts[3])
        elif cmd == "undo" and len(parts) == 2:
            cmd_undo_edit(parts[1])
        elif cmd == "reset":
            cmd_reset()
        elif cmd == "view" and len(parts) == 2:
            cmd_view(parts[1])
        else:
            print(f"Unknown command or wrong arguments. Type 'help' for usage.")


if __name__ == "__main__":
    main()
