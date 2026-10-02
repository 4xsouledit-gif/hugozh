+++
title = "Role"
linkTitle = "Role"
description = "返回给定站点的 Role 对象。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/site/role/"

[params.functions_and_methods]
signatures = ["SITE.Role"]
returnType = "roles.Role"
+++

## 这一页解决什么问题

**（0.153.0 新增）**

「角色（role）」是 Hugo 0.153 引入的第三个站点[维度](g)（另两个是语言与版本）。它的用途是**按受众把同一份内容构建成多套站点**：例如 `guest`（访客版）与 `member`（会员版），各自由 `[roles.<name>]` 定义。

`Role` 返回**当前站点**的角色对象。你能从中拿到的是角色名（`Name`）与它是不是默认角色（`IsDefault`）——它不携带权限信息。

## 什么时候用，什么时候别用

**该用**：

- 模板要按角色分支（访客版隐藏某些区块、会员版显示额外内容）；
- 与 [`Site.IsDefault`](/methods/site/isdefault/)、[`hugo.Sites`](/functions/hugo/sites/) 配合，遍历矩阵中的所有角色站点。

**别用**：

- 把它当**权限系统**：Hugo 是静态站点生成器，页面在构建时就已生成，`Role` 只是「这是哪一套构建」，不是运行时鉴权；
- 用 `.Site.Role.Name` 判断默认站点 → 用 [`Site.IsDefault`](/methods/site/isdefault/)（它同时看语言、版本、角色）；
- 想取「项目定义了哪些角色」→ 本页方法只给当前站点；请遍历 [`hugo.Sites`](/functions/hugo/sites/) 后取各自的 `.Role.Name`。

## 概述

`Site` 对象上的 `Role` 方法返回给定站点的 `Role` 对象，其内容来自项目配置中的角色定义。

## 方法

在 `Role` 对象上使用这些方法。

`IsDefault`
: （`bool`）报告这是否为[默认角色](g)。

  ```go-html-template
  {{ .Site.Role.IsDefault }} → true
  ```

`Name`
: （`string`）返回角色名称，即项目配置中转为小写的键名。

  ```go-html-template
  {{ .Site.Role.Name }} → guest
  ```

## 完整示例（实测）

配置两个角色（`weight` 均未写）：

```toml
[roles.guest]
[roles.member]
```

home 模板：

```go-html-template {file="layouts/index.html"}
<p>角色：{{ .Site.Role.Name }}</p>
<p>是否默认角色：{{ .Site.Role.IsDefault }}</p>
<p>是否默认站点：{{ .Site.IsDefault }}</p>
```

实测各站点产物：

| 站点 | `.Site.Role.Name` | `.Site.Role.IsDefault` | `.Site.IsDefault` |
| --- | --- | --- | --- |
| 未定义任何 `[roles]` 的项目 | `guest` | `true` | `true` |
| `guest` 角色站点（默认角色） | `guest` | `true` | 取决于语言与版本是否也默认 |
| `member` 角色站点 | `member` | `false` | `false` |

**你应当看到什么**：`guest` 是默认角色——即使配置里只写了 `[roles.guest]` / `[roles.member]` 两个空表、没有 `weight`，Hugo 也会选中第一个（字典序）作为默认角色；`member` 站点的 `IsDefault` 为 `false`，其 `.Site.IsDefault` 也随之变成 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；分别测量未定义角色、定义 `guest`/`member` 两种项目。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 项目未定义 `[roles]` | 仍返回默认角色对象：`Name` → `guest`，`IsDefault` → `true` | 否 |
| 定义 `guest`、`member` 且无 `weight` | 默认角色为 `guest`（`IsDefault` → `true`） | 否 |
| `member` 角色站点 | `Name` → `member`，`IsDefault` → `false` | 否 |
| `printf "%T" .Site.Role` | 满足 `returnType` 的 `roles.Role` | 否 |
| 角色名大小写 | `Name` 返回配置键的**小写形式** | 否 |
