+++
title = "lang.Merge"
linkTitle = "Merge"
description = "返回给定页面集合的副本，其中缺失的译文页面由另一个页面集合补齐。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/lang/merge/"

[params.functions_and_methods]
signatures = ["lang.Merge FROM TO"]
returnType = "any"
+++

## 这一页解决什么问题

多语言站点里，某个语言可能只翻译了一部分页面。列表页（首页文章流、归档页）如果只显示本语言的页面，读者会看到「文章突然变少」。`lang.Merge` 把本语言的页面集合与其它语言的页面集合合并，用其它语言**补齐缺口**——已经翻译的仍然显示译文，没翻译的显示原文。

## 什么时候用，什么时候别用

**该用**：

- 列表页需要「所有页面都出现」，即使部分页面没有当前语言的译文；
- 按上游示例那样，一次合并多个语言。

**别用**：

- 合并**映射/字典**（`dict`）→ **不支持**（实测会直接让构建失败，见下文）；
- 只想显示当前语言的页面 → 直接用 `site.RegularPages`；
- 合并站点配置 → 那是配置合并（`config` 的 merge 语义），与本函数无关。

## 用法

例如：

```sh
{{ $pages := .Site.RegularPages | lang.Merge $frSite.RegularPages | lang.Merge $enSite.RegularPages }}
```

会按从左到右的顺序，先用法语站点的内容、最后用英语站点的内容，为当前站点「填补空缺」。

更实用的例子是用其它语言补齐缺失的译文：

```sh
{{ $pages := .Site.RegularPages }}
{{ range .Site.Home.Translations }}
  {{ $pages = $pages | lang.Merge .Site.RegularPages }}
{{ end }}
```

> [!NOTE]
> 管道写法里 `{{ $pages | lang.Merge $other }}` 等价于 `lang.Merge $other $pages`：**第一个参数是「用来补的」，第二个参数是「要被补的」**，返回值是补好之后的集合。

## 完整示例（实测）

测量站点：`defaultContentLanguage='en'`、`defaultContentLanguageInSubdir=true`，语言 `en`、`zh`；`content/posts/` 下有 `post-1.md`（英语）、`post-1.zh.md`（中文）、`post-2.md`、`post-3.md`（只有英语）。

```go-html-template {file="layouts/index.html"}
{{ $pages := site.RegularPages }}
{{ range site.Home.Translations }}
  {{ $pages = $pages | lang.Merge .Site.RegularPages }}
{{ end }}
合并前：{{ range site.RegularPages }}{{ .Title }}({{ .Lang }});{{ end }}
合并后：{{ range $pages }}{{ .Title }}({{ .Lang }});{{ end }}共 {{ len $pages }} 篇
```

在**中文站点**渲染（`public/zh/index.html`），Hugo 0.167.0 实测输出：

```text
合并前：文章一 ZH(zh);
合并后：Post Three EN(en);Post Two EN(en);文章一 ZH(zh);共 3 篇
```

**你应当看到什么**：中文站本来只有 1 篇；合并英语页面后变成 3 篇——`post-1` 保留**中文译文**（没有被英文版覆盖），缺失的 `post-2`、`post-3` 从英语站补进来，所以合并结果里 `.Lang` 是混合的（`en` 与 `zh` 都有）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；配置与内容如上的双语站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面集合合并（实测） | 本语言的页面保留，缺失页面由 `FROM` 集合补齐；实测 `len` 从 1 变成 3，且元素来自不同语言 | 否 |
| 合并 `dict`（实测 `lang.Merge (dict "a" 1) (dict "b" 2)`） | —— | **是，构建失败**：`error calling Merge: language merge not supported for map[string]interface {}` |
| 返回类型 | `any`（实际是页面集合，可直接 `range` / `len`） | 否 |

> [!WARNING]
> 本函数只支持**页面集合**。把它用在 `dict` 上不会「合并两个映射」，而是直接让整站构建失败（实测报错见上表）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `language merge not supported for map[string]interface {}`，整站构建失败 | 把 `lang.Merge` 当成通用的 map 合并用了 | 只在页面集合上使用；合并映射请自己在模板里逐键处理 |
| 没报错但结果不对 | 合并后标题语言混杂 | 这是本函数的预期行为：缺译文的页面用原文顶上 | 需要在列表里标注语言时读 `.Lang`；或只渲染有译文的页面 |
| 没报错但结果不对 | 本语言的译文被覆盖了 | 参数顺序理解反了：管道写法中「被补的」是左边的值 | 记住 `x \| lang.Merge $fallback` = 用 `$fallback` 补 `x` |

更多排查入口见[故障排查](/troubleshooting/)。
