# Agent Tools Hub

本项目是一个静态 agent 工具目录，面向 Skills、MCP Servers、Plugins、Prompts、Workflows、Browser Tools 和 Dev Tools。

## 新增工具流程

当用户要求新增一个 GitHub 仓库时，先分析仓库，再编辑 `data/skills.json`。

必须分析：

- 仓库 README、描述、目录结构或安装说明。
- 它的主使用形态：`Skill`、`MCP Server`、`Plugin`、`Prompt`、`Workflow`、`Browser Tool`、`Dev Tool`。
- 是否是混合形态，例如同时包含 skill、MCP server、CLI、agent instructions、plugin installer。
- 面向的任务：代码理解、设计、浏览器自动化、文档、数据、审查、部署等。
- 是否依赖 GitHub stars badge 可正常显示：仓库 URL 必须是 `https://github.com/{owner}/{repo}`。

## 分类规则

`type` 是主类型，只放一个值，用于顶部类型筛选。

优先级判断：

- 如果核心能力通过 MCP tools 暴露，标为 `MCP Server`。
- 如果核心交付物是 `SKILL.md` 或 agent skill 包，标为 `Skill`。
- 如果核心是可安装插件、规则包或跨 agent 扩展集合，标为 `Plugin`。
- 如果主要是提示词模板，标为 `Prompt`。
- 如果主要是流程编排或操作手册，标为 `Workflow`。
- 如果主要控制浏览器或网页验证，标为 `Browser Tool`。
- 如果主要是 CLI、库、脚手架或开发辅助工具，标为 `Dev Tool`。

`surfaces` 描述实际可用形态，可以有多个值，例如：

- `Skill`
- `MCP Server`
- `Plugin`
- `CLI`
- `CLI Installer`
- `Agent Instructions`
- `Prompt`
- `Workflow`

混合项目不要强行压成一个标签；用 `type` 表示主定位，用 `surfaces` 表示完整能力。

## 数据格式

所有条目写入 `data/skills.json`，字段顺序保持一致：

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
  "featured": 4
}
```

写法要求：

- `description` 用中文，控制在一句话内。
- `tags` 用中文或常见英文缩写，固定 3 个为宜。
- `featured` 使用当前最大值加 1，不重排旧条目，除非用户要求。
- `owner` 和 `repo` 必须和 GitHub URL 完全一致，大小写按仓库显示保留。
- 不要把 `mcp`、`plugin` 这类标签当作主类型的替代；主类型必须写在 `type`。

## 修改后验证

每次修改 `data/skills.json` 后运行：

```bash
python3 -m json.tool data/skills.json
```

如果改了脚本，运行：

```bash
node --check assets/app.js
```

如果本地服务已启动，检查：

```bash
curl -I http://127.0.0.1:4322/
```

本地预览和 Cloudflare Pages 发布都以仓库根目录为项目根目录，静态输出目录为 `/`。

## UI 约束

- 页面保持目录工具感，避免解释型大段文案。
- 顶部保持紧凑。
- 不恢复搜索框，除非用户明确要求。
- 用户提交通过 GitHub Issue 模板处理，不在页面内保留隐藏提交表单。
- 卡片内只显示主类型徽标、轻量 `形态：` 元信息和最多 3 个 tags。
