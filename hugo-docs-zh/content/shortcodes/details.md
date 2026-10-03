+++
title = "details"
linkTitle = "details"
description = "用 details 短代码在正文中插入 HTML details 折叠元素：参数表、可复制的调用、实测输出、样式与常见坑。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/shortcodes/details/"

[params.teach]
difficulty = "入门"
time = "8 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0），Hugo 版本为 0.140.0 或更高。",
  "知道正文里可以用 Markdown 写标题、粗体与列表。",
]
outcomes = [
  "写出一个默认折叠、点开才展开的 `details` 块，并知道摘要文字写在哪里；",
  "用 `open` / `class` / `name` 控制初始状态与样式，并说清 `name` 带来的互斥行为；",
  "在 `public/` 里核对 `<details>` / `<summary>` 结构与内容是否被渲染成 HTML。",
]
next = ["/shortcodes/qr/", "/content-management/markdown-attributes/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `details` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

正文里总有一些**次要但需要保留**的内容：完整参数清单、冗长的背景说明、常见问题、示例的展开版。全都铺在页面上会淹没主线，删掉又可惜。

`details` 短代码把这段内容包进 HTML 的 `details` 元素：默认只显示一行摘要，读者点击后才展开，**不需要 JavaScript**，浏览器原生支持。自 Hugo 0.140.0 起可用。

`details` 短代码把一段内容包进 HTML 的 `details` 元素，折叠与展开由浏览器原生实现，不需要 JavaScript。自 Hugo 0.140.0 起可用。适合放置补充说明、较长的清单或常见问题等次要内容：默认只显示一行摘要，读者点击后才展开正文。

## 示例

正文里这样写：

```md {file="content/example.md"}
{{</* details summary="查看细节" */>}}
这是一个 **粗体** 词。
{{</* /details */>}}
```

Hugo 渲染出这样的 HTML：

```html
<details>
  <summary>查看细节</summary>
  <p>这是一个 <strong>粗体</strong> 词。</p>
</details>
```

`summary` 参数的值会先由 Markdown 渲染为 HTML，再放进子 `summary` 元素，因此摘要里同样可以使用 Markdown 标记。开闭标记之间的内容按普通 Markdown 渲染。

**你应当看到什么**：产物 `public/example/index.html` 里出现一个 `<details>` 元素，第一个子元素是 `<summary>查看细节</summary>`，后面的 `<p>` 里 `**粗体**` 已经变成 `<strong>粗体</strong>`。页面上则是一行「查看细节」，点击后才显示正文。

把 `open` 设为 `true`，可以让这段内容在页面载入时就处于展开状态：

```md
{{</* details summary="查看细节" open=true */>}}
这是一个 **粗体** 词。
{{</* /details */>}}
```

### 本站实际渲染效果

上面两段写法本站都真的用了一次：下面第一个默认折叠，点一下摘要才展开；第二个给了 `open=true`，载入时就是展开的。**这两个框不是截图，是页面上的真元素。**

{{< demo label="默认折叠：点摘要才展开" >}}
{{< details summary="查看细节" >}}
这是一个 **粗体** 词。
{{< /details >}}
{{< /demo >}}

{{< demo label="open=true：载入即展开" >}}
{{< details summary="查看细节（载入即展开的）" open=true >}}
这是一个 **粗体** 词。
{{< /details >}}
{{< /demo >}}

`name` 是原生 HTML 的手风琴分组属性：下面两项用的是同一个 `name`，展开其中一项，另一项会自动收起——写「常见问题」清单就用它：

{{< demo label="name 相同 → 互斥展开" >}}
{{< details summary="第一项" name="shortcodes-details-demo" >}}第一项的内容。{{< /details >}}
{{< details summary="第二项" name="shortcodes-details-demo" >}}第二项的内容。{{< /details >}}
{{< /demo >}}

### 实测：参数写错会怎样

| 调用 | 结果 |
| --- | --- |
| `{{</* details */>}}` | 摘要显示默认文字 `Details` |
| `{{</* details summary="标题" */>}}` | 摘要显示 `标题` |
| `{{</* details "标题" */>}}` | **位置参数被忽略**，摘要仍显示 `Details`，也不报错 |
| `summary="**加粗**"` | 摘要里的 Markdown 会被渲染成 `<strong>加粗</strong>` |
| `open=true` | `<details open>`，页面载入即展开 |
| `class="x" name="grp" title="t"` | 三个属性原样写到 `<details>` 上 |

「位置参数被忽略」这一条上游文档没有写：`details` 的 `summary` **只认命名参数**，写错了不会有任何提示。

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `summary` | `string` | 子 `summary` 元素的内容，由 Markdown 渲染为 HTML。默认值为 `Details`。 |
| `open` | `bool` | 是否在初始状态下展开 `details` 元素的内容。默认值为 `false`。 |
| `class` | `string` | `details` 元素的 `class` 属性。 |
| `name` | `string` | `details` 元素的 `name` 属性。 |
| `title` | `string` | `details` 元素的 `title` 属性。 |

`name` 是原生 HTML 的「手风琴」分组属性：**同一页上多个 `details` 使用相同的 `name` 时，展开其中一个会自动收起同组的其他项**。要做「常见问题」这类互斥列表，就用它。

## 样式

`details` 元素、`summary` 元素以及内容本身都可以用 CSS 定制：

```css
/* 选中 details 元素 */
details { }

/* 选中 summary 元素 */
details > summary { }

/* 选中 summary 元素的子元素 */
details > summary > * { }

/* 选中内容 */
details > :not(summary) { }
```

折叠标记由浏览器自行绘制，各浏览器的默认外观并不一致，若全站需要统一效果，应显式设置 `summary` 的样式。

一个最小的样式例子（放进站点的 CSS 文件即可）：

```css
details > summary {
  cursor: pointer;
  font-weight: 600;
}
details[open] > summary {
  margin-bottom: 0.5rem;
}
```

## 什么时候用，什么时候别用

**该用**：

- 常见问题、补充说明、长清单——「默认不看，需要时再看」的内容；
- 想在零 JavaScript 的前提下做折叠。

**别用**：

- 正文的**主线条内容** → 折叠会让读者错过关键步骤，尤其是教程与安装说明；
- 需要**打印**的内容 → 折叠部分在纸面上默认不显示；
- 需要控制折叠动画或复杂交互 → 原生实现只有开与关两个状态，复杂需求要用 JavaScript，那就不该指望这个短代码；
- 想要的是提示框（警示、注意）→ 用 Markdown 的 `> [!NOTE]` 一类 callout，本站主题会渲染成带中文标签的提示块。

## 验证方法

1. 在内容里写一次调用：

   ```md {file="content/example.md"}
   {{</* details summary="发布前检查清单" open=false */>}}
   - 改过 `baseURL`
   - 跑过 `hugo --ignoreCache`
   {{</* /details */>}}
   ```

2. 构建并查看产物：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `发布前检查清单`。

**你应当看到什么**：

```html
<details>
  <summary>发布前检查清单</summary>
  <ul>
    <li>改过 <code>baseURL</code></li>
    <li>跑过 <code>hugo --ignoreCache</code></li>
  </ul>
</details>
```

列表被渲染成 `<ul>`、行内代码变成 `<code>`，说明内部内容确实经过了 Markdown 渲染。

- 摘要仍显示 `Details` → 你写成了位置参数；
- 正文里还能看到这段短代码的调用原文 → 定界符被转义了，或这段内容没被渲染；
- 页面载入就是展开的 → 检查是否有 `open=true`。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 摘要不是自己写的文字，而是 `Details` | 用了位置参数，`details` 只认命名参数 | 写成 `summary="…"` |
| 没报错但结果不对 | 内容里的 Markdown 原样显示 | 定界符写成了转义的 `{{</* … */>}}`，或整段没被当作 Markdown | 删掉 `/*` 与 `*/` |
| 没报错但结果不对 | 想互斥折叠，但点开一个其他的不收起 | 没有给同组的项写同一个 `name` | 给同组 `details` 加相同的 `name="…"` |
| 没报错但结果不对 | 折叠块在打印稿里消失 | 这是原生行为：折叠内容默认不打印 | 需要打印的内容不要放进折叠块 |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "details" not found` | Hugo 版本低于 0.140.0（该短代码尚不存在），或自定义模板有误 | 升级 Hugo；`hugo version` 确认版本 |
| 报错看不懂 | 报错指向别的页面 | 短代码占位符相关错误常被归因到其它页面 | 用 `hugo --ignoreCache` 复现，并参考[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/details.html
