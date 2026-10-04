+++
title = "可运行示例"
linkTitle = "可运行示例"
description = "本站的示例不是贴出来的代码：每个示例都是 layouts 里真实执行的模板，输出由构建时现场产出；声明与参数写在内容页的前置元数据里，新增示例只改 content。"
date = 2026-10-04
weight = 95

[params]
examplesIndex = true      # 让 Markdown 出口（/examples/index.md）也带上本页索引

[params.teach]
difficulty = "参考"
time = "5 分钟"
prereq = [
  "知道 Hugo 模板里可以调用函数（例如 `strings.Truncate`、`collections.Where`）。",
  "读过[短代码](/shortcodes/)一章或[渲染钩子](/render-hooks/)一章中的任意一页，见过「本站实际渲染效果」面板。",
]
outcomes = [
  "说清本站示例的三层结构：模板在 `layouts/partials/examples/`、声明在内容页 front matter、输出由构建时执行产出；",
  "读一个示例的面板：上半是模板源码、下半是同一份模板真跑出来的结果，两者不可能不一致；",
  "照着本章的约定，给任意参考页加一个可运行示例（写模板 + 在 front matter 里声明 + 正文里放一行短代码）。",
]
next = ["/shortcodes/", "/functions/", "/methods/"]

+++

## 这一章是什么

多数文档站在正文里贴一段代码，再贴一段「预期输出」——两段都是手写的，改了一处忘了另一处，读者按文档抄却跑不出同样的结果。

本站把这件事反过来做：**示例就是一个真实模板**。

- **实现在 `layouts/`**：`themes/hugo-docs-theme/layouts/partials/examples/<命名空间>/<名字>.html`，里面就是普通的 Hugo 模板，正常调用函数、正常输出 HTML；
- **声明在 `content/`**：页面 front matter 里的 `[[params.examples]]` 说明「用哪个模板、传什么参数、面板标题与说明」，正文里用一行 `{{</* examples */>}}` 决定它出现在哪儿；
- **面板上下两半**：上半是**这个文件的源码**（构建时用 `os.ReadFile` 读出，不是抄的），下半是**执行同一个文件**得到的结果。**代码与产物不可能漂移**；
- **两个出口同源**：页面的 Markdown 版本（URL 后接 `index.md`）会带上同样的模板源码与实际输出，人类与 AI 看到的是同一份事实。

因此，示例也是**可验证**的：模板写错、参数传错，构建直接失败——不会出现「文档里写得对、实际跑不出来」。

## 本站有哪些示例

{{< examples-index >}}

## 给一页加一个示例（三步）

**第 1 步**：写模板。新建 `themes/hugo-docs-theme/layouts/partials/examples/<命名空间>/<名字>.html`，例如 `examples/strings/truncate-card-title.html`：

```go-html-template
{{ $title := .args.title | default "…" }}
<p>{{ $title | strings.Truncate 12 }}</p>
```

约定：

- 上下文是 `dict "args" <声明里的 args> "page" <当前页面>`，所以参数用 `.args.xxx` 读，页面数据用 `.page`；
- 模板里的第一行注释会被原样展示，写示例时保持源码干净、便于阅读；
- 参数建议给 `default`，这样声明里不写 `args` 也能跑。

**第 2 步**：在内容页 front matter 里声明（放在所有标量字段与其它表之后）：

```toml
[[params.examples]]
id    = "strings/truncate-card-title"   # 对应 partials/examples/<id>.html
title = "给卡片标题限长"                 # 面板标题
args  = { size = 12, title = "…" }      # 传给模板的输入
note  = "面板下方的说明，支持 Markdown。" # 可选
```

**第 3 步**：在正文里放一行短代码，决定它出现在哪儿：

```md
{{</* examples */>}}
```

`hugo --ignoreCache --renderToMemory` 退出码为 0、且面板里出现了预期输出，就算接好了。

> [!NOTE]
> 同一个页面可以声明多个示例，`{{</* examples */>}}` 会按声明顺序全部渲染；只想放其中一个时，用 `{{</* examples id="…" */>}}`（见 `partials/example-panel.html` 的实现）。

## 相关章节

- [短代码](/shortcodes/)：文档页里最早的一批「真实产物」演示，用的是 `demo` 短代码；
- [渲染钩子](/render-hooks/)：钩子产物的现场对照；
- [函数](/functions/) 与[方法](/methods/)：可运行示例的主要落点。
