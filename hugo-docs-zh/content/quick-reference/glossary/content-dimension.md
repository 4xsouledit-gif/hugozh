+++
title = "内容维度"
linkTitle = "内容维度"
description = "「内容维度」即维度（dimension）。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/quick-reference/glossary/content-dimension/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断启用语言或版本之后，同一个页面为什么会以多份路径出现，并知道去哪一页核对配置"]
next = ["/configuration/versions/"]
+++

## 内容维度

参见 [dimension](g)（维度）。

## 为什么重要

内容维度是 Hugo 表达「同一套内容、不同目标」的方式：语言、角色（role）、版本（version）各是一个维度，页面通过 `translationKey` 在各维度上对齐成同一个页面组。单语言站点通常感受不到它；一旦启用了语言或版本，`.Translations`、`site.Sites` 与带前缀的 URL 都会按维度展开，配置里漏掉某一维就会出现同一页面被当成两个页面、或翻译链接为空。改动维度配置后，先看构建产物里是否真的多出了对应路径。

延伸阅读：[版本](/configuration/versions/) · [多语言](/configuration/languages/)
