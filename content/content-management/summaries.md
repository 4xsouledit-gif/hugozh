+++
title = "摘要"
linkTitle = "摘要"
description = "摘要的三种来源与优先级、模板用法、自动截断的实际规则，以及中文内容的长度统计；含验证方法与常见坑。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/content-management/summaries/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "会写前置元数据（front matter），知道项目配置 `hugo.toml` 在哪。",
  "有一个能渲染列表页的模板，能打印 `.Summary` 与 `.Truncated`。",
]
outcomes = [
  "说清手动分隔、前置元数据、自动摘要三者的优先级，知道谁覆盖谁；",
  "预判自动摘要会截到哪里——它不是按词数从句子中间切，而是按段落累积；",
  "解释「摘要很短却 `.Truncated` 为 false」这类现象；",
  "在模板里正确渲染摘要，并决定要不要显示「继续阅读」链接。",
]
next = ["/content-management/front-matter/", "/content-management/formats/", "/functions/strings/truncate/"]

+++

<!-- 请保留下面这个手动摘要分隔符：本页后文会原样展示该标记，最先出现的那个会被 Hugo 当作本页摘要的分隔符。 -->

<!--more-->

## 这一页解决什么问题

摘要（summary）有三种来源：手动分隔、前置元数据、自动生成。三者的优先级依次降低——手动摘要优先于前置元数据摘要，前置元数据摘要优先于自动摘要。

它是列表页最容易「看着不对但说不出哪里错」的地方：摘要不是按字数从句子中间硬切的。这一页给出一条能自己复现的规则，并配一个验证动作。

**验证摘要行为的最小方法**：在列表模板里同时打印摘要与截断标记，然后改内容看结果。

```go-html-template
<p>truncated={{ .Truncated }} wc={{ .WordCount }}</p>
<div class="summary">{{ .Summary }}</div>
```

**你应当看到什么**（**实测：Hugo 0.167，`summaryLength = 10`**）：

| 内容结构 | `.Summary` 取到 | `.Truncated` |
| --- | --- | --- |
| 三段各 6 词，无 `<!--more-->` | **前两段**（共 12 词，累计已 ≥ 10） | `true` |
| 三段各 20 词，无 `<!--more-->` | **只有第一段**（20 词，已 ≥ 10） | `true` |
| 单段 60 词，无 `<!--more-->` | **整段 60 词** | `false` |
| 正文中写了 `<!--more-->` | 分隔符之前的全部内容 | 分隔符之后还有内容时为 `true` |

结论：**自动摘要按「段落」累积，直到累计词数达到 `summaryLength` 为止，不会把一段话从中间切开**。所以单段长文的摘要会很长、而且 `.Truncated` 是 `false`——这不是 bug，而是「没有可截断的位置」。想让列表页摘要短而整齐，最可靠的做法是写 `<!--more-->` 或前置元数据的 `summary`。

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

> [!NOTE]
> 分隔符必须独占一行，不能与其他内容写在同一行。

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

**你应当看到什么**：手动摘要是三种来源里唯一「优先级最高」的——即使前置元数据里也写了 `summary`，`<!--more-->` 分隔出来的内容仍然优先。验证方法：两者同时写上，然后看列表页显示的是分隔符前面那段，而不是 `summary` 字段。

## 前置元数据摘要

前置元数据中的 `summary` 字段可以让摘要与正文完全解耦：

```markdown
+++
title = '示例'
date = 2024-05-26T09:10:33-07:00
summary = '这段摘要与正文无关。'
+++

这是第一段。

这是第二段。
```

> [!IMPORTANT]
> 前置元数据摘要**不会渲染短代码，也不会给单行包 `<p>`**（见下面的对比表）。所以它输出的是一段纯文本，`{{ .Summary }}` 插进 HTML 时不会自带段落标签——需要段落就用 `<p>{{ .Summary }}</p>` 自己包，或者改用 `<!--more-->`。

## 自动摘要

既没有手动分隔符，也没有前置元数据摘要时，Hugo 依据项目配置中的 `summaryLength` 自动生成摘要，默认值为 `70`。自动摘要会在最接近该长度的段落边界处截断，同时至少给出 `summaryLength` 所要求的最少字词。

例如项目配置里写：

```toml
summaryLength = 7
```

三段正文（`This is the first paragraph.` / `This is the second paragraph.` / `This is the third paragraph.`）只会得到前两段：

