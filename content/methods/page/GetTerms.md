+++
title = "GetTerms"
linkTitle = "GetTerms"
description = "返回给定页面在指定分类法中定义的术语所对应的术语页集合，顺序与它们在前置元数据中出现的先后一致。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/page/getterms/"

[params.functions_and_methods]
signatures = ["PAGE.GetTerms TAXONOMY"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`GetTerms` 取当前页面在某个分类法下**实际用到的术语页**（不是全部术语）。文章底部的标签区块、按标签做相关内容、生成术语链接，都用它；顺序与前置元数据中书写的先后一致。

## 什么时候用，什么时候别用

**该用**：

- 文章底部列出 tags / categories 并链接到术语页；
- 需要术语**页对象**（`.RelPermalink`、`.Title`、`.Pages` 等），而不是字符串。

**别用**：

- 只想把标签当**字符串**显示 → 用 `.Params.tags` 或 [`Keywords`](/methods/page/keywords/) 更轻；
- 想要**全部**术语（做标签云）→ 用 `site.Taxonomies.tags` 或分类法页的 `.Data.Terms`；
- 想按标签筛出页面 → 用 [`where`](/functions/collections/where/) 比较 `.Params.tags`。

## 用法

给定如下前置元数据：

```toml
title = 'Les Misérables'
tags = ['historical','classic','fiction']
```

这段模板代码：

```go-html-template
{{ with .GetTerms "tags" }}
  <p>Tags</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

会渲染为：

```html
<p>Tags</p>
<ul>
  <li><a href="/tags/historical/">historical</a></li>
  <li><a href="/tags/classic/">classic</a></li>
  <li><a href="/tags/fiction/">fiction</a></li>
</ul>
```

## 完整示例：在文章底部列出标签

最小站点：`content/docs/guide/alpha.md` 的前置元数据写 `tags = ['hugo', 'docs']`；`beta.md` 没有标签。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with .GetTerms "tags" }}
<p>Tags</p>
<ul>
{{ range . }}<li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>{{ end }}
</ul>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 页面输出：

```html
<p>Tags</p>
<ul>
<li><a href="/tags/hugo/">Hugo</a></li><li><a href="/tags/docs/">Docs</a></li>
</ul>
```

beta（没有标签）不输出任何内容。

**你应当看到什么**：顺序是 `hugo`、`docs`，与前置元数据中的书写顺序一致；`.LinkTitle` 取的是术语页标题，实测输出 `Hugo` / `Docs`（首字母大写），而上游示例里显示的是小写术语名——那取决于站点的数据与配置，需要小写原值时用 `.Data.Term` 或自己处理大小写。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 的 `tags = ['hugo','docs']`，`beta.md` 无标签。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面有 2 个该分类法的值 | 2 个术语页，顺序与前置元数据一致 | 否 |
| 页面没有该分类法的值 | **空切片**，`with` 判为假 | 否 |
| 返回类型 | `page.Pages`，元素是术语页（可取 `.RelPermalink`、`.Title`、`.Data.Term` 等） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 什么都没输出 | `with .GetTerms "tags"` 不执行 | 分类法名与 `[taxonomies]` 里的**键名**不一致，或该页没有这个分类法的值 | 用配置里的键名（如 `tags`），并确认前置元数据字段名一致 |
| 没报错但结果不对 | 术语链接的文字大小写与前置元数据不同 | `.LinkTitle` 是页面标题 | 需要原样字符串时用 `.Data.Term` 或 `.Params.tags` |
| 没报错但结果不对 | 想显示「全部标签」却只有本文的 | `GetTerms` 只返回当前页面用到的术语 | 标签云改用 `site.Taxonomies.tags` 或分类法页的 `.Data.Terms` |

更多排查入口见[故障排查](/troubleshooting/)。

