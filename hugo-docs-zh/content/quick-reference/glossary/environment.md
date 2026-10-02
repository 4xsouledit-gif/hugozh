+++
title = "环境"
linkTitle = "环境"
description = "development、staging、production 之一，影响配置与模板逻辑的行为。"
date = 2026-10-02
weight = 400
source = "https://gohugo.io/quick-reference/glossary/environment/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断当前命令跑在哪个环境，并解释「本地正常、部署后不一样」的常见原因"]
next = ["/configuration/introduction/"]
+++

## 环境

_环境_（environment）通常是 `development`、`staging`、`production` 三者之一，其行为会因配置与模板逻辑的不同而有差异。例如，生产环境中你可能压缩并给 CSS 加指纹，而在开发环境中这么做通常没有意义。

用 `hugo server` 命令运行内置开发服务器时，环境为 `development`；用 `hugo build` 命令构建项目时，环境为 `production`。要覆盖环境值，可以使用 `--environment` 命令行标志或 `HUGO_ENVIRONMENT` 环境变量。

要在模板中确定当前环境，请使用 [`hugo.Environment`](/functions/hugo/environment/) 函数。

## 为什么重要

环境是「同一份代码、不同结果」的开关：配置目录可以按环境分层，模板里也常按环境决定是否输出分析脚本、是否加指纹。正因为 `hugo server` 默认是 `development` 而 `hugo build` 默认是 `production`，本地预览看不到生产专属逻辑是正常的，反过来在 CI 里忘了设置环境（或 `HUGO_ENVIRONMENT` 被托管平台覆盖）就会让生产构建套用开发配置，页面能打开但少了压缩、指纹或正确的 `baseURL`。

延伸阅读：[配置简介](/configuration/introduction/)、[托管与部署](/host-and-deploy/)
