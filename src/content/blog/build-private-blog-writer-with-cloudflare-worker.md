---
title: "给博客做一个自己的写作后台"
description: "记录从本地写作工具到 Cloudflare Worker 登录后台的开发过程。"
pubDate: 2026-05-24
tags: ["Astro", "Cloudflare", "写作工具", "项目记录"]
---

博客站点跑起来之后，下一个自然问题是：文章到底在哪里写？

一开始我可以直接在编辑器里写 Markdown，再手动提交到 GitHub。这个方式很稳定，但不够顺手。尤其是日记、图片、修改旧文章这些场景，如果每次都要打开项目目录、找文件、改 Markdown、提交推送，写作这件事本身就会被流程打断。

所以我单独做了一个写作后台：`lys-blog-writer`。

它和公开博客是两个项目：

- `lys-blog`：Astro 静态博客，只负责展示文章和日记。
- `lys-blog-writer`：私有写作工具，负责写作、预览、读取旧内容、发布到 GitHub。

## 第一版：先把写作流程跑通

最开始的目标很简单：打开一个页面，填标题、日期、标签、摘要和正文，然后自动生成符合博客仓库结构的 Markdown。

生成路径大概是：

```text
src/content/blog/xxx.md
src/content/diary/xxx.md
```

这样博客仓库不需要改变太多，只要保持 Astro 内容集合的结构，新的文章一提交，Cloudflare Pages 就会自动重新构建。

## 第二版：从本地工具变成发布后台

后来我加了 Cloudflare Worker。

Worker 在这个项目里相当于一个轻量后端。前端不直接暴露 GitHub Token，而是把发布请求交给 Worker，再由 Worker 调 GitHub API，把 Markdown 写进博客仓库。

这个阶段主要有几个接口：

```text
GET  /api/list
POST /api/read
POST /api/publish
```

这样写作后台就可以从 GitHub 仓库读取已有文章，点击某一篇后再拉取原文进行编辑。公开博客仍然是静态站，后台只负责管理内容。

## 第三版：加登录

发布功能能用了之后，就必须考虑权限。

我给 Worker 加了登录接口：

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

目前账号配置放在 Worker Secret 里，用 `USERS_JSON` 管理。账号分成两类：

```text
owner  最高权限
author 普通作者
```

登录后，浏览器会拿到一个由 Worker 签名的 Cookie。之后读取文章、发布文章都不再需要填写发布密码，而是由 Worker 检查登录状态。

这一步完成后，写作后台终于不像一个临时工具，而更像一个真正的小型内容系统。

## 第四版：缓存和发布队列

已有内容越来越多之后，只能“点开编辑、点发布”还不够。我又加了一层本地缓存。

现在 writer 会把打开过的文章缓存在浏览器本地，用来判断：

- 这篇有没有被缓存过
- 本地有没有修改
- 修改是否已经发布
- 哪些内容还在待发布状态

已有内容页会显示状态：

```text
未缓存
已同步
待发布
已发布修改
```

也可以选择特定内容发布，或者一键发布全部待发布内容。发布完成后，writer 会继续轮询博客公开页面，尝试确认 Cloudflare Pages 是否已经完成重新部署。

## 现在的结构

目前整体流程是：

```text
写作后台
  -> Cloudflare Worker
  -> GitHub 博客仓库
  -> Cloudflare Pages
  -> 公开博客
```

公开博客保持轻量，写作后台负责处理更复杂的编辑和发布逻辑。

## 后面可能继续做什么

接下来更值得做的不是立刻开发原生 App，而是先把 writer 做成手机上好用的 PWA。

之后可以继续扩展：

- 私密日记，只允许 owner 查看和写入
- Cloudflare R2 图片托管
- 用户头像和附件管理
- 多设备同步草稿和发布队列
- 更细的 author 权限

这个小后台现在还很早期，但它已经解决了一个很关键的问题：写作不再依赖手动找文件和手动推送。博客还是静态博客，但写作入口开始变得像一个真正属于自己的工具。
