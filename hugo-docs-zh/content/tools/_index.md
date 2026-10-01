+++
title = "工具"
linkTitle = "工具"
description = "帮助你创建和管理站点的第三方工具。"
date = 2026-10-01
weight = 150
source = "https://gohugo.io/tools/"
+++

## 本节概览

Hugo 本身只做一件事：把内容与模板编译成静态站点。围绕这项工作，社区与商业公司开发了大量第三方工具，覆盖编写内容、编辑可视化界面、站内搜索，以及从其他系统迁移这几类需求。本节按用途把它们分门别类地列出来，方便你按需挑选。

这些工具都由 Hugo 之外的团队独立开发与维护，Hugo 项目不对它们的可用性、安全性或后续维护作出保证。选用之前，建议先确认它是否仍在更新、是否支持你当前使用的 Hugo 版本。

## 页面索引

| 页面 | 内容 |
| --- | --- |
| [编辑器](/tools/editors/) | 为 Hugo 模板、短代码与前置字段提供语法支持的编辑器插件 |
| [前端框架与构建工具](/tools/front-ends/) | 用图形界面管理 Hugo 内容的可视化 CMS 与桌面应用 |
| [从其他系统迁移](/tools/migrations/) | 把 Jekyll、WordPress、Medium 等内容导出为 Hugo 格式的工具 |
| [站内搜索](/tools/search/) | 为静态站点加上搜索功能的开源与商业方案 |
| [其他工具](/tools/other/) | 社区开发的图库、分析、嵌入等周边项目 |

## 如何选择

如果只是想少打几个字，先看[编辑器](/tools/editors/)：这类插件装进你已经在用的编辑器即可，改动最小。若你或团队的编辑者不习惯直接写 Markdown，[前端框架与构建工具](/tools/front-ends/)里的可视化 CMS 更合适，它们通常直接读写 Git 仓库中的内容文件，与 Hugo 的构建流程互不干扰。给站点加搜索要从[站内搜索](/tools/search/)入手：内容规模不大时，用构建期生成的 JSON 索引配合客户端脚本就够了；体量很大或需要多语言分词时，再考虑第三方搜索服务。

至于从旧系统搬到 Hugo，先看[从其他系统迁移](/tools/migrations/)。Jekyll 用户可以直接用 Hugo 内置的 [hugo import jekyll](/commands/hugo-import-jekyll/) 命令，无需额外安装工具；其他系统则多半要先导出成 Markdown 或 XML，再交给社区工具转换。迁移过程涉及内容目录的组织方式，建议同时对照[目录结构](/getting-started/directory-structure/)与[内容管理](/content-management/)两节，把源站点的分类、标签与固定链接映射到 Hugo 的概念上，避免搬运完成后还要返工。
