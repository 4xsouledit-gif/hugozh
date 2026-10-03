+++
title = "统一文件系统（unified file system）"
linkTitle = "统一文件系统"
description = "为七种构件类型提供分层视图的文件系统，项目层叠加在模块层之上。"
date = 2026-10-02
weight = 1470
source = "https://gohugo.io/quick-reference/glossary/unified-file-system/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断同名文件冲突时哪一层生效，以及自己的改动为什么没生效",
]
next = ["/hugo-modules/theme-components/"]
+++

Hugo 的_统一文件系统_（unified file system）为其七种 [_component_](g) 类型分别提供分层视图：[_archetypes_](g)、assets、content、data、templates、[_translation tables_](g) 和静态文件。项目的构件目录叠加在 [_module_](g) 构件目录之上。当多个层包含同一文件时，Hugo 使用层级最高的版本。

## 为什么重要

「谁覆盖谁」是这套分层视图的全部意义：项目层永远高于模块层，多个模块再按配置顺序决定优先级。这解释了两类常见困惑——改了主题里的文件却没变化（被项目里的同名文件盖住了），以及删掉项目里的同名文件后行为突然改变（下一层露出来了）。模板、资源或数据文件明明存在却找不到时，也要先确认它到底落在哪一层。

延伸阅读：[主题组件](/hugo-modules/theme-components/)、[目录结构](/getting-started/directory-structure/)
