+++
title = "transform.Remarshal"
linkTitle = "Remarshal"
description = "返回按指定格式序列化后的字符串，它由一串序列化数据或一个映射编组而成。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/transform/remarshal/"

[params.functions_and_methods]
signatures = ["transform.Remarshal FORMAT INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

手上有一份序列化数据，格式不对口：配置写的是 TOML，但下游工具要 JSON；`hugo.Data` 里的映射要输出成 YAML 给人看。`transform.Remarshal` 在 `json`、`toml`、`yaml`、`xml` 之间转来转去，输入既可以是**一串文本**，也可以是一个**映射**。

**先看这条限制**：上游明确说明它「主要是 Hugo 文档站自己用的辅助工具」，不是通用转换器，可能随文档站需要而变化。生产站点里依赖它之前，请先确认升级 Hugo 后行为不变。

## 什么时候用，什么时候别用

**该用**：

- 把配置/前置元数据示例在 TOML、YAML、JSON 之间互转（Hugo 文档站自己的做法）；
- 把映射序列化成 YAML/JSON 存进输出文件或传给外部工具；
- 需要 XML 时输出一个 `<root>` 包裹的结构。

**别用**：

- 想**解析**输入并访问字段 → 用 [`transform.Unmarshal`](/functions/transform/unmarshal/)；`Remarshal` 只把一种文本变成另一种文本，取字段还要再解析一次；
- 想序列化出**规范、稳定**的对外数据格式 → 用 [`encoding.Jsonify`](/functions/encoding/jsonify/)（JSON）或 `transform.Remarshal` 之外的专用工具；上游已声明本函数可能变化；
- 格式名写错或输入不合法 → 会直接构建失败（见边界表），别指望它自动猜格式（它不做格式探测）；
- 想把 Markdown 转 HTML → 用 [`transform.Markdownify`](/functions/transform/markdownify/)。

## 用法

格式必须是 `json`、`toml`、`yaml` 或 `xml` 之一。如果输入是一串序列化数据，它必须是合法的 JSON、TOML、YAML 或 XML。

> [!NOTE]
> 该函数主要是 Hugo 文档自身使用的辅助工具，用于把配置与前置元数据示例转换为 JSON、TOML 与 YAML。
>
> 它不是通用转换器；如果 Hugo 文档站有需要，它可能在不另行通知的情况下发生变化。

## 示例

下面的示例把数据从一种序列化格式转换为另一种。

### TOML 转 JSON

该示例把一串 TOML 转换为 JSON：

```go-html-template
{{ $s := `
  baseURL = 'https://example.org/'
  locale = 'en-US'
  title = 'ABC Widgets'
`}}
<pre>{{ transform.Remarshal "json" $s }}</pre>
```

生成的 HTML：

```html
<pre>{
   &#34;baseURL&#34;: &#34;https://example.org/&#34;,
   &#34;locale&#34;: &#34;en-US&#34;,
   &#34;title&#34;: &#34;ABC Widgets&#34;
}
</pre>
```

在浏览器中的渲染结果：

```text
{
   "baseURL": "https://example.org/",
   "locale": "en-US",
   "title": "ABC Widgets"
}
```

### 映射转 YAML

该示例把一个映射转换为 YAML：

```go-html-template
{{ $m := dict
  "a" "Hugo rocks!"
  "b" (dict "question" "What is 6x7?" "answer" 42)
  "c" (slice "foo" "bar")
}}
<pre>{{ transform.Remarshal "yaml" $m }}</pre>
```

生成的 HTML：

```html
<pre>a: Hugo rocks!
b:
  answer: 42
  question: What is 6x7?
c:
- foo
- bar
</pre>
```

在浏览器中的渲染结果：

```text
a: Hugo rocks!
b:
  answer: 42
  question: What is 6x7?
c:
- foo
- bar
```

## 完整示例：映射转 JSON 与 TOML

```go-html-template {file="layouts/_partials/remarshal.html"}
{{ $m := dict "a" 1 }}
<pre>{{ transform.Remarshal "json" $m }}</pre>
<pre>{{ transform.Remarshal "toml" $m }}</pre>
```

Hugo 渲染为（HTML 上下文里引号会被转义成 `&#34;`）：

```html
<pre>{
   &#34;a&#34;: 1
}
</pre>
<pre>a = 1
</pre>
```

**你应当看到什么**：JSON 输出**自带 3 个空格的缩进**和结尾换行（Hugo 的固定风格，不可通过选项调整）；TOML 输出是 `a = 1` 加一个换行。在 HTML 里看到 `&#34;` 是模板自动转义的结果，浏览器会显示成正常的 `"`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。下表「结果」一列是函数原始返回。

| 调用 | 结果 | 是否报错 |
| --- | --- | --- |
| `transform.Remarshal "json" "a = 1"`（TOML 字符串 → JSON） | `{\n   "a": 1\n}\n` | 否 |
| `transform.Remarshal "json" (dict "a" 1)`（映射 → JSON） | `{\n   "a": 1\n}\n` | 否 |
| `transform.Remarshal "yaml" (dict "a" 1)` | `a: 1\n` | 否 |
| `transform.Remarshal "toml" (dict "a" 1)` | `a = 1\n` | 否 |
| `transform.Remarshal "xml" (dict "a" 1)` | `<root>\n\t<a>1</a>\n</root>`（自动包裹 `<root>`） | 否 |
| `transform.Remarshal "json" nil` | `""`（空字符串，上游未说明） | 否 |
| `transform.Remarshal "bogus" "a = 1"`（格式名非法） | —— | 是：`error calling Remarshal: failed to detect target data serialization format` |
| 输入是不合法的目标格式文本 | —— | 是（由底层解析器报错，信息指向具体行列） |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `failed to detect target data serialization format` | 第一个参数不是 `json`、`toml`、`yaml`、`xml` 之一 | 检查格式名拼写（区分大小写，实测小写可用） |
| 没报错但结果不对 | 输出在浏览器里显示成 `&#34;` | 回到了 HTML 上下文，模板自动转义 | 放进 `<pre>` 或用纯文本输出格式；确需原样 HTML 则 `\| safeHTML` |
| 没报错但结果不对 | 输出格式的缩进与自己期望的不一致 | 缩进由 Hugo 固定（JSON 为 3 空格），本函数没有缩进选项 | 需要自定义缩进就用 [`encoding.Jsonify`](/functions/encoding/jsonify/) 的 `indent` 选项 |
| 没报错但结果不对 | 升级 Hugo 后输出变了 | 上游声明该函数主要服务于文档站，可能不经通知而变化 | 关键流程改用 `jsonify` / `Unmarshal` 等更稳定的函数 |

更多排查入口见[故障排查](/troubleshooting/)。

