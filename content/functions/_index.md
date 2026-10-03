+++
title = "函数"
linkTitle = "函数"
description = "在模板与原型中使用的全部函数与方法。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/"

[params.teach]
difficulty = "参考"
time = "按需查阅；通读约 30 分钟"
prereq = [
  "知道 Go 模板的基本语法（`{{ }}`、变量、`if` / `range` / `with`），否则先读[模板简介](/templates/introduction/)。",
  "手边有一个能构建的站点，遇到函数时可以立刻放进模板里试一次。",
]
outcomes = [
  "按包（`strings`、`collections`、`transform`、`urls` 等）找到需要的函数，而不是靠翻页；",
  "分清**函数**与[方法](/methods/)：什么时候写 `strings.Truncate`，什么时候写 `$page.Title`；",
  "看懂管道写法 `{{ $x | f a }}` 与嵌套写法 `{{ f a $x }}` 为什么等价；",
  "判断一个函数拿到空值、`nil` 或不符类型时会返回什么，而不是假设它一定会报错。",
]
next = ["/methods/", "/templates/introduction/", "/quick-reference/"]
+++

## 本章导读

模板的能力来自函数（function）与方法（method）。本目录按包（package）分组收录 Hugo 内建的全部函数，例如 `collections`、`strings`、`transform`、`urls`；函数名与参数、返回值都保持英文原样，不译。

这个目录有 300 多页，**不要从头读**。正确用法是：先知道自己要做什么，再按下面的方法定位。

## 怎么找函数

| 你要做的事 | 去哪 |
| --- | --- |
| 处理字符串（截断、替换、大小写、前后缀） | `strings` |
| 筛选、排序、分组页面或切片 | `collections`、`methods/pages` |
| 处理时间与日期 | `time`、`methods/time` |
| 处理图片（缩放、裁剪、滤镜） | `images`、`methods/resource` |
| 生成 URL、比较路径 | `urls`、`path` |
| 编译样式与脚本 | `css`、`js` |
| 读配置、拿站点级数据 | `hugo`、`site`、`os` |
| 不确定名字，只记得大概 | 用[函数速查](/quick-reference/functions/)按命名空间列出的全表反查 |

## 怎么读函数签名

每页顶部有一行签名，形如：

```text
strings.Truncate SIZE [ELLIPSIS] STRING
```

读法是：**大写的是参数名**（按位置传入），**方括号表示可选**，**空格分隔参数顺序**，签名下方另标返回类型。

于是 `strings.Truncate 10 "…" $s` 表示：第 1 个参数 `SIZE` 是 `10`，可选参数 `ELLIPSIS` 是 `"…"`，最后一个参数是待处理的内容。

## 调用写法：嵌套还是管道

同一个函数有两种等价写法：

```go-html-template
{{ sub 3 2 }}        {{/* 嵌套：函数名在前，参数依次跟上 */}}
{{ 3 | sub 2 }}      {{/* 管道：左侧结果作为最后一个参数传入 */}}
```

管道在「一串处理接连做」时更好读，因为它按数据流动的方向从左到右写：

```go-html-template
{{ $s := "前前后后" | strings.TrimPrefix "前" | strings.TrimSuffix "后" }}
```

**注意管道的传参位置**：`a | f b` 等价于 `f b a`——被管道传入的值永远是**最后一个**参数。不知道参数顺序时先看签名，不要猜。

## 函数与方法怎么选

- 需要**处理一份数据**（字符串、切片、图片）→ 用函数，写法是 `strings.Truncate …`；
- 需要**从对象上取信息**（页面标题、资源尺寸、站点参数）→ 用方法，写法是 `$page.Title`。

两者常有同名者（例如 `strings.Truncate` 与页面标题的截断需求），方法收录在[方法](/methods/)一章。

## 本站被引用最多的函数

站内页面互链次数排名（越靠前说明越多页面在依赖它，通常也是你最常需要的）：

| 函数 | 用途 |
| --- | --- |
| [`css.Sass`](/functions/css/sass/) | 把 SCSS / Sass 编译成 CSS |
| [`images.Filter`](/functions/images/filter/) | 给图片套滤镜链 |
| [`time.Format`](/functions/time/format/) | 格式化时间（注意与 `.Format` 方法的差异） |
| [`resources.GetRemote`](/functions/resources/getremote/) | 抓取远程资源 |
| [`css.TailwindCSS`](/functions/css/tailwindcss/) | 用 Tailwind CLI 生成样式 |
| [`collections.Where`](/functions/collections/where/) | 按条件筛选页面集合 |
| [`strings.Truncate`](/functions/strings/truncate/) | 按单词边界截断文本 |
| [`transform.Markdownify`](/functions/transform/markdownify/) | 把 Markdown 片段渲染成 HTML |
| [`partials.IncludeCached`](/functions/partials/includecached/) | 缓存局部模板的渲染结果 |
| [`reflect.IsImageResourceProcessable`](/functions/reflect/isimageresourceprocessable/) | 判断资源能否做图像处理 |

同名函数与方法的差别、以及命名空间（如 `hugo.`、`site.`、`strings.`）的含义，见[方法](/methods/)一章与各页说明。
