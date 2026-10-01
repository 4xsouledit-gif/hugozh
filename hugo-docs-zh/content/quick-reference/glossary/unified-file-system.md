+++
title = "统一文件系统（unified file system）"
linkTitle = "统一文件系统"
description = "为七种构件类型提供分层视图的文件系统，项目层叠加在模块层之上。"
date = 2026-10-02
weight = 1470
source = "https://gohugo.io/quick-reference/glossary/unified-file-system/"
+++

Hugo 的_统一文件系统_（unified file system）为其七种 [_component_](g) 类型分别提供分层视图：[_archetypes_](g)、assets、content、data、templates、[_translation tables_](g) 和静态文件。项目的构件目录叠加在 [_module_](g) 构件目录之上。当多个层包含同一文件时，Hugo 使用层级最高的版本。
