+++
title = "HeadingsFiltered"
linkTitle = "HeadingsFiltered"
description = "返回与给定页面相关的每个页面的标题切片。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/methods/page/headingsfiltered/"

[params.functions_and_methods]
signatures = ["PAGE.HeadingsFiltered"]
returnType = "tableofcontents.Headings"
+++

## 这一页解决什么问题

「相关文章」列表如果只列出文章标题，读者还得再点进去找重点。`.HeadingsFiltered` 给出**相关页面上真正与当前页匹配的那几个标题**，于是可以在相关文章下面直接列出「相关小节」的锚点链接。

它只有在配置了 `[related]` 中 `type = 'fragments'` 的索引之后才有内容（见下例）。

## 什么时候用，什么时候别用

**该用**：

- 「参见」区块想精确到小节：`<a href="/page/#section-1">Section 1</a>`；
- 用 [`Pages.Related`](/methods/pages/related/) 取到相关页面之后，展示它们的命中标题。

**别用**：

- 只想列出相关文章的**标题** → 用 `.Related` 返回页面的 `.LinkTitle`，不需要本方法；
- 想输出本页目录 → 用 [`Fragments`](/methods/page/fragments/) 或 [`TableOfContents`](/methods/page/tableofcontents/)；
- 没有配置 fragments 索引 → 实测返回空，`with .HeadingsFiltered` 不执行（不会报错）。

## 用法

与 [`Pages`](/methods/pages/) 对象上的 [`Related`](/methods/pages/related/) 方法配合使用。详见[说明][]。

## 完整示例：相关文章列出命中小节

最小站点：

```toml
[related]
threshold = 0
includeNewer = true
toLower = true

[[related.indices]]
name = 'fragmentrefs'
type = 'fragments'
applyFilter = true
weight = 80
```

`content/docs/guide/delta.md` 的前置元数据写 `fragmentrefs = ['section-1']`，正文标题为 `## Section 1` 与 `## Tuna 的做法`；`content/docs/guide/alpha.md` 的 `keywords` 含 `tuna`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ $related := .Site.RegularPages.Related . | first 5 }}
{{ with $related }}
<ul>
{{ range $i, $p := . }}
  <li>
    <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
    {{ with .HeadingsFiltered }}
    <ul>
      {{ range . }}
      <li><a href="{{ printf "%s#%s" $p.RelPermalink .ID | safeURL }}">{{ .Title }}</a></li>
      {{ end }}
    </ul>
    {{ end }}
  </li>
{{ end }}
</ul>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，`alpha` 页面输出：

```html
<ul>

  <li>
    <a href="/docs/guide/delta/">Delta</a>
    
    <ul>
      
      <li><a href="/docs/guide/delta/#section-1">Section 1</a></li>
      
    </ul>
    
  </li>

</ul>
```

（空行来自模板里的换行，不影响 HTML 语义。）

**你应当看到什么**：`.Related` 找到的是 `Delta`；`.HeadingsFiltered` 只在 `Delta` 上给出命中的 `Section 1`（`.ID` 为 `section-1`，`.Title` 为 `Section 1`），`Tuna 的做法` 没有出现。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；按上面的 `[related]` 配置，相关页面声明了 `fragmentrefs`。

| 调用位置 | 结果 | 是否报错 |
| --- | --- | --- |
| 相关结果里的页面（`Delta`） | 命中的标题切片：1 项（`section-1` / `Section 1`） | 否 |
| 页面**自己**的 `.HeadingsFiltered` | 空切片 | 否 |
| 没有配置 fragments 索引时 | 空切片，`with` 判为假 | 否 |
| 译文页面（没有相关结果） | 空切片 | 否 |
| 返回类型 | `tableofcontents.Headings`（每项有 `.ID`、`.Title`、`.Level`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 什么都没输出 | `with .HeadingsFiltered` 不执行 | 没有配置 `type = 'fragments'` 的相关索引，或 `applyFilter` 没开 | 按上例补 `[related]` 配置 |
| 没报错但结果不对 | 命中标题与预期不符 | `fragmentrefs` 声明的片段与实际标题不对应 | 让 `fragmentrefs` 里写标题的 `id`（可用 [`Fragments`](/methods/page/fragments/) 的 `Identifiers` 核对） |
| 链接跳到页面顶部 | 锚点里缺少 `#id` | 用了 `$p.RelPermalink` 而没有拼 `.ID` | 用 `printf "%s#%s" $p.RelPermalink .ID`（如上游示例） |

更多排查入口见[故障排查](/troubleshooting/)。

[`Pages`]: /methods/pages/
[`Related`]: /methods/pages/related/
[说明]: /content-management/related-content/#index-content-headings