```html
<p>This is the first paragraph.</p>
<p>This is the second paragraph.</p>
```

**配置位置与写法**：`summaryLength` 是项目配置**根层级**的标量键（写在 `hugo.toml` 顶部，任何 `[table]` 表头**之前**）。写完可以用下面的命令确认它真的生效了——注意输出里的键名是全小写的：

```bash
hugo config | findstr summarylength      # Windows
hugo config | grep summarylength         # macOS / Linux
```

**你应当看到什么**：输出形如 `summarylength = 70`。如果这里的值和你写的不一致，说明它被并进了某张表（写在了表头之后）——`hugo config` 不会报错，只会安静地使用默认值。

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

如果需要对长度做更精细的控制，可以不用 `Summary` 方法，改用 [`strings.Truncate`](/functions/strings/truncate/) 直接截断正文：

```go-html-template
{{ range site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  <div class="summary">
    {{ .Content | strings.Truncate 42 }}
  </div>
{{ end }}
```

**两者的区别**：`.Summary` 是「按段落/分隔符截断的 HTML」，可能很长也可能很短，但一定是完整的标签结构；`strings.Truncate` 是「按字符数硬截」，长度可预期，但**可能把标签或单词切断**。列表页要整齐的固定长度就用后者，要保留内容自然边界就用前者。

## 什么时候用哪种摘要

| 情形 | 该用 | 理由 |
| --- | --- | --- |
| 想让摘要停在某个自然的位置 | `<!--more-->` | 你决定截在哪，优先级最高，且渲染 Markdown 与短代码 |
| 摘要要与正文完全不同（营销文案式导语） | 前置元数据 `summary` | 与正文解耦，改摘要不用动正文 |
| 懒得管、接受自动截断 | `summaryLength` | 零成本，但要接受「按段落」的粗糙粒度 |
| 列表页需要严格等长的摘要 | `strings.Truncate` | 长度可控；代价是可能切断标签 |
| **别用**：在同一页同时依赖自动摘要与 `<!--more-->` | —— | `<!--more-->` 优先，`summaryLength` 在这页上就不起作用了，容易误以为配置失效 |
| **别用**：把 `<!--more-->` 写在句子中间 | —— | 分隔符只认独占一行；行内出现时它会被当作普通注释，摘要行为与预期不符 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 单段长文的摘要是整段，`.Truncated` 还是 `false` | 自动摘要按段落累积，不会从段落中间截断（实测：Hugo 0.167） | 想要短摘要就写 `<!--more-->` 或前置元数据 `summary` |
| 没报错但结果不对 | 调了 `summaryLength` 却没有任何变化 | 该页有 `<!--more-->` 或 `summary`（两者优先级更高）；或键写在了某张表头之后 | 检查该页有没有更高优先级的摘要来源；用 `hugo config` 确认 `summarylength` 的实际值 |
| 没报错但结果不对 | 列表页上摘要没有段落标签 | 用的是前置元数据 `summary`——它不包 `<p>` | 模板里自己包 `<p>`，或改用 `<!--more-->` |
| 没报错但结果不对 | 摘要里出现了短代码的字面文字 | 用的是前置元数据 `summary`——它不渲染短代码 | 改用 `<!--more-->`，或把 `summary` 里的短代码改成等价正文 |
| 没报错但结果不对 | 中文页面的摘要长度离谱 | 没开 `hasCJKLanguage`，按空格分词统计长度对中文失真 | 项目配置里设 `hasCJKLanguage = true`（本站已开启） |
| 报错看不懂 | 构建报短代码相关的错误，位置却指向摘要附近 | `<!--more-->` 被写在了行内，摘要边界与预期不同，截出的片段破坏了短代码 | 把分隔符移到独占一行的位置 |

更多排查入口见[故障排查](/troubleshooting/)。

## 中文内容的长度统计

中文不用空格分词，按「词」统计长度容易失真。在站点配置中开启 `hasCJKLanguage = true` 之后，Hugo 会按中日韩文字的字符数统计，自动摘要的截取与 `.WordCount` 才符合中文的语感：

```toml
hasCJKLanguage = true
summaryLength = 70
```

## 延伸阅读

- [前置元数据](/content-management/front-matter/)
- [内容格式](/content-management/formats/)
- [内容区块](/content-management/sections/)
- [配置](/configuration/)
