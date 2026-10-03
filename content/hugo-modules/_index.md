+++
title = "Hugo 模块"
linkTitle = "Hugo 模块"
description = "用模块管理站点的内容、呈现与行为：讲清模块解决什么问题、挂载与导入怎么用，并给出可运行示例、验证方法与常见坑。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/hugo-modules/"

[params.teach]
difficulty = "进阶"
time = "60–90 分钟（含动手）"
prereq = [
  "站点能正常构建：`hugo --renderToMemory` 退出码为 0，并且你已经知道 `content/`、`layouts/`、`static/`、`assets/` 各自的职责（见[目录结构](/getting-started/directory-structure/)）。",
  "电脑上装了 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)；要下载**远端**模块（例如 GitHub 上的主题）还需要 [Go](https://go.dev/doc/install) 1.18 或更高版本，并把它加进 `PATH`。",
  "可以联网（只有 `themes/` 下的本地模块与本地目录挂载能完全离线跑通）。",
]
outcomes = [
  "说出模块能提供的七类组件，并解释「统一文件系统」把项目、主题、外部目录放在一起查找意味着什么；",
  "用 `[[module.mounts]]` 把项目外的目录挂进 `content`、`layouts`、`static`、`data`，并解释为什么挂载是**覆盖式**的、必须把默认挂载写回去；",
  "用 `[[module.imports]]` 引入模块，并判断同名文件、同名短代码、同一条译文最终由谁生效；",
  "把主题配成多个组件的组合，预测某个模板或某条译文来自哪个主题；",
  "把模块的 Node.js 依赖汇总进 `packages/hugoautogen/`，并读懂 `npm dependencies are out of sync` 警告。",
]
next = ["/hugo-modules/introduction/", "/hugo-modules/use-modules/", "/hugo-modules/theme-components/", "/hugo-modules/nodejs-dependencies/", "/configuration/module/"]
+++

## 这一页解决什么问题

主题、短代码库、共享内容、前端依赖，在 Hugo 里都由**模块**（module）承载。这一章要回答的是同一个问题的两面：**怎么把别人写好的东西拿来用**，以及**怎么只盖掉其中不满意的那一小部分**。读完你能看懂一份 `hugo.toml` 里的 `[module]` 段在做什么，也能自己把项目之外的目录接进站点。

本章只讲「怎么用起来、用错会看到什么现象」，不是 `[module]` 的参考手册——每个配置键的类型、默认值与取值请查[模块配置](/configuration/module/)。

## 章节概览

Hugo 把模块（module）当作最基本的组织单位。一个模块可以是一个完整的 Hugo 项目，也可以是更小的可复用片段，用来提供 Hugo 七类组件（component）中的一类或几类：静态文件、内容、布局、数据、资源、国际化（i18n）资源，以及原型。

模块可以按任意组合与顺序搭配使用，也可以挂载外部目录——包括那些并非 Hugo 项目的目录——从而在效果上得到一个统一的文件系统：项目、主题、第三方模块与外部目录里的文件，都像是放在同一棵目录树中。

本章包含以下页面：

| 页面 | 内容 |
| --- | --- |
| [简介](/hugo-modules/introduction/) | 模块是什么、能提供哪些组件、为什么有用 |
| [使用模块](/hugo-modules/use-modules/) | 前置条件、导入、更新、整理、缓存、vendor 与本地开发 |
| [主题组件](/hugo-modules/theme-components/) | 把主题拆成多个可组合组件，以及覆盖顺序 |
| [Node.js 依赖](/hugo-modules/nodejs-dependencies/) | 声明并合并各模块的 Node.js 依赖 |

## 读完本章你应该能够

- 说出模块能提供的七类组件（静态文件、内容、布局、数据、资源、国际化资源、原型），并解释「统一文件系统」意味着什么；
- 在项目根目录用 `hugo mod init` 把项目变成模块，用 `[[module.imports]]` 引入别人写好的模块；
- 用 `[[module.mounts]]` 把项目外的目录挂进 `content`、`layouts`、`static`、`data`，并知道**挂载是覆盖式的**：为某个组件定义挂载会移除该组件的默认挂载；
- 把主题配置成多个组件的组合，并预测某一个模板文件、某一条译文最终取自哪个主题；
- 把各模块的 Node.js 依赖汇总到 `packages/hugoautogen/package.json`，并在看到 `npm dependencies are out of sync` 警告时知道该跑哪条命令。

