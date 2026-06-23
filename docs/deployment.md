# 部署说明

本文档面向维护者。

## Cloudflare Pages

在 Cloudflare Pages 中选择该仓库，使用仓库根目录作为项目根目录。

- Framework preset：`None`
- Build command：留空，或填写 `npm run validate`
- Build output directory：`/`
- Production branch：`main`

连接 GitHub 后：

- push 到 `main` 会自动发布正式环境
- PR 会自动生成 Preview Deployment
- PR 合并后 Cloudflare Pages 会自动发布最新版本

## 提交入口

用户提交工具通过 GitHub Issue Form 完成，不需要 Cloudflare token、数据库或自建提交后端。

## 自动生成 PR

`Analyze tool submission` workflow 会从 `tool-submission` issue 生成候选 PR。

仓库需要打开 GitHub Actions 的 PR 写入权限：

1. 进入仓库 Settings。
2. 打开 Actions -> General。
3. 在 Workflow permissions 中选择 `Read and write permissions`。
4. 勾选 `Allow GitHub Actions to create and approve pull requests`。

如果不想使用默认 `GITHUB_TOKEN`，可以创建一个 fine-grained personal access token，并保存为仓库 secret：

```text
SUBMISSION_BOT_TOKEN
```

该 token 至少需要对当前仓库具备 Contents 和 Pull requests 的读写权限。workflow 会优先使用 `SUBMISSION_BOT_TOKEN`，没有配置时才回退到 `GITHUB_TOKEN`。
