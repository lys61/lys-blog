import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const diaries = (await getCollection('diary')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id.replace(/\.md$/, '')}/`
    })),
    ...diaries.map((diary) => ({
      title: diary.data.title,
      description: diary.data.description,
      pubDate: diary.data.pubDate,
      link: `/diary/${diary.id.replace(/\.md$/, '')}/`
    }))
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'LYS Blog',
    description: '记录代码、想法、日记和长期沉淀的个人博客。',
    site: context.site,
    items
  });
}
