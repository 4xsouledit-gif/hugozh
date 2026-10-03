+++
title = "strings.Truncate"
linkTitle = "Truncate"
description = "返回给定字符串，截断到最大长度，同时不切断单词、不留下未闭合的 HTML 标签。"
date = 2026-10-02
weight = 320
source = "https://gohugo.io/functions/strings/truncate/"

[params.functions_and_methods]
signatures = ["strings.Truncate SIZE [ELLIPSIS] STRING"]
returnType = "template.HTML"
aliases = ["truncate"]
+++

## 这一页解决什么问题

列表页的卡片标题、`<meta name="description">`、分享卡片，都需要把一段长文字压到「N 个字符以内」。直接切字符串会有两个后果：切在单词或词组中间，读起来断气；切在 HTML 标签中间，标签不再闭合，可能把整页排版带崩。

`strings.Truncate` 处理的就是这件事：按最大长度截断，并尽量停在词边界；当输入被标记为安全 HTML 时，它还会补全被截断的标签。

截断被标记为安全 HTML 的值（例如 [`safe.HTML`][] 函数返回的值）时，`strings.Truncate` 会补全因截断而未闭合的标签，而不是从标签中间切断：

```go-html-template
{{ "<em>Keep my HTML</em>" | safeHTML | strings.Truncate 10 }} → <em>Keep my …</em>
```

> [!NOTE]
> 如果有一段包含 HTML 标签的原始字符串需要按 HTML 处理，请先用 [`safe.HTML`][] 函数转换；否则 `strings.Truncate` 会转义这些标签。

## 什么时候用，什么时候别用

**该用**：

- 给 front matter 字段（标题、描述、自定义的 `subtitle` 等）限长后再输出；
- 输入可能是 HTML 片段，又不能让标签被截断——先转成安全 HTML，再交给 `strings.Truncate`；
- 长度按**字符（rune）**计算，中文一个字算一个（实测，见下）。

**别用**：

- 想精确截到第 N 个字符、且**不要省略号** → 用 [`strings.Substr`](/functions/strings/substr/)（实测：`strings.Substr "中文测试文本内容" 0 4` → `中文测试`）；
- 想要页面正文的自动摘要（由 `summaryLength` 或 `<!--more-->` 决定）→ 用 `Page` 的 `.Summary`，见[内容摘要](/content-management/summaries/)；
- 想把 HTML 全部去掉、只留文字 → 用 [`transform.Plainify`](/functions/transform/plainify/)；
- 输入含 HTML 标签、又不希望标签被转义 → 先用 [`safe.HTML`](/functions/safe/html/) 转换（见上方提示）：实测不加 `safeHTML` 时，`"<em>Keep my HTML</em>" | strings.Truncate 10` 输出 `&lt;em&gt;Keep …`，标签变成了可见文本。

## 完整示例：给卡片标题限长

把下面这段直接放进任意会渲染 HTML 的模板（例如 `layouts/_partials/card.html`）：

```go-html-template {file="layouts/_partials/card.html"}
{{ $title := "把你的 Hugo 站点部署到线上：从构建到发布" }}
<p>{{ $title | strings.Truncate 12 }}</p>
<p>{{ $title | strings.Truncate 12 "" }}</p>
<p>{{ "<em>Keep my HTML</em>" | safeHTML | strings.Truncate 10 }}</p>
```

Hugo 渲染为：

```html
<p>把你的 Hugo 站点部 …</p>
<p>把你的 Hugo 站点部</p>
<p><em>Keep my …</em></p>
```

**你应当看到什么**：第一行在 12 个字符处停住，并补上默认省略号；第二行把 `ELLIPSIS` 显式传成空字符串 `""`，于是没有省略号；第三行先转成安全 HTML，截断后 `<em>` 被自动补上闭合标签。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 输入空字符串 | 空字符串 | 否 |
| 输入 `nil` | 空字符串 | 否 |
| `SIZE` 为 `0` 或负数 | 只剩省略号（`ELLIPSIS` 为空时得到空字符串） | 否 |
| `SIZE` 大于等于字符串长度 | 原样返回，**不追加省略号**（`strings.Truncate 15` 对 `hello world foo` → `hello world foo`） | 否 |
| 输入是数字或浮点数 | 先当字符串处理（`strings.Truncate 3` 对 `12345` → `123 …`） | 否 |
| 第一个词比 `SIZE` 长 | 会在词中间切开（`strings.Truncate 5` 对 `abcdefghij klm` → `abcde …`） | 否 |
| 返回值类型 | `template.HTML`（即使输入是普通字符串） | 否 |
| 一个参数都不传 | —— | 是，`wrong number of args for Truncate: want at least 1 got 0` |

`SIZE` 按 **rune** 计数，不按字节：`"中文测试文本内容"` 是 8 个汉字（`len` 得到 24，那是字节数；`strings.CountRunes` 得到 8），`strings.Truncate 4` 输出 `中文测试 …`。

> [!NOTE]
> 上游描述里的「不切断单词」是**尽力而为**：只有词边界不早于 `SIZE` 时才做得到；当第一个词本身就比 `SIZE` 长时，仍会切在词中间（上表中对应行均为实测）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 截断结果里出现 `&lt;em&gt;` 这样的可见标签 | 输入是普通字符串，`strings.Truncate` 会转义其中的 HTML | 先用 [`safe.HTML`](/functions/safe/html/) 转换再截断 |
| 没报错但结果不对 | 截断后页面排版错乱，标签串到了后面的内容上 | 用别的字符串函数切了带 HTML 的文本，标签没有闭合 | 改用 `strings.Truncate` 并先把输入转成 `safe.HTML` |
| 没报错但结果不对 | 输出为空，或只剩一个省略号 | `SIZE` 算成了 `0` 或负数（常见于变量没取到值） | 确认 `SIZE` 来自 `len` 或配置且不小于 1；空输入本来就会返回空字符串 |
| 没报错但结果不对 | 中文标题被截得比预期短或长 | 把 `SIZE` 当成了字节数 | `SIZE` 是 rune 数，一个汉字算 1 个（见上表） |
| 报错看不懂 | `wrong number of args for Truncate: want at least 1 got 0` | 没传 `SIZE`：签名是 `strings.Truncate SIZE [ELLIPSIS] STRING` | 按签名补齐参数，`ELLIPSIS` 可省略，`STRING` 必须有 |

更多排查入口见[故障排查](/troubleshooting/)。

[`safe.HTML`]: /functions/safe/html/
