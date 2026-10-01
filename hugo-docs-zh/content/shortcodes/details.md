+++
title = "details"
linkTitle = "details"
description = "用 details 短代码在正文中插入 HTML details 折叠元素。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/shortcodes/details/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `details` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`details` 短代码把一段内容包进 HTML 的 `details` 元素，折叠与展开由浏览器原生实现，不需要 JavaScript。自 Hugo 0.140.0 起可用。适合放置补充说明、较长的清单或常见问题等次要内容：默认只显示一行摘要，读者点击后才展开正文。

## 示例

正文里这样写：

```md
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

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `summary` | `string` | 子 `summary` 元素的内容，由 Markdown 渲染为 HTML。默认值为 `Details`。 |
| `open` | `bool` | 是否在初始状态下展开 `details` 元素的内容。默认值为 `false`。 |
| `class` | `string` | `details` 元素的 `class` 属性。 |
| `name` | `string` | `details` 元素的 `name` 属性。 |
| `title` | `string` | `details` 元素的 `title` 属性。 |

把 `open` 设为 `true`，可以让这段内容在页面载入时就处于展开状态：

```md
{{</* details summary="查看细节" open=true */>}}
这是一个 **粗体** 词。
{{</* /details */>}}
```

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

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/details.html
