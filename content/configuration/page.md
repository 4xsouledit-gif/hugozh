+++
title = "页面配置"
linkTitle = "页面配置"
description = "配置 Page 对象上「下一篇」「上一篇」的排序方向。"
date = 2026-10-01
weight = 190
source = "https://gohugo.io/configuration/page/"
+++

## 这一页解决什么问题

`Next` / `Prev`（以及区块内的 `NextInSection` / `PrevInSection`）返回的「下一篇 / 上一篇」是往哪个方向排的，由这一页的两个键决定。默认都是 `desc`（降序），所以很多人第一次用会发现「下一篇」指向的其实是更早的文章——想把方向反过来，答案就在这里。

**只想改一件事**：让前后翻页符合阅读顺序 → 把两个键都设为 `asc`（见下文「反转『下一篇』与『上一篇』」）。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `nextPrevSortOrder` | 希望全站相邻页面（跨 section）的方向符合阅读顺序 | 只改这一个键 → 全站翻页方向与区块内翻页方向相反，读者点起来像「跳来跳去」 |
| `nextPrevInSectionSortOrder` | 只想调整同一 section 内前后翻页的方向 | 取值写成 `asc` / `desc` 之外的字符串：**实测（Hugo 0.167）** Hugo 不校验、不报错，该值会被原样保留到生效配置里（用 `hugo config` 可见 `nextprevsortorder = 'bogus'`），排序行为也就不再是文档描述的那两种；照文档写即可 |

大小写方面，**实测（Hugo 0.167）**：通过环境变量 `HUGO_PAGE_NEXTPREVSORTORDER=ASC` 设置时，最终生效值为 `asc`，大小写会被规范化。稳妥起见仍按文档写小写。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 设置了 `[page]` 但翻页方向没变 | 写进了页面的前置元数据，而不是站点配置 | `page` 是**站点**配置分区，必须写在 `hugo.toml` 或 `config/` 下；见[配置简介](/configuration/introduction/) |
| 翻页方向和预期正好相反 | `Next` 与 `Prev` 本身是一对反向的方法；`asc` / `desc` 只决定「按什么顺序取相邻页」 | 先用只有三篇文章的最小集合验证方向，再全站套用 |
| 想确认最终取值，却找不到配置行 | `hugo config` 输出的键名是小写的（`nextprevsortorder`） | 按小写搜索，或忽略大小写搜索 |
| 改了配置没有任何反馈 | 这两个键不做取值校验，写错也**不会报错** | 用 `hugo config` 核对实际取值；排序仍不对就到[故障排查](/troubleshooting/)按现象查 |

更多排查入口见[故障排查](/troubleshooting/)。
