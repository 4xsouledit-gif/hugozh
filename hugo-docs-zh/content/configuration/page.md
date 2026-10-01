+++
title = "页面配置"
linkTitle = "页面配置"
description = "配置 Page 对象上「下一篇」「上一篇」的排序方向。"
date = 2026-10-01
weight = 190
source = "https://gohugo.io/configuration/page/"
+++

Hugo 使用默认排序顺序（default sort order）来确定：在 `Page` 对象上调用下列方法时，相对于当前页面的「下一篇」和「上一篇」分别是哪一页。

- `Next` 与 `Prev`
- `NextInSection` 与 `PrevInSection`

`page` 区段就是用来配置这里的排序方向的。默认配置如下：

```toml
[page]
nextPrevInSectionSortOrder = 'desc'
nextPrevSortOrder = 'desc'
```

## 键名与默认值

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `nextPrevInSectionSortOrder` | `string` | `desc` | 在 `Page` 对象上调用 `NextInSection` 或 `PrevInSection` 时，用于确定同一区块内「下一篇」与「上一篇」的排序顺序。可选值为 `asc`（升序）或 `desc`（降序）。 |
| `nextPrevSortOrder` | `string` | `desc` | 在 `Page` 对象上调用 `Next` 或 `Prev` 时，用于确定「下一篇」与「上一篇」的排序顺序。可选值为 `asc`（升序）或 `desc`（降序）。 |

两个键都是 `string` 类型，且只接受 `asc` 和 `desc` 两个取值，默认都是 `desc`（降序）。

## 排序依据

这里的排序顺序建立在「默认排序顺序」之上。当没有另行指定排序条件时，Hugo 对页面集合使用如下优先级：

1. `weight`（升序）
2. `date`（降序）
3. `linkTitle`，缺失时回退到 `title`（升序）
4. 逻辑路径（升序）

`asc` 与 `desc` 就作用在这套顺序上。因此 `Next` 返回的是按该顺序排定的相邻页面，`Prev` 返回的是反方向的相邻页面。

## 反转「下一篇」与「上一篇」

要反转 `Next`、`Prev` 以及区块内相邻页面的指向方向，把两个键都设为 `asc`：

```toml
[page]
  nextPrevInSectionSortOrder = 'asc'
  nextPrevSortOrder = 'asc'
```

如果只想改变区块内的相邻页面（即 `NextInSection` 与 `PrevInSection`）的方向，可以只调整 `nextPrevInSectionSortOrder`，让 `nextPrevSortOrder` 保持默认。

> **注意**
> 这些设置不适用于 `Pages` 对象上的 `Next` 或 `Prev` 方法。

## 注意事项

- 该配置只影响上述四个方法返回的相邻页面，不会改变 `.Pages` 等页面集合自身的排列顺序；页面集合的顺序由排序方法或内容中的 `weight`、`date` 等字段决定。
- `page` 是站点配置区段，写在站点配置文件（如 `hugo.toml`）中，而不是页面的 front matter 里。
- 两个键的取值必须是小写的 `asc` 或 `desc`。
