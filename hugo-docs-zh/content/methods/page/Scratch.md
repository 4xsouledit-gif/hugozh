+++
title = "Scratch"
linkTitle = "Scratch"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前页面。"
date = 2026-10-02
weight = 730
source = "https://gohugo.io/methods/page/scratch/"

[params.functions_and_methods]
signatures = ["PAGE.Scratch"]
returnType = "maps.Scratch"
+++

## 这一页解决什么问题

`.Scratch` 返回一个**页面作用域**的键值存储：可以在短代码里存一个值，稍后在同一页的模板里读出来。它解决的是「模板之间传递数据」的问题——例如短代码统计了一堆条目，父模板需要用它做目录。

**注意**：从 v0.138.0 起，`.Scratch` 只是 [`.Store`](/methods/page/store/) 的**别名**，属于**软弃用**。新代码请直接写 `.Store`，两者行为一致（实测同一个 key 在两个对象间可见）。

## 什么时候用，什么时候别用

**该用**：

- 维护旧主题里的现有代码（`.Scratch` 仍可用，不会报错、不会警告）；
- ——新代码请一律用 [`.Store`](/methods/page/store/)，两者的方法完全相同。

**别用**：

- 想跨页面共享数据 → 用 [`hugo.Store`](/functions/hugo/store/)（全局）或 [`SITE.Store`](/methods/site/store/)（站点级）；
- 想在短代码之间共享 → 用 [`SHORTCODE.Store`](/methods/shortcode/store/)；局部一次性用 [`collections.NewScratch`](/functions/collections/newscratch/)；
- 想在模板里做「临时变量」→ 直接用 `{{ $x := ... }}`，不需要 Scratch。

**作用域对照（上游）**：

| 作用域 | 方法或函数 |
| --- | --- |
| page | `PAGE.Store` / `PAGE.Scratch`（别名） |
| site | `SITE.Store` |
| global | `hugo.Store` |
| local | `collections.NewScratch` |
| shortcode | `SHORTCODE.Store` |

## 用法

**（0.138.0 起弃用）**

请改用 [`PAGE.Store`](/methods/page/store/) 方法。

这是一次软弃用。该方法会在将来的某个版本中移除，但移除日期尚未确定。尽管你继续使用该方法时 Hugo 不会发出警告，但你应该尽快开始使用 `PAGE.Store`。

从 v0.138.0 开始，`PAGE.Scratch` 方法已成为 `PAGE.Store` 的别名。

## 完整示例：与 Store 是同一个存储

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ .Scratch.Set "greeting" "Hello" }}
<p>{{ .Scratch.Get "greeting" }}</p>
{{ .Store.Set "other" "World" }}
<p>{{ .Scratch.Get "other" }}</p>
```

实测（Hugo 0.167.0）：

```html
<p>Hello</p>
<p>World</p>
```

**你应当看到什么**：第二行是关键——用 `.Store.Set` 写进去的值，用 `.Scratch.Get` 也能读到，反过来也一样。这证实了「别名」关系（同一个底层数据结构）。构建时**没有**任何弃用警告（实测），所以不必担心升级后突然报错，但也没有理由继续写 `.Scratch`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Scratch.Set` / `.Get` | 与 `.Store` 完全一致（实测互通） | 否 |
| 读取从未设置的 key | `nil`（实测 `.Scratch.Get "missing"` 得到 `<nil>`） | 否 |
| 继续使用 `.Scratch` | 不产生弃用警告（实测），但仍属软弃用 | 否 |
| 跨页面/跨语言 | 不可见（作用域是当前页面）；要跨页面用 `hugo.Store` | 否 |
| 在短代码里设置、父模板读取 | 需要先触发内容渲染（见 [`.Store`](/methods/page/store/) 的「确定值」一节） | 否 |
| 返回类型 | `maps.Scratch` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
