+++
title = "CLI"
linkTitle = "CLI"
description = "命令行界面（command-line interface）的缩写。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/quick-reference/glossary/cli/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["在正确的目录里执行 hugo 子命令，并认出命令找不到与跑错目录两种失败"]
next = ["/commands/"]
+++

## CLI

_CLI_ 是命令行界面（command-line interface）的缩写，指以文本方式与计算机程序或操作系统交互的方法。

## 为什么重要

建站、起本地服务、构建、新建内容、管理模块，都靠 CLI 里的 `hugo` 子命令，而且要在项目根目录执行。最常见的两种现象是「命令找不到」（没装或没进 `PATH`）和「跑错目录」——在父目录执行时 Hugo 找不到配置，会构建出一个空站点却仍然返回成功。结果不对时，先确认当前目录里能看到 `hugo.toml`。

延伸阅读：[命令速查](/commands/) · [快速上手](/getting-started/quick-start/)
