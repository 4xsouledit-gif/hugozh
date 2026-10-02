+++
title = "入门"
linkTitle = "入门"
description = "从零开始搭建并运行一个 Hugo 站点：快速开始、安装、基本用法、目录结构与配置。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/getting-started/"

[params.teach]
difficulty = "入门"
time = "约 1 小时（含动手）"
prereq = [
  "一台可以安装软件的电脑，以及打开终端的权限；不需要任何编程经验。",
  "能照着命令敲、并读懂报错里的文件路径即可——本页不会假设你熟悉命令行。",
]
outcomes = [
  "在自己的操作系统上把 Hugo 装好，并用 `hugo version` 确认版本可用；",
  "用几条命令创建站点、添加内容、在浏览器里预览；",
  "说清 `content/`、`layouts/`、`assets/`、`static/` 各自的职责，判断一份文件该放哪里；",
  "区分**发布**（渲染出静态文件）与**部署**（把文件送上线），独立产出 `public/` 目录；",
  "通过 `hugo.toml`（或 `config/` 目录）配置站点，并知道按环境覆盖配置的方法。",
]
next = ["/getting-started/quick-start/", "/installation/", "/getting-started/directory-structure/"]
+++

这一部分对应 Hugo 官方文档的 **Getting started** 章节，面向第一次接触 Hugo 的读者。这里不假设你会写模板，也不假设你熟悉命令行：每一页都会把「命令执行完应该看到什么」写出来，你照着对照就能判断自己有没有走对。

## 读完本章你应该能够

- 在自己的操作系统上把 Hugo 装好，并用 `hugo version` 确认版本可用；
- 用几条命令创建站点、添加内容、在本地浏览器里预览；
- 说明 `content/`、`layouts/`、`assets/`、`static/` 等目录各自的职责，并判断一份文件该放哪里；
- 区分**发布（publish，渲染出静态文件）**与**部署（deploy，把文件送上线）**，独立产出 `public/` 目录；
- 通过 `hugo.toml`（或 `config/` 目录）配置站点，并知道按环境覆盖配置的方法。

## 建议阅读顺序

按下面的顺序读，后面的页会用到前面页里建好的项目：

1. **[快速开始](/getting-started/quick-start/)** —— 最短路径跑通一个站点，约 15–20 分钟。**先做这一页**，其余页面才有可以动手的对象。
2. **[安装 Hugo](/installation/)** —— 各平台安装方式、版本差异与验证方法。已经装好 Hugo 的读者也值得看一遍，确认自己的安装方式会不会漏掉 `extended` 版本或环境变量。
3. **[基本用法](/getting-started/basic-usage/)** —— 构建、预览、发布三条主线命令，以及草稿/过期/将来内容的开关。
4. **[目录结构](/getting-started/directory-structure/)** —— 站点骨架与 `content/` 的组织方式，是排查「文件放错地方」类问题的第一站。
5. **[配置 Hugo](/configuration/)** —— 配置文件的查找顺序、拆分与环境覆盖。

> [!TIP]
> 只想先看看 Hugo 长什么样？读完第 1 页就够了：装好、跑起来、在浏览器里看到页面，全程不超过半小时。其余几页可以在真正动手改站点时再回来查。

## 卡住时从哪里查

- 报错信息看不懂、或者命令跑完「没有任何反应」→ [故障排查](/troubleshooting/) 按现象查；
- 想知道某条命令有哪些参数 → [命令](/commands/)；
- 想先弄明白 Hugo 是什么、和别的静态站点生成器有什么不同 → [简介](/about/introduction/)。
