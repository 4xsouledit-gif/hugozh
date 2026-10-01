+++
title = "摘要"
linkTitle = "摘要"
description = "摘要的来源、模板用法，以及中文内容的长度统计。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/content-management/summaries/"
+++

<!-- 请保留下面这个手动摘要分隔符：本页后文会原样展示该标记，最先出现的那个会被 Hugo 当作本页摘要的分隔符。 -->

<!--more-->

摘要（summary）有三种来源：手动分隔、前置元数据、自动生成。三者的优先级依次降低——手动摘要优先于前置元数据摘要，前置元数据摘要优先于自动摘要。

## 手动摘要

在正文中插入 `<!--more-->` 分隔符，它之前的内容即为摘要，分隔符本身不会渲染出来：

```markdown
+++
title = '示例'
date = 2024-05-26T09:10:33-07:00
+++

这是第一段。

<!--more-->

这是第二段。
```

分隔符必须独占一行，不能与其他内容写在同一行。下面是正确与错误的两种放置方式：

```markdown
这是包含 **粗体文字** 的句子，后面还有一句话。

<!--more-->

这是另一段。
```

```markdown
这是包含 **粗体文字** <!--more--> 的句子，后面还有一句话。

这是另一段。
```

使用 Emacs Org Mode 内容格式时，改用 `# more` 作为摘要分隔符。

## 前置元数据摘要

前置元数据中的 `summary` 字段可以让摘要与正文完全解耦：

```markdown
+++
title = '示例'
date = 2024-05-26T09:10:33-07:00
summary = '这段摘要与正文内容无关。'
+++

这是第一段。

这是第二段。
```

## 自动摘要

既没有手动分隔符，也没有前置元数据摘要时，Hugo 依据项目配置中的 `summaryLength` 自动生成摘要，默认值为 `70`。自动摘要会在最接近该长度的段落边界处截断，同时至少给出 `summaryLength` 所要求的最少字词。

例如 `summaryLength = 7` 时，三段正文只会得到前两段：

```html
<p>This is the first paragraph.</p>
<p>This is the second paragraph.</p>
```

## 三种摘要的对比

| 类型 | 优先级 | 渲染 Markdown | 渲染短代码 | 为单行包裹 `<p>` |
| --- | :-: | :-: | :-: | :-: |
| 手动 | 1 | 是 | 是 | 是 |
| 前置元数据 | 2 | 是 | 否 | 否 |
| 自动 | 3 | 是 | 是 | 是 |

## 在模板中渲染摘要

在模板里对 `Page` 对象调用 `Summary` 方法即可输出摘要，用 `Truncated` 判断内容是否被截断，从而决定要不要补一个「继续阅读」链接：

```go-html-template
{{ range site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  <div class="summary">
    {{ .Summary }}
    {{ if .Truncated }}
      <a href="{{ .RelPermalink }}">继续阅读</a>
    {{ end }}
  </div>
{{ end }}
```

## 另一种做法

如果需要对长度做更精细的控制，可以不用 `Summary` 方法，改用 `strings.Truncate` 直接截断正文：

```go-html-template
{{ range site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  <div class="summary">
    {{ .Content | strings.Truncate 42 }}
  </div>
{{ end }}
```

## 中文内容的长度统计

中文不用空格分词，按「词」统计长度容易失真。在站点配置中开启 `hasCJKLanguage = true` 之后，Hugo 会按中日韩文字的字符数统计，自动摘要的截取与 `.WordCount` 才符合中文的语感：

```toml
hasCJKLanguage = true
summaryLength = 70
```

## 延伸阅读

- [前置元数据](/content-management/front-matter/)
- [内容格式](/content-management/content-formats/)
- [内容区块](/content-management/sections/)
- [配置](/configuration/)
