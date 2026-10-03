+++
title = "param"
linkTitle = "param"
description = "用 param 短代码把站点参数或前置元数据中的参数值写进内容：查找顺序、嵌套取值、参数不存在时的报错与替代写法。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/shortcodes/param/"

[params.teach]
difficulty = "入门"
time = "8 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0）。",
  "知道前置元数据里的自定义参数写在 `[params]` 下，站点配置里的写在项目配置的 `[params]` 下。",
]
outcomes = [
  "把站点参数（全站复用）与页面参数（逐页不同）分别写进正文，并说清哪一个优先；",
  "用点号读取嵌套参数；",
  "判断某个值该用 `param` 短代码还是模板条件判断，避免构建被「参数不存在」直接打挂。",
]
next = ["/shortcodes/details/", "/configuration/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `param` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

同一句话要在很多页里出现，但每页的取值不同——例如「本站基于 Hugo 0.167 构建」这类版本号、产品名、联系电话。把这些值抄进正文，改一次就得全站搜索替换。

`param` 短代码把这类值集中到**前置元数据（front matter）或站点配置**里，正文只引用键名。运行时先看当前页的前置元数据，没有才回退到站点参数，于是「全站默认值 + 个别页面覆盖」用一行调用就能表达。

代价要说清楚：**参数不存在时它会抛错、让构建失败**。这是它和模板里 `with` / `default` 一类写法的关键区别。

`param` 短代码渲染前置元数据（front matter）中的参数，取不到同名参数时回退到站点参数。参数不存在时，短代码会抛出错误。

## 示例

```md {file="content/example.md"}
---
title: Example
date: 2025-01-15T23:29:46-08:00
params:
  color: red
  size: medium
---

We found a {{%/* param "color" */%}} shirt.
```

Hugo 渲染结果为：

```html
<p>We found a red shirt.</p>
```

**你应当看到什么**：产物 `public/example/index.html` 里，调用位置变成 `red` 两个字，句子的其余部分原样保留。如果当前页没有 `color`、站点参数里也没有，构建会直接失败：

```text
ERROR Param "color" not found: "…/content/example.md:8:1"
```

报错里的 `文件:行:列` 指向调用位置，照着补参数或改键名即可。

### 本站实际渲染效果

本站的 `hugo.toml` 里有 `[params] version`、`description`、`tagline` 等键，而这一页的前置元数据里也有 `description`。三个调用放在一起，正好把「先页面、后站点」的查找顺序演示出来：

{{< demo label="站点参数：params.version" >}}
<p>本站版本号：{{< param version >}}</p>
{{< /demo >}}

{{< demo label="同名键：本页的 description 压过站点 params.description" >}}
<p>本页 description：{{< param description >}}</p>
{{< /demo >}}

{{< demo label="本页没有 tagline，于是回退到站点参数" >}}
<p>本站 tagline：{{< param tagline >}}</p>
{{< /demo >}}

三处输出都**没有经过 Markdown 渲染**——`param` 只是把取到的值原样贴进 HTML，这就是下面「实测补充」里「值是 Markdown 时星号不会变粗体」那一行的由来。

## 读取嵌套参数

把标识符（identifier）串起来即可读取嵌套值：

```md
{{%/* param my.nested.param */%}}
```

对应到前置元数据里是：

```toml
[params.my.nested]
param = "value"
```

**实测（Hugo 0.167）**：键名本身带连字符（如 `copyright-year`）时不能用这种点号写法，得用一个不含连字符的父级映射包一层，或者改在模板里用 [`index`](/functions/collections/dictionary/) 函数取值。

## 参数的来源与用法

单个页面上的 `param` 调用优先读取该页前置元数据里的参数，即前置元数据 `params` 映射中的键；页面上没有该参数时，才到站点配置的 `params` 中查找同名参数，因此同一份站点参数可以在所有页面上复用，需要随页面变化的值则写在各页的前置元数据里。

由于参数不存在会直接报错，只有在确定参数一定存在时才适合用 `param` 短代码，否则应改用模板中的条件判断。参数值按原样插入正文，不会经过 Markdown 渲染，因此适合写入纯文本值。

### 实测补充：返回值的边界

| 情况 | 结果 | 能不能构建 |
| --- | --- | --- |
| 页面参数里有这个键 | 输出该值 | 能 |
| 页面参数没有、站点参数有 | 输出站点参数的值 | 能 |
| 页面与站点参数都没有 | **报错** `Param "…" not found` | **不能**，构建失败 |
| 值是空字符串 | 输出空（调用位置什么都不显示） | 能 |
| 值是数字或布尔 | 按字符串写进正文 | 能 |
| 值是 Markdown（如 `**粗体**`） | **原样输出**，星号不会被渲染成粗体 | 能 |
| 值是列表或映射 | 以 Go 的默认格式展开，通常不是你想要的样子 | 能，但结果多半不可用 |

最后两行是实际写作中最容易踩的：`param` 是「取一个标量、原样贴上去」，不要指望它渲染 Markdown，也不要拿它输出结构化数据。

## 什么时候用，什么时候别用

**该用**：

- 全站统一、偶尔需要逐页覆盖的**短文本**（版本号、品牌名、电话号码、客服邮箱）；
- 把「非内容人员也要改的值」集中到配置里，正文只引用键名。

**别用**：

- 值可能不存在 → 构建会失败。这类情况改用[模板](/templates/introduction/)里的 `with` / `default`，或在短代码模板里用 `errorf` 给出更清楚的说明；
- 值是需要渲染的 Markdown → 换成模板里的 `markdownify`；
- 值是列表、映射等结构化数据，要遍历输出 → 用[模板](/templates/introduction/)，`param` 只适合标量；
- 只是想引用同一页内的标题、日期等[标准前置元数据](/content-management/front-matter/)字段 → 模板里有专门的字段与方法，不必绕道自定义参数。

## 验证方法

1. 在站点配置里加一个参数：

   ```toml
   [params]
   product = "ABC Widgets"
   ```

2. 在内容里调用它：

   ```md {file="content/example.md"}
   欢迎使用 {{%/* param "product" */%}}。
   ```

3. 构建并查看产物：

   ```bash
   hugo
   ```

4. 打开 `public/example/index.html`，搜索 `ABC`。

**你应当看到什么**：`<p>欢迎使用 ABC Widgets。</p>`。

- 若在页面前置元数据里也写 `params.product = "XYZ"`，同一页再构建时应当输出 `XYZ`（页面优先）；
- 若两个地方都没有 `product`，构建失败并给出 `Param "product" not found`——这是预期行为，不是 Bug。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | 构建失败：`Param "xxx" not found` | 页面与站点参数里都没有这个键 | 补上参数；或确认自己其实想要「找不到就留空」，那就改用模板里的条件判断 |
| 报错看不懂 | 改了站点参数却没生效 | 页面前置元数据里有同名参数，页面优先 | 删掉页面里的那一行，或改页面里的值 |
| 没报错但结果不对 | 正文里显示 `**粗体**` 而不是粗体 | `param` 按原样插入，不做 Markdown 渲染 | 用模板配合 `markdownify` 输出 |
| 没报错但结果不对 | 带连字符的键名取不到值 | 点号写法不支持连字符键 | 在模板里用 `index .Params "key-with-hyphens"` |
| 没报错但结果不对 | 页面上直接显示了短代码的调用原文 | 把文档里的转义写法抄进了正文 | 删掉 `/*` 与 `*/` |
| 没报错但结果不对 | 输出为空 | 参数存在但值是空字符串 | 检查配置里那一行是不是写成了 `""` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "param" not found` | `layouts/_shortcodes/` 下有同名文件但内容有误 | 删掉自定义文件即恢复内置版本 |

更多排查入口见[故障排查](/troubleshooting/)。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/param.html
