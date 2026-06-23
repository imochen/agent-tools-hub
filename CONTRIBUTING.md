# Contributing

Thanks for helping improve Agent Tools Hub.

## Add Or Update A Tool

1. Inspect the repository you want to add.
2. Decide the primary `type`.
3. List real usage forms in `surfaces`.
4. Write a concise Chinese description.
5. Keep tags to three concise labels.
6. Add or update the entry in `data/skills.json`.
7. Run validation.

```bash
python3 -m json.tool data/skills.json
node --check assets/app.js
```

## Classification

Use one primary `type`:

- `Skill`
- `MCP Server`
- `Plugin`
- `Prompt`
- `Workflow`
- `Browser Tool`
- `Dev Tool`

Use `surfaces` for mixed delivery forms:

- `Skill`
- `MCP Server`
- `Plugin`
- `CLI`
- `CLI Installer`
- `Agent Instructions`
- `Hooks`
- `Workflow`
- `Templates`
- `Presets`

## Pull Requests

Please keep PRs focused. A tool-list PR should usually only touch `data/skills.json` unless the UI also needs to change.

For a new tool, include:

- GitHub URL
- Primary type
- Why that type was chosen
- Any mixed surfaces
- Validation output
