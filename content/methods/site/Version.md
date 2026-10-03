+++
title = "Version"
linkTitle = "Version"
description = "返回给定站点的 Version 对象。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/methods/site/version/"

[params.functions_and_methods]
signatures = ["SITE.Version"]
returnType = "versions.Version"
+++

## 这一页解决什么问题

**（0.153.0 新增）**

「版本（version）」是 Hugo 0.153 引入的站点[维度](g)之一。`[versions.'v1.0.0']` 这样的配置让同一个项目**按版本构建多套站点**，典型场景是软件文档：v1、v2、v3 的文档各自一套，侧栏里带版本切换器。

`Version` 返回**当前站点**的版本对象，你能从中拿到版本名（`Name`，即配置键的小写形式）与它是不是默认版本（`IsDefault`）。

## 什么时候用，什么时候别用

**该用**：

- 页面上显示「当前文档版本：v2.0.0」；
- 版本切换器：与 [`hugo.Sites`](/functions/hugo/sites/) 配合，列出各版本站点的链接；
- 模板按版本分支。

**别用**：

- 把它当语义化版本解析器 → `Name` 就是配置键的小写形式，需要比较版本高低请按 [配置 versions](/configuration/versions/) 的排序规则在配置层解决；
- 用 `.Site.Version.Name` 判断默认 → 用 `.Site.Version.IsDefault`（只看版本）或 [`Site.IsDefault`](/methods/site/isdefault/)（看三个维度）；
- 项目没定义版本却想区分多版本 → 没有 `[versions]` 时只有一套站点，`.Site.Version.Name` 恒为 `v1.0.0`。

## 概述

`Site` 对象上的 `Version` 方法返回给定站点的 `Version` 对象，其内容来自项目配置中的版本定义。

## 方法

在 `Version` 对象上使用这些方法。

`IsDefault`
: （`bool`）报告这是否为[默认版本](g)。

  ```go-html-template
  {{ .Site.Version.IsDefault }} → true
  ```

`Name`
: （`string`）返回版本名称，即项目配置中转为小写的键名。

  ```go-html-template
  {{ .Site.Version.Name }} → v1.0.0
  ```

## 完整示例（实测）

配置三个版本（都未写 `weight`，默认版本按语义版本降序取最高者）：

```toml
[versions.'v1.0.0']
[versions.'v2.0.0']
[versions.'v3.0.0']
```

home 模板：

```go-html-template {file="layouts/index.html"}
<p>当前版本：{{ .Site.Version.Name }}</p>
<p>是否默认版本：{{ .Site.Version.IsDefault }}</p>
```

实测各站点产物：

| 站点 | `.Site.Version.Name` | `.Site.Version.IsDefault` |
| --- | --- | --- |
| 未定义 `[versions]` 的项目 | `v1.0.0` | `true` |
| 默认版本站点（实测 `/en/`） | `v3.0.0` | `true` |
| 非默认版本站点（实测 `/v1.0.0/en/`） | `v1.0.0` | `false` |

**你应当看到什么**：默认版本是 `v3.0.0`——配置里没有 `defaultContentVersion` 时，未指定 `weight` 的版本按**语义版本降序**排，最高的成为默认；非默认版本会被发布到以版本名命名的子目录（实测 `/v1.0.0/en/`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；分别测量未定义版本与定义 3 个版本的项目。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 未定义 `[versions]` | 仍返回版本对象：`Name` → `v1.0.0`，`IsDefault` → `true` | 否 |
| 定义 3 个版本、无 `weight` | 默认版本为 `v3.0.0`（语义版本降序首位） | 否 |
| 非默认版本站点 | `Name` → 该版本名，`IsDefault` → `false` | 否 |
| `printf "%T" .Site.Version` | 满足 `returnType` 的 `versions.Version` | 否 |
| 版本名大小写 | `Name` 返回配置键的**小写形式** | 否 |
