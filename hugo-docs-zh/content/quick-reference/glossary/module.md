+++
title = "模块（module）"
linkTitle = "模块"
description = "由构件打包而成的组合，可以是主题、完整项目或更小的构件集合。"
date = 2026-10-02
weight = 780
source = "https://gohugo.io/quick-reference/glossary/module/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个主题或依赖是不是模块，并解释文件存在却不生效该查哪里"]
next = ["/hugo-modules/introduction/"]
+++

模块（module）是由[components](g)打包而成的组合，其中可以包含[archetypes](g)、资源、内容、数据、模板、[translation tables](g)和静态文件。一个模块可以是一个[theme](g)、一个完整的项目，也可以是一个或多个构件组成的更小集合。

## 为什么重要

主题本身就是一个模块，把一个主题挂到项目上、或引入第三方组件库，都是通过模块配置与 [mount](g)（挂载）完成的。站点里「文件明明存在却不生效」的问题，多数要回到模块的查找顺序上：项目层的同名文件优先于模块层，而挂载会改变各构件目录的实际来源。升级或替换主题前先确认模块来源，能省下不少排查时间。

延伸阅读：[模块简介](/hugo-modules/introduction/)、[主题组件](/hugo-modules/theme-components/)
