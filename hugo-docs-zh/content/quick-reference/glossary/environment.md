+++
title = "环境"
linkTitle = "环境"
description = "development、staging、production 之一，影响配置与模板逻辑的行为。"
date = 2026-10-02
weight = 400
source = "https://gohugo.io/quick-reference/glossary/environment/"
+++

## 环境

_环境_（environment）通常是 `development`、`staging`、`production` 三者之一，其行为会因配置与模板逻辑的不同而有差异。例如，生产环境中你可能压缩并给 CSS 加指纹，而在开发环境中这么做通常没有意义。

用 `hugo server` 命令运行内置开发服务器时，环境为 `development`；用 `hugo build` 命令构建项目时，环境为 `production`。要覆盖环境值，可以使用 `--environment` 命令行标志或 `HUGO_ENVIRONMENT` 环境变量。

要在模板中确定当前环境，请使用 [`hugo.Environment`](/functions/hugo/environment/) 函数。
