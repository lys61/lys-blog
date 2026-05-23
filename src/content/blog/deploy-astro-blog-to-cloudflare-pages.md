---
title: "用 Astro 和 Cloudflare Pages 搭建个人博客"
description: "记录一次从本地 Astro 博客项目、GitHub 仓库推送，到 Cloudflare Pages 自动部署上线的完整过程。"
pubDate: 2026-05-23
tags: ["Astro", "Cloudflare Pages", "GitHub", "Blog"]
---

最近重新整理了一下自己的个人博客。之前已经有一个 GitHub 仓库 `lys61/lys-blog`，里面只有一个简单的 README。这次我决定不继续沿用旧的默认模板，而是重新用 Astro 搭一个更现代、更轻量的博客，然后部署到 Cloudflare Pages。

这篇文章记录完整过程，方便以后自己回看。

## 为什么选择 Astro 和 Cloudflare Pages

个人博客最重要的是长期可维护。文章最好是 Markdown 文件，项目结构清楚，部署也不要太复杂。

Astro 比较适合这种场景：

- 可以直接用 Markdown 写文章
- 默认生成静态页面，访问速度快
- 项目结构清晰，后续扩展 RSS、搜索、SEO 都方便
- 不需要维护后端服务

Cloudflare Pages 则适合托管静态站：

- 可以直接连接 GitHub 仓库
- 每次推送代码后自动构建和部署
- 免费额度对个人博客完全够用
- 自动提供 `pages.dev` 域名

最终选择的方案是：

```text
Astro + GitHub + Cloudflare Pages
```

## 创建 Astro 博客项目

我的博客目录放在：

```text
D:\document\blog
```

项目核心结构大概是：

```text
blog/
  public/
    styles/
      global.css
  src/
    content/
      blog/
        hello-astro.md
    layouts/
      BaseLayout.astro
    pages/
      blog/
        [...slug].astro
        index.astro
      about.astro
      index.astro
    content.config.ts
  astro.config.mjs
  package.json
  README.md
```

文章统一放在：

```text
src/content/blog
```

每一篇文章就是一个 Markdown 文件，例如：

```md
---
title: "重新开始写博客"
description: "用 Astro 搭建一个更轻、更现代、也更容易长期维护的个人博客。"
pubDate: 2026-05-23
tags: ["Blog", "Astro"]
---

这是新博客的第一篇文章。
```

## 适配 Astro 6 的内容集合

这次使用的是 Astro 6。Astro 6 的内容集合配置和旧版本不太一样，配置文件需要放在：

```text
src/content.config.ts
```

内容集合使用 `glob` loader：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { blog };
```

这样 Astro 就能识别 `src/content/blog` 下面的 Markdown 文章，并在构建时生成对应页面。

## 本地构建验证

项目创建好之后，先安装依赖：

```bash
npm install
```

然后执行构建：

```bash
npm run build
```

构建成功后，会生成 `dist` 目录。Cloudflare Pages 后面部署的就是这个目录。

这次构建生成了 4 个页面：

```text
/
/blog
/blog/hello-astro
/about
```

本地预览可以运行：

```bash
npm run dev
```

默认访问：

```text
http://127.0.0.1:4321
```

## 初始化 Git 仓库

本地项目确认能构建后，初始化 Git 仓库：

```bash
git init
git add .
git commit -m "Initial Astro blog"
git branch -M main
```

`.gitignore` 里排除了这些内容：

```text
dist/
.astro/
node_modules/
.env
*.log
```

这些文件不应该提交到 GitHub。

## 连接已有 GitHub 仓库

我之前已经有一个 GitHub 仓库：

```text
https://github.com/lys61/lys-blog
```

所以本地直接添加远程地址：

```bash
git remote add origin https://github.com/lys61/lys-blog.git
```

第一次拉取远端信息时，遇到了 Git 证书问题：

```text
SSL certificate problem: unable to get local issuer certificate
```

解决方式是让 Git 使用 Windows 系统证书：

```bash
git config http.sslBackend schannel
```

然后重新拉取远端：

```bash
git fetch origin
```

因为 GitHub 仓库里原本有一个 README，本地也是新初始化的仓库，两边历史不同，所以需要合并远端历史：

```bash
git merge origin/main --allow-unrelated-histories --no-edit
```

合并时 README 出现冲突。处理方式是保留新的项目说明，同时保留原来的中文简介：

```md
# LYS Blog

作者自己的博客托管平台。

A personal blog built with Astro.
```

冲突解决后提交：

```bash
git add README.md
git commit -m "Merge existing GitHub repository"
```

最后推送到 GitHub：

```bash
git push -u origin main
```

## 部署到 Cloudflare Pages

代码推送到 GitHub 后，进入 Cloudflare 控制台：

```text
Workers & Pages
→ Create application
```

一开始 Cloudflare 默认会进入 Worker 创建流程，这里要注意不要选 Worker。正确入口是页面底部的：

```text
Looking to deploy Pages? Get started
```

点击后进入 Pages 流程，然后选择：

```text
Connect to Git
→ Continue with GitHub
→ 选择 lys61/lys-blog
```

构建设置如下：

```text
Project name: lys-blog
Production branch: main
Framework preset: Astro
Build command: npm run build
Build output directory: dist
```

如果可以设置环境变量，可以加：

```text
NODE_VERSION=22
```

设置完成后点击部署。

## 部署结果

Cloudflare Pages 构建日志里出现这些信息，就说明部署成功了：

```text
4 page(s) built
Complete!
Success: Assets published!
Success: Your site was deployed!
```

最终网站地址是：

```text
https://lys-blog.pages.dev
```

部署完成后，可以检查几个页面：

```text
https://lys-blog.pages.dev
https://lys-blog.pages.dev/blog
https://lys-blog.pages.dev/blog/hello-astro
https://lys-blog.pages.dev/about
```

## 后续更新文章

以后写文章，只需要在本地新增 Markdown 文件：

```text
src/content/blog
```

写完后提交并推送：

```bash
git add .
git commit -m "Add new post"
git push
```

Cloudflare Pages 会自动检测 GitHub 仓库更新，然后重新构建和发布。

这样，一个基于 Astro、GitHub 和 Cloudflare Pages 的个人博客就搭好了。整体流程并不复杂，最关键的是先跑通部署链路。后面真正重要的事情，就是持续写文章。
