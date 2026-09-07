# 包装与发运计划

苍穹前端扩展脚手架。技术栈与打包方式对齐 `iframe_project`：React + Vite + shadcn，构建后 gzip + base64 成可贴入苍穹插件的单文件 JS。

## 开发

```bash
pnpm install
pnpm dev
```

本地请求 `/ierp` 会代理到测试环境网关，避免浏览器 CORS。

## 构建

```bash
pnpm build
```

产物：

- `dist/index.html`：单文件页面，用于本地预览
- `dist/index.js`：苍穹插件脚本。在苍穹页面插件编辑器中粘贴此文件内容

插件会把解压后的 HTML 挂到全屏 iframe（`#__packaging_and_shipping_plan_root__`）。Esc 或侧栏关闭按钮会卸掉该 iframe。

## 扩展页面

1. 在 `src/lib/nav.ts` 增加 `NavId` 与导航项
2. 在 `src/views` 新增视图，并在 `src/App.tsx` 挂上
3. 在 `src/lib/config.ts` 的 `CQ_API_PATH` 登记 kapi，再于 `src/lib/api` 写请求封装（使用 `cq_fetch`）
