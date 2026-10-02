+++
title = "前置元数据配置"
linkTitle = "前置元数据配置"
description = "配置日期回退顺序、字段别名与可用记号。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/configuration/front-matter/"
+++

## 这一页解决什么问题

`[frontmatter]` 配置的是「Hugo 按什么顺序去前置元数据里找日期字段」：同一个 `Lastmod`，可以依次尝试 Git 提交时间、`lastmod`、`modified`、`date`……这一页就是给四个日期方法排优先级。

**为什么会需要它**：默认顺序里 `lastmod` 的第一个来源是 `:git`，所以开启 `enableGitInfo` 后，页面的「最后更新」来自提交历史，而不是一个会过期的手写字段。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `lastmod` | 想让「最后更新」来自 Git（`':git'`）或文件时间（`:fileModTime`） | 列表里的字段名写错会被**静默跳过**（继续往后找）；把候选全部删掉 → 页面 `Lastmod` 落到零值 `0001-01-01` |
| `date` / `publishDate` | 用自定义字段名承载日期（如 `myDate`） | 拼写不一致的字段不会被识别；把 `:filename` 提到前面会连带改变 slug 的推导行为 |
| `expiryDate` | 需要「到期自动下线」的语义 | 字段名写错 → 过期页面照常发布 |
| `:filename` | 文件名以日期开头（`2025-02-01-article.md`），希望日期与 slug 都从文件名推导 | 只有它最终生效时才推导 slug；更靠前的字段命中时，slug 不会由文件名生成 |
| `:default` | 想追加自定义字段、同时保留默认回退链 | 漏写 `:default` 会**替换**默认序列，回退链变短 |

**实测（Hugo 0.167，本站）**：本站 `hugo.toml` 把日期链改写为

```toml
[frontmatter]
  lastmod = [':git', 'lastmod', 'date']
  date = ['date', ':git']
```

也就是在默认链之前优先取 Git 信息（本站 `enableGitInfo = true`）；`hugo config` 的 `[frontmatter]` 段可以看到这两行。

## 日期

`Page` 对象上有四个返回日期的方法：

方法|说明
:--|:--
`Date`|返回给定页面的日期。
`ExpiryDate`|返回给定页面的过期日期。
`Lastmod`|返回给定页面的最后修改日期。
`PublishDate`|返回给定页面的发布日期。

Hugo 依据下面这份默认配置决定各方法返回什么值：

```toml
[frontmatter]
date = ['date', 'publishdate', 'pubdate', 'published', 'lastmod', 'modified']
expiryDate = ['expirydate', 'unpublishdate']
lastmod = [':git', 'lastmod', 'modified', 'date', 'publishdate', 'pubdate', 'published']
publishDate = ['publishdate', 'pubdate', 'published', 'date']
```

以 `ExpiryDate` 方法为例：如果存在 `expirydate` 就用它，否则返回 `unpublishdate`。

键名|类型|说明
:--|:--|:--
`date`|`[]string`|`Date` 方法按序查找的日期字段列表。
`expiryDate`|`[]string`|`ExpiryDate` 方法按序查找的日期字段列表。
`lastmod`|`[]string`|`Lastmod` 方法按序查找的日期字段列表。
`publishDate`|`[]string`|`PublishDate` 方法按序查找的日期字段列表。

也可以使用自定义的日期参数：

```toml
[frontmatter]
date = ["myDate", "date"]
```

上例中，`Date` 方法在存在 `myDate` 时返回它，否则返回 `date`。

要让序列在末尾回退到默认的日期顺序，使用 `:default` 记号：

```toml
[frontmatter]
date = ["myDate", ":default"]
```

上例中，`Date` 方法在存在 `myDate` 时返回它，否则从 `date`、`publishdate`、`pubdate`、`published`、`lastmod`、`modified` 中返回第一个有效日期。

## 别名

部分前置元数据字段有别名：

前置元数据字段|别名
:--|:--
`expiryDate`|`unpublishdate`
`lastmod`|`modified`
`publishDate`|`pubdate`、`published`

默认的前置元数据配置已包含这些别名。

## 记号

Hugo 提供以下记号，用于配置前置元数据。

`:default`
: 默认的、有固定顺序的日期字段序列。

`:fileModTime`
: 文件的最后修改时间戳。

`:filename`
: 从文件名中提取日期，前提是文件名以符合下列格式之一的日期开头：

  - `YYYY-MM-DD`
  - `YYYY-MM-DD-HH-MM-SS`（自 v0.148.0 起）

  在 `YYYY-MM-DD-HH-MM-SS` 格式中，日期与时间之间可以用任意字符分隔，包括空格（例如 `2025-02-01T14-30-00`）。

  Hugo 会把提取出的日期按项目配置中的 `timeZone` 解析，未配置时回退到系统时区。Hugo 还会用文件名剩余的部分推导页面的 `slug`，但页面已在前置元数据中定义 `slug` 时除外。

  只有当 `:filename` 成为最终生效的日期来源时，才会推导 slug。如果列表中更靠前的条目提供了有效日期，Hugo 会完全跳过 `:filename`。例如配置为 `date = ["date", ":filename"]` 时，在前置元数据里定义了 `date` 的页面将使用该值，slug 也不会由文件名推导。

  例如，把文件命名为 `2025-02-01-article.md`，Hugo 会把日期设为 `2025-02-01`，把 slug 设为 `article`。

`:git`
: 文件最后一次修订的 Git 作者日期。要使用该值，需将 `enableGitInfo` 设为 `true`。

## 示例

假设项目配置如下：

```toml
[frontmatter]
date = [':filename', ':default']
publishDate = [':filename', ':default']
lastmod = ['lastmod', ':fileModTime']
```

确定 `date` 与 `publishDate` 时，Hugo 先尝试从文件名中提取值，失败则回退到默认的日期字段序列。

确定 `lastmod` 时，Hugo 先查找前置元数据中的 `lastmod` 字段，失败则回退到文件的最后修改时间戳。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 页面上「最后更新」显示为 `0001-01-01` | 日期回退链全部落空（字段不存在、`enableGitInfo` 未开启、文件时间也不可用） | 补一个 `lastmod` / `date` 字段，或开启 `enableGitInfo`；模板侧应先用 `.Date.IsZero` 判空 |
| 开了 `enableGitInfo`，`:git` 仍不起作用 | 站点不是 Git 仓库，或该文件从未被提交（未跟踪文件没有 Git 日期） | 用 `git log -- <文件>` 确认有提交记录，再重新构建 |
| 自定义日期字段没被识别 | 字段名拼写或大小写与配置不一致 | 逐字核对 `[frontmatter]` 中对应列表里的名字 |
| 改了 `[frontmatter]`，模板输出乱了 | 取值落到了零值或另一字段，而模板直接格式化 | 先判零值再格式化；参见 [`Date`](/methods/page/date/) 一类方法页 |
| 报错看不懂 | 该分区基本不报错，问题通常表现为「日期不对」 | 见[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
