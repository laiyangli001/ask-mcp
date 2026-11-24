# ask-mcp

Free AI chat services exposed as MCP (Model Context Protocol) servers. Drive ChatGPT, Claude, DeepSeek, and Doubao web UIs through Playwright — **no API token required**.

Each service is a standalone Node.js stdio MCP server that opens a browser, talks to the AI web app, and returns the answer to your MCP client (Claude Code, etc.).

## Services

| Directory | MCP server name | Tool(s) | Target site |
|-----------|-----------------|---------|-------------|
| `chatgpt-mirror/` | `chatgpt-mirror` | `ask_chatgpt_mirror` | chatgpt.2233.ai (mirror) |
| `chatgpt-official/` | `chatgpt-official` | `ask_chatgpt_official` | chatgpt.com (official) |
| `claude-mirror/` | `claude-mirror` | `ask_claude_mirror`, `take_screenshot` | claude.2233.ai (mirror) |
| `deepseek/` | `deepseek` | `ask_deepseek` | chat.deepseek.com |
| `doubao/` | `doubao` | `ask_doubao`, `download_doubao_file` | doubao.com |

Every `ask_*` tool accepts the same arguments:

| Parameter | Type | Description |
|-----------|------|-------------|
| `question` | string | The prompt to send |
| `template` | string (optional) | Name of a shared prompt template (see below) |
| `attachments` | string[] (optional) | Absolute paths to files to upload (≤ 100 MB total) |

## Shared templates

Templates live in `shared/templates/` and are referenced by the `template` argument:

- `code_review` — code review prompts
- `long_text` — long-text / log analysis
- `vision_analysis` — image understanding
- `batch_task` — batch formatting / structuring
- `format_task` — output formatting

Role templates live in `roles/` (`nodejs_tutor`, `python_tutor`).

## Architecture

```
ask-mcp/
├── shared/            # common Playwright + answer-extraction helpers
│   ├── browser.mjs    # browser lifecycle, navigation, retry, toasts
│   ├── answer.mjs     # answer wait / extract
│   ├── upload.mjs     # file attachment upload
│   ├── role.mjs       # template / role loader
│   └── templates/     # reusable prompt templates
├── chatgpt-mirror/    # one directory per service
├── chatgpt-official/
├── claude-mirror/
├── deepseek/
├── doubao/
├── install.mjs        # one-shot installer
├── install.bat        # Windows double-click wrapper
└── skill/SKILL.md     # Claude Code skill
```

Each service directory is an independent npm package (`src/index.ts` → `dist/index.js`) that imports the shared helpers via relative paths.

## Requirements

- Node.js >= 18
- A working login state for the target site (each service persists its own browser profile under the service directory, generated at runtime)

## Install

One command:

```bash
node install.mjs
```

This will, for each service:

1. `npm install` (also downloads Playwright's Chromium via `postinstall`)
2. `npm run build` (TypeScript → `dist/index.js`)

...and then registers all five servers in `~/.claude.json` under `mcpServers`.

On Windows you can double-click `install.bat`.

> After installing, reload your editor window (VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`) so the new MCP servers are picked up.

## Manual install

If you prefer to wire things up yourself:

```bash
cd chatgpt-mirror && npm install && npm run build
# ... repeat for each service directory ...
```

Then add to `~/.claude.json` → `mcpServers`:

```json
{
  "chatgpt-mirror": {
    "type": "stdio",
    "command": "node",
    "args": ["/absolute/path/to/ask-mcp/chatgpt-mirror/dist/index.js"]
  }
}
```

## Skill

A Claude Code skill is provided at `skill/SKILL.md`. Copy it to your skills directory (e.g. `~/.claude/skills/ask-mcp/`) to get automatic service routing and fallback chains.

## License

MIT
