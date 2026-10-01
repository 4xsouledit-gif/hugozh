+++
title = "Version"
linkTitle = "Version"
description = "返回给定站点的 Version 对象。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/methods/site/version/"

[params.functions_and_methods]
signatures = ["SITE.Version"]
returnType = "versions.Version"
+++

**（0.153.0 新增）**

## 概述

`Site` 对象上的 `Version` 方法返回给定站点的 `Version` 对象，其内容来自项目配置中的版本定义。

## 方法

在 `Version` 对象上使用这些方法。

`IsDefault`
: （`bool`）报告这是否为[默认版本](g)。

  ```go-html-template
  {{ .Site.Version.IsDefault }} → true
  ```

`Name`
: （`string`）返回版本名称，即项目配置中转为小写的键名。

  ```go-html-template
  {{ .Site.Version.Name }} → v1.0.0
  ```
