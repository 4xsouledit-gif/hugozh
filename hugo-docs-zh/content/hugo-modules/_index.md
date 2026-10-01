+++
title = "Hugo 模块"
linkTitle = "Hugo 模块"
description = "用模块管理站点的内容、呈现与行为，本章总览模块机制与相关页面。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/hugo-modules/"
+++

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

## 使用模块的前置条件

与模块打交道需要在机器上安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 与 [Go](https://go.dev/doc/install) 1.18 或更高版本。此外还要把项目本身初始化为模块，也就是在项目根目录执行 `hugo mod init`，它会生成 `go.mod` 文件；这一步完成后，才能在项目配置的 `[module]` 区段中声明要导入的模块。具体步骤见[使用模块](/hugo-modules/use-modules/)。

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
