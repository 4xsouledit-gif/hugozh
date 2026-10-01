+++
title = "Role"
linkTitle = "Role"
description = "返回给定站点的 Role 对象。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/site/role/"

[params.functions_and_methods]
signatures = ["SITE.Role"]
returnType = "roles.Role"
+++

**（0.153.0 新增）**

## 概述

`Site` 对象上的 `Role` 方法返回给定站点的 `Role` 对象，其内容来自项目配置中的角色定义。

## 方法

在 `Role` 对象上使用这些方法。

`IsDefault`
: （`bool`）报告这是否为[默认角色](g)。

  ```go-html-template
  {{ .Site.Role.IsDefault }} → true
  ```

`Name`
: （`string`）返回角色名称，即项目配置中转为小写的键名。

  ```go-html-template
  {{ .Site.Role.Name }} → guest
  ```
