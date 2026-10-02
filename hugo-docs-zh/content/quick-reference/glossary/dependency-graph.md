+++
title = "依赖图"
linkTitle = "依赖图"
description = "以图形方式表示项目中各模块之间的依赖关系。"
date = 2026-10-02
weight = 350
source = "https://gohugo.io/quick-reference/glossary/dependency-graph/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断某个模板或主题到底来自哪个模块，并知道用哪条命令把依赖关系打出来"]
next = ["/hugo-modules/introduction/"]
+++

## 依赖图

_依赖图_（dependency graph）以图形方式表示 Hugo 项目中所用[module](g)之间的关系，展示模块之间如何相互依赖，形成一张依赖关系网络。

## 为什么重要

一个站点往往同时依赖主题、组件库和若干模块，模板查找是从这些模块叠加出来的；当出现「改了文件却不生效」或「样式来自某个不认识的路径」时，先看依赖图能确定文件到底来自哪一层。模块之间存在循环依赖或同一模块被拉进多个版本时，构建会报错或用到非预期的版本，`hugo mod graph` 输出的正是这张图，配合 `hugo mod tidy` 可以收敛它。

延伸阅读：[Hugo Modules 简介](/hugo-modules/introduction/)、[hugo mod graph](/commands/hugo-mod-graph/)
