+++
title = "输出配置"
linkTitle = "输出配置"
description = "按页面类型配置站点要渲染的输出格式。"
date = 2026-10-01
weight = 180
source = "https://gohugo.io/configuration/outputs/"
+++

## 这一页解决什么问题

`outputs` 决定**每种页面类型生成哪些输出格式、按什么顺序**：首页要不要多给一个 RSS 或 JSON，普通页面要不要额外输出 Markdown。改这里的典型症状不是报错，而是「某一类页面的某种输出突然不见了」——因为数组是**整体替换**的，漏写一项就等于关掉它。

这个页面只回答「谁生成什么」。每种格式长什么样（媒体类型、后缀、模板命名）见[输出格式配置](/configuration/output-formats/)。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `outputs.home` / `section` / `taxonomy` / `term` | 想给列表类页面额外输出 JSON、AMP、Markdown 等 | 数组里漏掉 `'html'` 或 `'rss'` → 该类页面的 HTML 或 feed **直接不再生成**，且不报错 |
| `outputs.page` | 让每篇内容额外产出 `md`、`json` 等 | 数组中格式顺序变化 → 主输出格式随之改变，`.Permalink` / `.RelPermalink` 指向的地址可能不再是你以为的那个 |
| 页面 front matter 的 `outputs` | 只为某一页追加输出格式 | 它是**追加**语义，无法用 front matter 关掉站点级已开启的格式 |

数组顺序的后果：第一个元素是该页面类型的**主输出格式**，它决定 `Page` 的 `Permalink` 与 `RelPermalink`；`permalinkable = true` 的格式（如 `html`、`amp`）例外，这两个方法返回该格式自身的 URL。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 加了 `json` 之后首页的 RSS 不见了 | 数组是**替换**而不是追加，重写时漏掉了 `'rss'` | 把默认项写全：`home = ['html','rss','json']` |
| 站点根路径的 `.Permalink` 变了 | 主输出格式被改动（数组首位不再是 `html`） | 保持 `'html'` 在首位；确需调整时见[输出格式配置](/configuration/output-formats/) |
| 某一页多出了不想要的格式 | front matter 的 `outputs` 是追加语义，无法用它关掉已开启的格式 | 删掉该页 front matter 中的 `outputs`，或从站点级配置里移除 |
| 构建报「找不到模板」一类错误 | 只改了 `outputs`，却没有为新增格式准备模板 | 按[输出格式配置](/configuration/output-formats/)中的模板查找顺序补齐模板 |

更多排查入口见[故障排查](/troubleshooting/)。
