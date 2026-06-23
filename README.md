# Agent Tools Hub

Agent Tools Hub 是一个面向 AI coding agent 的工具导航站，收录 Skills、MCP Servers、Plugins、Workflows、CLI 工具和其他开发辅助项目。

项目保持静态化：工具数据放在 `data/skills.json`，页面在浏览器中渲染卡片，GitHub stars 在客户端加载，可直接部署到 Cloudflare Pages。

## 功能

- 无构建步骤，只有 HTML/CSS/JavaScript
- 支持按主类型筛选：Skill、MCP Server、Plugin、Workflow 等
- 支持中文标签筛选
- 支持 GitHub star 徽章和按 star 排序
- 支持通过 GitHub Issue Form 提交工具
- 使用简单 JSON 数据模型，方便贡献和维护

## 本地预览

在项目根目录运行：

```bash
python3 -m http.server 4322
```

打开：

```text
http://127.0.0.1:4322/
```

不要用 `file://` 作为常规开发方式。页面通过 `fetch` 加载 `data/skills.json`，使用本地静态服务更接近 Cloudflare Pages 的运行环境。

## 部署到 Cloudflare Pages

在 Cloudflare Pages 中选择该仓库，使用仓库根目录作为项目根目录。

- Framework preset：`None`
- Build command：留空，或填写 `npm run validate`
- Build output directory：`/`
- Production branch：`main`

连接 GitHub 后：

- push 到 `main` 会自动发布正式环境
- PR 会自动生成 Preview Deployment
- PR 合并后 Cloudflare Pages 会自动发布最新版本

用户提交工具通过 GitHub Issue Form 完成。页面右上角的“提交工具”会打开仓库里的工具提交模板：

```text
https://github.com/imochen/agent-tools-hub/issues/new?template=tool-submission.yml
```

维护者审核 issue 后，可以按 `AGENTS.md` 的规则把条目加入 `data/skills.json`。这样不需要 Cloudflare token、数据库或自建提交后端。

## 新增工具

编辑 `data/skills.json`。

条目格式：

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

维护规则：

- 新增前先分析仓库，不要只根据仓库名分类。
- `type` 只放一个主类型。
- 混合形态写进 `surfaces`，例如 Skill、MCP Server、Plugin、CLI、Hooks、Agent Instructions。
- `description` 使用中文，一句话即可。
- `tags` 尽量固定 3 个。
- `featured` 使用当前最大值加 1。

更详细的维护规则见 `AGENTS.md`。

## 校验

```bash
npm run validate
```

等价于：

```bash
python3 -m json.tool data/skills.json
node --check assets/app.js
node scripts/validate.mjs
```

## 目录结构

```text
.
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   └── skills.json
├── scripts/
│   └── validate.mjs
└── AGENTS.md
```

## 许可证

MIT
