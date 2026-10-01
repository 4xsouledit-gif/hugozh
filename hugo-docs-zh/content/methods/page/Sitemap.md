+++
title = "Sitemap"
linkTitle = "Sitemap"
description = "返回给定页面的 sitemap 设置：取自前置元数据，若没有则回退到项目配置中定义的 sitemap 设置。"
date = 2026-10-02
weight = 770
source = "https://gohugo.io/methods/page/sitemap/"

[params.functions_and_methods]
signatures = ["PAGE.Sitemap"]
returnType = "config.SitemapConfig"
+++

对 `Page` 对象上 `Sitemap` 方法的访问仅限于 [sitemap 模板][]。

## 方法

在 `Sitemap` 对象上使用这些方法。

`ChangeFreq`
: （`string`）页面可能发生变更的频率。合法取值为 `always`、`hourly`、`daily`、`weekly`、`monthly`、`yearly` 和 `never`。默认值为 `""`，此时 Hugo 会在 sitemap 中省略该字段。详见[说明][changefreqdef]。

  ```go-html-template
  {{ .Sitemap.ChangeFreq }}
  ```

`Disable`
: （`bool`）是否禁止包含该页面。默认为 `false`。在前置元数据中设为 `true` 即可排除该页面。

  ```go-html-template
  {{ .Sitemap.Disable }}
  ```

`Priority`
: （`float`）该页面相对于站点上任何其他页面的优先级。取值范围为 0.0 到 1.0。默认值为 `-1`，此时 Hugo 会在 sitemap 中省略该字段。详见[说明][prioritydef]。

  ```go-html-template
  {{ .Sitemap.Priority }}
  ```

## 示例

项目配置如下：

```toml
[sitemap]
changeFreq = 'monthly'
```

内容如下：

```toml
title = 'News'
[sitemap]
changeFreq = 'hourly'
```

再加上这个最简的 sitemap 模板：

```xml {file="layouts/sitemap.xml"}
{{ printf "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>" | safeHTML }}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  {{ range .Pages }}
    <url>
      <loc>{{ .Permalink }}</loc>
      {{ if not .Lastmod.IsZero }}
        <lastmod>{{ .Lastmod.Format "2006-01-02T15:04:05-07:00" | safeHTML }}</lastmod>
      {{ end }}
      {{ with .Sitemap.ChangeFreq }}
        <changefreq>{{ . }}</changefreq>
      {{ end }}
    </url>
  {{ end }}
</urlset>
```

news 页面的变更频率将是 `hourly`，其他页面则是 `monthly`。

[changefreqdef]: https://www.sitemaps.org/protocol.html#changefreqdef
[prioritydef]: https://www.sitemaps.org/protocol.html#prioritydef
[sitemap templates]: /templates/sitemap/
