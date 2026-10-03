+++
title = "Draft"
linkTitle = "Draft"
description = "报告给定页面在前置元数据中是否被标记为草稿。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/page/draft/"

[params.functions_and_methods]
signatures = ["PAGE.Draft"]
returnType = "bool"
+++

## 这一页解决什么问题

`Draft` 报告当前页面是不是草稿（前置元数据 `draft = true`），主要供**模板**使用：给草稿页加「未发布」标记、把草稿排除出站点地图或 RSS、在预览环境里区分输出。

## 什么时候用，什么时候别用

**该用**：

- 模板里给草稿页加标记，或从列表 / 站点地图里排除；
- 同一套模板在 `--buildDrafts` 打开与关闭时给出不同输出。

**别用**：

- 想**控制是否发布**草稿 → 那是 `hugo` 命令的行为（默认不发布，`--buildDrafts` / `-D` 才发布）；`.Draft` 只报告状态；
- 想表达「计划将来发布」→ 用将来日期的 `date`（配合 `--buildFuture`）；
- 想表达「已经过期」→ 用 `expiryDate`（配合 `--buildExpired`）。

## 用法

默认情况下，构建项目时 Hugo 不会发布草稿页面。要在构建项目时包含草稿页面，请使用 `--buildDrafts` 命令行标志。

```toml
title = 'Post 1'
draft = true
```

```go-html-template
{{ .Draft }} → true
```

## 完整示例：草稿页显示横幅

最小站点：`content/posts/draft-one.md` 的前置元数据写 `draft = true`；`content/docs/guide/beta.md` 没有写。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<p>draft={{ .Draft }}</p>
{{ if .Draft }}
  <p class="banner">这是草稿，尚未发布。</p>
{{ end }}
```

默认构建（`hugo --source <站点目录> --ignoreCache`）**不会**输出草稿页，所以要看到输出必须加上 `--buildDrafts`：

```sh
hugo --source <站点目录> --ignoreCache --buildDrafts
```

草稿页输出：

```html
<p>draft=true</p>
<p class="banner">这是草稿，尚未发布。</p>
```

普通页面（`beta.md`）输出：

```html
<p>draft=false</p>
```

**你应当看到什么**：默认构建后 `public/posts/draft-one/index.html` **不存在**（实测）；加上 `--buildDrafts` 后才生成，此时 `.Draft` 为 `true`。也就是说 `.Draft` 是给「已经渲染出来的页面」看的，不能用来判断「为什么这个页面没出现」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`draft-one.md` 为 `draft = true`，`beta.md` 未设置。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据没有 `draft` | `false` | 否 |
| `draft = true`，默认构建 | 页面根本不生成（`.Draft` 无从取值） | 否 |
| `draft = true`，加 `--buildDrafts` | 页面生成，`.Draft` 为 `true` | 否 |
| 返回类型 | `bool`（可直接进 `if`），不需要 `eq` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 页面不见了 | 本地看不到草稿页 | 默认构建不发布草稿 | 加 `--buildDrafts`；`hugo server -D` 同理 |
| 草稿出现在线上 | 生产构建里带了 `-D` | 构建命令把草稿打开了 | 生产环境不要加 `--buildDrafts` |
| 没报错但结果不对 | 给草稿加了 `date` 却仍然不发布 | `draft` 与 `date` 是两套机制 | 要么去掉 `draft`，要么构建时加 `-D` |

更多排查入口见[故障排查](/troubleshooting/)。

