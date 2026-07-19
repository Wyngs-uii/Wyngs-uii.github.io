# OnionFlow 独立静态部署

本目录是纯静态生产构建，不需要 ChatGPT 登录、ChatGPT Sites、数据库或服务端 API。

## 从源码重新构建

源码包中执行：

```bash
npm ci
npm run build:static
```

构建结果会生成在 `dist` 目录。

## 本地运行

需要 Node.js 18 或更高版本：

```bash
node serve.mjs
```

然后打开 `http://127.0.0.1:4173`。

## 部署

将本目录全部文件上传到任意静态托管服务的网站根目录。包内已经包含：

- `_redirects`：Netlify、Cloudflare Pages 等平台的 SPA 回退规则。
- `vercel.json`：Vercel 回退规则。
- `.htaccess`：Apache 回退规则。
- `404.html`：兼容使用 404 页面作为 SPA 入口的静态服务。
- `/hypotheses/index.html`、`/evidence/index.html`、`/propagation/index.html`、`/decision/index.html`：核心页面实体入口。

Nginx 可使用：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

所有业务数据均为前端演示数据，决策状态保存在浏览器 `localStorage` 中。点击“重新开始演示”会清除本地演示状态。
