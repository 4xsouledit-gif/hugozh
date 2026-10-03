+++
title = "安全函数"
linkTitle = "safe"
description = "使用这些函数在 Go 的 html/template 包的上下文中把值声明为安全。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/functions/safe/"
+++

## 这一页解决什么问题

Hugo 渲染 HTML 时用的是 Go 的 `html/template`，它为了防注入会在**每种上下文里分别转义字符串**：HTML 正文里 `<` 变 `&lt;`，属性里遇到不认识的 URL 协议就换成 `ZgotmplZ`，JS 引号之间把 `&` 写成 `\u0026`。

这套机制保护的是「拼接来自外部的字符串」这种写法。但有时你手里的字符串**本来就是一段正确的 HTML／CSS／JS**，例如自己写的图标片段、从配置读出的样式值。这时再转义就把它弄坏了。`safe.*` 系列函数就是那个开关：**告诉模板引擎「这段内容我担保安全，请原样输出」**。

## 什么时候用，什么时候别用

先按「这段内容要放到哪里」挑函数：

| 内容要放的位置 | 用哪个函数 | 返回类型 |
| --- | --- | --- |
| HTML 正文里的一段片段 | [`safe.HTML`](/functions/safe/html/)（`safeHTML`） | `template.HTML` |
| 一个完整的属性键值对，如 `datetime="2024-05-26"` | [`safe.HTMLAttr`](/functions/safe/htmlattr/)（`safeHTMLAttr`） | `template.HTMLAttr` |
| `href`、`src` 等 URL 位置 | [`safe.URL`](/functions/safe/url/)（`safeURL`） | `template.URL` |
| `style` 属性或 `<style>` 里的 CSS | [`safe.CSS`](/functions/safe/css/)（`safeCSS`） | `template.CSS` |
| `<script>` 里作为**表达式**的 JS | [`safe.JS`](/functions/safe/js/)（`safeJS`） | `template.JS` |
| `<script>` 里作为**字符串内容**（引号之间）的 JS | [`safe.JSStr`](/functions/safe/jsstr/)（`safeJSStr`） | `template.JSStr` |

**该用**：

- 内容来自你自己的模板、站点配置或其它可信来源，且你已经确认它就是合法的 HTML／CSS／JS／URL；
- 需要突破 `html/template` 的默认转义，例如放行 `irc:` 这类协议，或让 `<em>` 真的变成强调而不是文本。

**别用**：

- 内容来自用户输入、前端表单、远端接口 → 一律不要用 `safe.*`。需要处理远端 JSON 时，用 [`transform.Unmarshal`](/functions/transform/unmarshal/) 解析成对象再交给模板，模板会在 JS 上下文里输出已清理的 JSON；
- 只是「想让 HTML 标签正常显示」→ 先确认这段字符串真的该被当 HTML；多数情况下应该改模板结构，而不是加 `safeHTML`；
- 想输出 Markdown → 用 [`transform.Markdownify`](/functions/transform/markdownify/)，不要手工拼 HTML 再 `safeHTML`。

## 完整示例：六个函数在同一页里的前后对比

```go-html-template {file="layouts/index.html"}
未声明 HTML：{{ $html := "<em>emphasized</em>" }}{{ $html }}
已声明 HTML：{{ $html | safeHTML }}
未声明 URL：<a href="{{ $href := "irc://irc.freenode.net/#golang" }}{{ $href }}">IRC</a>
已声明 URL：<a href="{{ $href | safeURL }}">IRC</a>
未声明 CSS：<p style="{{ $style := "color: red;" }}{{ $style }}">foo</p>
已声明 CSS：<p style="{{ $style | safeCSS }}">foo</p>
未声明 JS 表达式：<script>const a = {{ $js := "x + y" }}{{ $js }}</script>
已声明 JS 表达式：<script>const a = {{ $js | safeJS }}</script>
未声明 JS 字符串：<script>const t = "Title: " + {{ $title := "Lilo & Stitch" }}{{ $title }};</script>
已声明 JS 字符串：<script>const t = "Title: " + {{ $title | safeJSStr }};</script>
```

Hugo 0.167.0 实测渲染为：

```html
未声明 HTML：&lt;em&gt;emphasized&lt;/em&gt;
已声明 HTML：<em>emphasized</em>
未声明 URL：<a href="#ZgotmplZ">IRC</a>
已声明 URL：<a href="irc://irc.freenode.net/#golang">IRC</a>
未声明 CSS：<p style="ZgotmplZ">foo</p>
已声明 CSS：<p style="color: red;">foo</p>
未声明 JS 表达式：<script>const a = "x + y"</script>
已声明 JS 表达式：<script>const a = x + y</script>
未声明 JS 字符串：<script>const t = "Title: " + "Lilo \u0026 Stitch";</script>
已声明 JS 字符串：<script>const t = "Title: " + "Lilo & Stitch";</script>
```

**你应当看到什么**：每一对「未声明 / 已声明」的差别就是 `safe.*` 的全部作用——未声明的一侧被转义或被替换成 `ZgotmplZ`，已声明的一侧原样输出。注意 JS 表达式那一对：未声明时 `x + y` 被当成**字符串**输出成了 `"x + y"`，这正是 `safe.JS` 与 `safe.JSStr` 的区别来源。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 传入正常字符串 | 返回对应的 `template.*` 类型（实测：`safeHTML`→`template.HTML`、`safeCSS`→`template.CSS`、`safeURL`→`template.URL`、`safeJS`→`template.JS`、`safeJSStr`→`template.JSStr`、`safeHTMLAttr`→`template.HTMLAttr`） | 否 |
| 传入 `nil` | 输出空字符串（实测 `safeHTML nil`、`safeCSS nil`、`safeURL nil` 都渲染为空） | 否 |
| 传入数字 | 转成该数字的字符串再声明安全（实测 `safeHTML 42` 输出 `42`） | 否 |
| 传入不安全的 URL（如 `javascript:`）并 `safeURL` | 原样进入 `href`，但括号会被 URL 规范化（实测 `javascript:alert%281%29`）——**声明安全不等于内容安全** | 否 |
| 传入带 `</script>` 的字符串并 `safeJSStr` | 原样输出，会真的提前结束 `<script>` 元素——**这是 `safe.*` 的风险点** | 否 |
| 传入的字符串本身非法（如未闭合标签） | 函数不做校验，原样返回（上游说明：不要用于未闭合标签或注释） | 否 |

结论：`safe.*` 系列**从不报错、从不校验**，它只是一个类型转换。安全性完全由调用方负责。

## 读完本章你应该能够

- 按「内容最终落在哪种上下文」选出正确的 `safe.*` 函数，而不是一律用 `safeHTML`
- 解释 `ZgotmplZ` 是什么、为什么出现，以及该修转义还是该修数据
- 判断一处 `safe.*` 是否引入了注入风险，并知道不可信内容的替代做法
- 说清 `safe.JS` 与 `safe.JSStr` 的区别（表达式 vs 引号内的字符串内容）

## 阅读顺序

1. [safe.HTML](/functions/safe/html/) 与 [safe.HTMLAttr](/functions/safe/htmlattr/) —— 最常用的两个；
2. [safe.URL](/functions/safe/url/) —— 处理 `href`、`src`；
3. [safe.CSS](/functions/safe/css/) —— 处理 `style`；
4. [safe.JS](/functions/safe/js/) 与 [safe.JSStr](/functions/safe/jsstr/) —— 处理 `<script>`。

更多排查入口见[故障排查](/troubleshooting/)。
