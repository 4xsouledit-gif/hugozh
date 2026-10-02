+++
title = "transform.XMLEscape"
linkTitle = "XMLEscape"
description = "返回删除不允许的字符后再转义为对应 XML 形式的给定字符串。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/transform/xmlescape/"

[params.functions_and_methods]
signatures = ["transform.XMLEscape INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

生成 RSS/Atom/站点地图或任何 XML 输出时，文本里不能出现裸的 `<`、`&`、`"`，也不能出现 XML 规范不允许的控制字符。`transform.XMLEscape` 先按 XML 规范**删除不允许的字符**，再把这些字符转成实体——比 [`transform.HTMLEscape`](/functions/transform/htmlescape/) 多管了制表符、换行、回车。

注意：它**没有别名**，模板里必须写全名 `transform.XMLEscape`。

## 什么时候用，什么时候别用

**该用**：

- 自定义 RSS/Atom/OPML/sitemap 模板里输出标题、摘要、描述；
- 把任意文本嵌进 XML 元素内容或属性。

**别用**：

- HTML 页面里的转义 → 用 [`transform.HTMLEscape`](/functions/transform/htmlescape/)（它支持 `'`、`"` 的实体形式，且不处理空白）；
- JSON/JavaScript 上下文 → 用 [`encoding.Jsonify`](/functions/encoding/jsonify/)；
- 使用 Hugo **内置**的 RSS/sitemap 模板时 → 它们已经处理好转义，不用你再套一层。

## 上游给出的结果

`transform.XMLEscape` 函数先删除 XML 规范中定义的[不允许的字符][]，再把结果中的以下字符替换为 [HTML 实体][]来完成转义：

- `"` → `&#34;`
- `'` → `&#39;`
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `\t` → `&#x9;`
- `\n` → `&#xA;`
- `\r` → `&#xD;`

例如：

```go-html-template
{{ transform.XMLEscape "<p>abc</p>" }} → &lt;p&gt;abc&lt;/p&gt;
```

在由 Go 的 [`html/template`][] 包渲染的模板中使用 `transform.XMLEscape` 时，请把该字符串声明为安全 HTML，以免二次转义。例如在 RSS 模板中：

```xml {file="layouts/rss.xml"}
<description>{{ .Summary | transform.XMLEscape | safeHTML }}</description>
```

## 完整示例：在 HTML 模板与 XML 模板中的差别

```go-html-template {file="layouts/_partials/xml.html"}
<p>{{ transform.XMLEscape "<p>abc</p>" }}</p>
<p>{{ transform.XMLEscape "<p>abc</p>" | safeHTML }}</p>
<p>{{ transform.XMLEscape "a\tb" | safeHTML }}</p>
```

Hugo 渲染出的 HTML 为（变量赋值行本身会留下空行，这里省略）：

```html
<p>&amp;lt;p&amp;gt;abc&amp;lt;/p&amp;gt;</p>
<p>&lt;p&gt;abc&lt;/p&gt;</p>
<p>a&#x9;b</p>
```

**你应当看到什么**：第一行是**二次转义**的结果（`&amp;lt;`），因为它经过了 HTML 模板的自动转义；第二、三行用了 `safeHTML`，才能得到预期的 `&lt;p&gt;abc&lt;/p&gt;`——这正是上游提醒「在 `html/template` 渲染的模板里要声明为安全 HTML」的原因。第三行说明**制表符也被转义**成 `&#x9;`（这是它与 `HTMLEscape` 的区别之一，实测）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。下表「返回值」一列是函数原始返回。

| 输入 | 原始返回值 | 是否报错 |
| --- | --- | --- |
| `"<p>abc</p>"` | `&lt;p&gt;abc&lt;/p&gt;` | 否 |
| `"a\tb"`（含制表符） | `a&#x9;b` | 否 |
| 换行、回车 | 被替换为 `&#xA;`、`&#xD;` | 否 |
| `nil` | 空字符串 `""` | 否 |
| 数字 `42` | `42` | 否 |
| 返回类型 | `string`（**不是** `template.HTML`，在 HTML 模板中会被再次转义） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 输出里出现 `&amp;lt;` | 在 HTML 模板里没有加 `safeHTML` | 按上游示例写 `\| transform.XMLEscape \| safeHTML` |
| 没报错但结果不对 | HTML 页面里的空格/换行被转成实体，显示异常 | `XMLEscape` 会转义 `\t`、`\n`、`\r`，HTML 页面一般不需要 | HTML 场景用 [`transform.HTMLEscape`](/functions/transform/htmlescape/) |
| 报错看不懂 | `function "xmlEscape" not defined` | 本函数**没有**别名 | 写全名 `transform.XMLEscape` |
| 没报错但结果不对 | 结果里少了一些字符 | 输入里的控制字符按 XML 规范被**删除**（这是设计行为） | 不要在 XML 文本里放控制字符；必要时先自行编码 |

更多排查入口见[故障排查](/troubleshooting/)。

[HTML 实体]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
[`html/template`]: https://pkg.go.dev/html/template
[不允许的字符]: https://www.w3.org/TR/xml/#charsets
