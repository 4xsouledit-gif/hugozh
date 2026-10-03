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

## 这一页解决什么问题

`.Sitemap` 返回页面在 **sitemap 里的三项设置**：`ChangeFreq`（更新频率）、`Priority`（优先级）、`Disable`（是否排除）。它按「页面 front matter → 项目配置」的顺序回退，所以你可以在配置里设全局默认，再对个别页面覆盖。

它只在 **sitemap 模板**里用（上游说明），最典型的写法就是上游给的「最简 sitemap 模板」。别把它当成「页面属性」用在普通页面上。

## 什么时候用，什么时候别用

**该用**：

- 自定义 sitemap 模板，按页面输出 `<changefreq>`、`<priority>`；
- 对少数页面设置不同的更新频率（例如新闻页 `hourly`）；
- 把某页从 sitemap 排除（`disable = true`）。

**别用**：

- 想控制「页面是否发布」→ 用 `draft`、`publishDate`、`expiryDate`，不是 sitemap 设置；
- 想在普通页面模板里读这些值 → 上游限定在 sitemap 模板里使用；
- 想彻底不要 sitemap → 在配置里禁用输出格式，而不是逐页 `disable`。

**三个字段**：

| 字段 | 类型 | 默认 | 作用 |
| --- | --- | --- | --- |
| `ChangeFreq` | `string` | `""`（省略该元素） | sitemap 的 `<changefreq>` |
| `Priority` | `float` | `-1`（省略该元素） | sitemap 的 `<priority>`，取值 0.0–1.0 |
| `Disable` | `bool` | `false` | 设为 `true` 时排除该页 |

## 用法

对 `Page` 对象上 `Sitemap` 方法的访问仅限于 [sitemap 模板][]。

### 方法

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

### 示例

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

## 完整示例：逐页打印 sitemap 设置

测试站配置：

```toml
[sitemap]
changeFreq = 'monthly'
priority = 0.5
```

`content/posts/post-2.md` 的前置元数据：

```toml
[sitemap]
changeFreq = 'hourly'
```

`content/posts/no-sitemap.md` 的前置元数据：

```toml
[sitemap]
disable = true
```

sitemap 模板（`layouts/sitemap.xml`）：

```xml {file="layouts/sitemap.xml"}
{{ range .Pages }}
@@ {{ .Path }} cf={{ .Sitemap.ChangeFreq }} pr={{ .Sitemap.Priority }} dis={{ .Sitemap.Disable }}
{{ end }}
```

实测（Hugo 0.167.0，构建后的 `/en/sitemap.xml`）：

```text
@@ /posts/post-2 cf=hourly pr=0.5 dis=false
@@ /posts cf=monthly pr=0.5 dis=false
@@ /posts/no-sitemap cf=monthly pr=0.5 dis=true
```

**你应当看到什么**：被覆盖的页面拿到 `hourly`，其余页面回退到配置的 `monthly`；`priority` 来自配置；`no-sitemap` 的 `Disable` 是 `true`。**注意**：把 `disable = true` 的页面排除出 sitemap 是**模板的责任**——上游的内置模板会判断 `.Sitemap.Disable`，而上面这个最简模板没有判断，所以它照样输出了该页。自己写模板时别忘了：

```go-html-template
{{ range .Pages }}
  {{ if not .Sitemap.Disable }}…{{ end }}
{{ end }}
```

另外实测：多语言站点的根 `/sitemap.xml` 是 `sitemapindex`，各语言的 sitemap 才由 `layouts/sitemap.xml` 渲染（本站为 `/en/sitemap.xml`、`/zh/sitemap.xml`）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面设了 `[sitemap]` | 取页面值（实测 `hourly`、`disable = true`） | 否 |
| 页面没设 | 回退到 `[sitemap]` 配置（实测 `monthly`、`0.5`） | 否 |
| 配置也没设 | 上游说明：`ChangeFreq` 为 `""`、`Priority` 为 `-1`、`Disable` 为 `false`（省略对应元素） | 否 |
| `.Sitemap.Disable = true` | 字段为 `true`；**是否排除由模板决定**（实测最简模板仍会输出该页） | 否 |
| 在普通页面模板里访问 | 上游限定在 sitemap 模板；本站实测也能读到值（未报错），但请遵循上游用法 | 否 |
| 返回类型 | `config.SitemapConfig`（含 `ChangeFreq`、`Priority`、`Disable`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[changefreqdef]: https://www.sitemaps.org/protocol.html#changefreqdef
[prioritydef]: https://www.sitemaps.org/protocol.html#prioritydef
[sitemap templates]: /templates/sitemap/
