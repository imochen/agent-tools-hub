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