## 建议阅读顺序

四页之间有依赖关系，按下面的顺序读最省力：

1. **[简介](/hugo-modules/introduction/)** —— 先建立「模块是什么、统一文件系统长什么样」，页内有一个**不需要联网**的挂载例子，约 15 分钟。
2. **[使用模块](/hugo-modules/use-modules/)** —— 本章主干：初始化、导入、更新、缓存、vendor、本地开发与挂载，每一步都给出验证方法。
3. **[主题组件](/hugo-modules/theme-components/)** —— 把主题看成一组可组合的组件，重点是优先级顺序；动手改主题、覆盖模板之前必读。
4. **[Node.js 依赖](/hugo-modules/nodejs-dependencies/)** —— 只有当模块自带 `package.json`（例如 Tailwind CSS）时才需要读。

> [!TIP]
> 只想把现成的主题用起来？读[使用模块](/hugo-modules/use-modules/)的「导入模块」与「本地开发」两节就够；`_vendor`、工作区与私有模块可以等真正用到时再回来查。配置键的完整清单在[模块配置](/configuration/module/)，卡住时的排查入口见[故障排查](/troubleshooting/)。

## 使用模块的前置条件

与模块打交道需要在机器上安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 与 [Go](https://go.dev/doc/install) 1.18 或更高版本。此外还要把项目本身初始化为模块，也就是在项目根目录执行 `hugo mod init`，它会生成 `go.mod` 文件；这一步完成后，才能在项目配置的 `[module]` 区段中声明要导入的模块。具体步骤见[使用模块](/hugo-modules/use-modules/)。

> **实测（v0.167.0，Windows；单语言站点）**：`go` 不在 `PATH` 时，`hugo mod init` 会直接失败：
>
> ```text
> ERROR failed to init modules: binary with name "go" not found in PATH
> ```
>
> 退出码为 1。也就是说，Hugo 0.167.0 的 `hugo mod init` 是**调用 `go` 命令**完成的，不是自己写 `go.mod`；只装着 Hugo 是跑不过去的。作为对照，同一台机器上**只使用 `themes/` 目录里的本地模块**时，构建、`hugo mod npm pack`、`hugo mod vendor` 都能正常执行，不需要 `go`——只有需要从远端下载模块时才真正用到 Go 工具链。

## 为什么需要模块

模块机制主要解决可复用性与依赖管理的问题：

- 主题以模块的形式分发，安装与升级都交给 Go 的依赖工具链，版本记录在 `go.mod` 与 `go.sum` 中，构建结果可重复。
- 一个项目可以同时导入多个模块，并按顺序决定优先级，从而把「主题基础部分 + 若干可复用片段」组合成一个主题。
- 模块不仅能提供模板与静态文件，还能提供内容、数据、i18n 资源与原型，因此可以共享的不只是外观，也包括内容结构与站点行为。
- 非 Hugo 项目的目录同样可以挂载进来，把外部来源的文件纳入同一套目录结构。

## 模块化的目录结构

Hugo 为项目、主题与模块定义了一套标准的组件目录。导入模块时，模块内的这些目录会自动挂载到 Hugo 的统一文件系统中；也可以在项目配置里手动挂载任意目录，包括来自非 Hugo 项目的目录。项目里各目录各自的职责见[目录结构](/getting-started/directory-structure/)，挂载的写法见[使用模块](/hugo-modules/use-modules/)中的挂载一节。

## 相关命令

模块的日常操作集中在 `hugo mod` 命令族中，本站已收录的页面包括：

- [hugo mod](/commands/hugo-mod/)：模块相关子命令的父命令。
- [hugo mod init](/commands/hugo-mod-init/)：把当前项目初始化为模块。
- [hugo mod get](/commands/hugo-mod-get/)：取回或升级模块依赖。
- [hugo mod tidy](/commands/hugo-mod-tidy/)：清理 `go.mod` 与 `go.sum` 中不再使用的条目。
- [hugo mod vendor](/commands/hugo-mod-vendor/)：把依赖复制到项目内的 `_vendor` 目录。
- [hugo mod graph](/commands/hugo-mod-graph/)：打印模块依赖图。
- [hugo mod npm pack](/commands/hugo-mod-npm-pack/)：合并各模块的 Node.js 依赖。
- [hugo mod clean](/commands/hugo-mod-clean/)：清理模块缓存。
