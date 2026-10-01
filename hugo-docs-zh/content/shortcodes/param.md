+++
title = "param"
linkTitle = "param"
description = "用 param 短代码把站点参数或前置元数据中的参数值写进内容。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/shortcodes/param/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `param` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`param` 短代码渲染前置元数据（front matter）中的参数，取不到同名参数时回退到站点参数。参数不存在时，短代码会抛出错误。

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

## 读取嵌套参数

把标识符（identifier）串起来即可读取嵌套值：

```md
{{%/* param my.nested.param */%}}
```

## 参数的来源与用法

单个页面上的 `param` 调用优先读取该页前置元数据里的参数，即前置元数据 `params` 映射中的键；页面上没有该参数时，才到站点配置的 `params` 中查找同名参数，因此同一份站点参数可以在所有页面上复用，需要随页面变化的值则写在各页的前置元数据里。

由于参数不存在会直接报错，只有在确定参数一定存在时才适合用 `param` 短代码，否则应改用模板中的条件判断。参数值按原样插入正文，不会经过 Markdown 渲染，因此适合写入纯文本值。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/param.html
