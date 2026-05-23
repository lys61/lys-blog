---
title: "给博客补上 RSS、站点地图和图片展示支持"
description: "记录一次博客基础能力优化：压缩首页标题、添加 favicon、RSS、sitemap，并准备文章图片展示方式。"
pubDate: 2026-05-23
tags: ["Astro", "RSS", "SEO", "Blog"]
---

博客上线之后，第一轮优化解决了首页和文章页的基础阅读体验。这一轮继续补一些更偏长期维护的能力：RSS、站点地图、favicon，以及以后文章里展示图片的样式。

这些东西单独看都不大，但对一个长期运行的博客很重要。

## 首页标题再收一点

上一轮已经把首页首屏压低了一些，但在桌面端看，中文大标题还是稍微偏重。

这次继续调整了标题的最大宽度和最大字号：

```css
h1 {
  max-width: 840px;
  font-size: clamp(38px, 5.4vw, 64px);
  line-height: 1.12;
}
```

调整后的目标是让首页更像一个博客入口，而不是一张巨大的海报。标题仍然有辨识度，但不会把正文和文章列表压得太远。

## 加 favicon

favicon 是一个很小的细节，但浏览器标签页、收藏夹和移动端快捷方式里都会用到。

这次直接添加了一个 SVG favicon：

```text
public/favicon.svg
```

然后在页面头部引用：

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

用 SVG 的好处是文件小、清晰，并且不需要准备多套尺寸。

## 添加 RSS

RSS 对博客很实用。它可以让读者用 RSS 阅读器订阅，也让博客更像一个开放的内容源，而不只是一个网页集合。

这次安装了 Astro 官方 RSS 包：

```bash
npm install @astrojs/rss
```

然后新增：

```text
src/pages/rss.xml.js
```

RSS 会读取 `blog` 内容集合里的文章，并按发布时间倒序输出：

```js
const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
```

最终 RSS 地址是：

```text
https://lys-blog.pages.dev/rss.xml
```

页面头部也加了 RSS 发现链接：

```html
<link rel="alternate" type="application/rss+xml" title="LYS Blog RSS" href="/rss.xml" />
```

这样支持自动发现 RSS 的阅读器或浏览器插件就能识别出来。

## 添加 sitemap

sitemap 用来告诉搜索引擎网站有哪些页面。个人博客不一定马上有搜索流量，但早点补上没有坏处。

这次安装了 Astro sitemap 集成：

```bash
npm install @astrojs/sitemap
```

然后在 `astro.config.mjs` 中启用：

```js
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lys-blog.pages.dev',
  integrations: [sitemap()]
});
```

这里的 `site` 很重要。sitemap 需要知道网站的正式地址，才能生成完整 URL。

构建后会生成：

```text
/sitemap-index.xml
```

## 准备文章图片展示

以后写博客很可能会用到截图，例如部署过程、界面设置、代码运行结果等。

最简单的图片管理方式是把图片放到：

```text
public/images
```

例如：

```text
public/images/cloudflare-pages/success.png
```

然后在 Markdown 中引用：

```md
![Cloudflare Pages 部署成功截图](/images/cloudflare-pages/success.png)
```

注意路径里不需要写 `public`。因为 `public` 目录下的内容会直接作为网站根目录资源发布。

这次也给文章图片加了默认样式：

```css
.article-body img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 28px auto;
  border: 1px solid var(--line);
  border-radius: 8px;
}
```

这样以后插入图片时，不会突然撑破页面，也能和文章正文保持统一风格。

## 这轮优化后的能力

这次优化之后，博客多了几项基础能力：

```text
favicon
RSS
sitemap
文章图片样式
更稳的首页标题尺寸
```

它们不一定第一眼就很明显，但会让博客更适合长期维护。

下一步可以继续考虑：

- 标签页
- 文章搜索
- 文章目录
- 自定义域名
- Open Graph 分享图

博客是慢慢长出来的。先把基础铺好，后面每写一篇文章，整个站点都会更有价值。
