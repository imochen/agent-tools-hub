# Agent Tools Hub

A curated directory of skills, MCP servers, plugins, workflows, and other tools for AI coding agents.

The site is intentionally static: tool metadata lives in `data/skills.json`, cards are rendered in the browser, GitHub stars are loaded client-side, and the project can be deployed directly to Cloudflare Pages.

## Features

- Static HTML/CSS/JavaScript, no build step required
- Type filters for Skill, MCP Server, Plugin, Workflow, and more
- Tag filters with compact Chinese labels
- GitHub star badges and star-based sorting
- Optional Cloudflare Pages Function for future submissions
- Contributor-friendly JSON data model

## Local Preview

From the project root:

```bash
python3 -m http.server 4322
```

Open:

```text
http://127.0.0.1:4322/
```

Do not use `file://` for normal development. The page loads `data/skills.json` with `fetch`, which works reliably through a local server and matches Cloudflare Pages behavior.

## Deploy To Cloudflare Pages

Use the repository root as the Pages project root.

- Build command: leave empty
- Build output directory: `/`

The optional submission endpoint is in `functions/api/submit.js`. To enable GitHub Issue submissions, configure these Cloudflare Pages environment variables:

- `GITHUB_TOKEN`: a token allowed to create issues
- `GITHUB_REPO`: target repository, for example `owner/agent-tools-hub`

The submission UI is currently hidden in `index.html`.

## Add A Tool

Edit `data/skills.json`.

Each entry uses this shape:

```json
{
  "name": "Tool Name",
  "owner": "github-owner",
  "repo": "github-repo",
  "type": "Skill",
  "surfaces": ["Skill", "CLI"],
  "description": "中文一句话介绍，说明它解决什么问题。",
  "tags": ["代码", "MCP", "CLI"],
  "url": "https://github.com/github-owner/github-repo",
  "featured": 8
}
```

Guidelines:

- Analyze the repository before adding it. Do not classify only from the name.
- Use one primary `type`.
- Use `surfaces` for mixed forms such as Skill, MCP Server, Plugin, CLI, Hooks, or Agent Instructions.
- Write `description` in Chinese, one sentence.
- Use exactly three tags when possible.
- Set `featured` to the current maximum plus one.

Detailed maintainer instructions live in `AGENTS.md`.

## Validate

```bash
python3 -m json.tool data/skills.json
node --check assets/app.js
```

## Project Structure

```text
.
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   └── skills.json
├── functions/
│   └── api/submit.js
└── AGENTS.md
```

## License

MIT
