+++
title = "输出配置"
linkTitle = "输出配置"
description = "按页面类型配置站点要渲染的输出格式。"
date = 2026-10-01
weight = 180
source = "https://gohugo.io/configuration/outputs/"
+++

输出格式（output format）是定义 Hugo 如何渲染文件的一组设置，`html`、`json`、`rss` 都是内置的输出格式。创建和配置输出格式的完整说明见[输出格式配置](/configuration/output-formats/)。

本文介绍的 `outputs` 区段决定每种页面类型（page kind）生成哪些输出格式，以及这些格式的先后顺序。

## 键名与默认值

`outputs` 是一个映射：键为页面类型，值为输出格式名称的数组。

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `outputs.home` | `[]string` | `['html','rss']` | 首页生成的输出格式。 |
| `outputs.page` | `[]string` | `['html']` | 常规页面生成的输出格式。 |
| `outputs.rss` | `[]string` | `['rss']` | RSS 页面生成的输出格式。 |
| `outputs.section` | `[]string` | `['html','rss']` | 区块（section）列表页生成的输出格式。 |
| `outputs.taxonomy` | `[]string` | `['html','rss']` | 分类法（taxonomy）列表页生成的输出格式。 |
| `outputs.term` | `[]string` | `['html','rss']` | 分类法术语（term）页生成的输出格式。 |

与上表对应的默认配置如下：

```toml
[outputs]
home = ['html','rss']
page = ['html']
rss = ['rss']
section = ['html','rss']
taxonomy = ['html','rss']
term = ['html','rss']
```

## 为页面类型增加输出格式

假设已经准备好相应模板，要为 `home` 页面类型渲染内置的 `json` 输出格式，可在配置中加入：

```toml
[outputs]
home = ['html','rss','json']
```

这个例子里只写了 `home` 一种页面类型。除非确实要修改其他页面类型的默认输出格式，否则不必为它们写任何条目。

## 输出顺序与主输出格式

> **注意**
> 数组中输出格式的先后顺序很重要。第一个元素就是该页面类型的主输出格式（primary output format），大多数情况下它应当是默认配置中那样位于首位的 `html`。
>
> 主输出格式决定 `Page` 对象的 `Permalink` 与 `RelPermalink` 方法返回的值。对于 `permalinkable` 设为 `true` 的输出格式，例如 `html` 和 `amp`，这两个方法返回的是该格式自身的 URL，与它在数组中的位置无关。
>
> 关于这两点的细节，参见[输出格式配置](/configuration/output-formats/)。

## 为单个页面增加输出格式

在页面 front matter 中用 `outputs` 字段为该页面追加输出格式。例如让某个页面额外渲染 `json`：

```toml
+++
title = 'Example'
outputs = ['json']
+++
```

在默认配置下，Hugo 会为这个页面同时渲染 `html` 和 `json` 两种输出格式。页面 front matter 中的 `outputs` 字段是**追加**到项目配置的输出格式之上，而不是替换项目配置。
