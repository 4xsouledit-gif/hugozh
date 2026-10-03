+++
title = "Hugo 函数"
linkTitle = "hugo"
description = "用这些函数获取 Hugo 应用程序与当前运行环境的信息。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/hugo/"
+++

## 本章导读

`hugo` 命名空间下的函数返回的是**构建环境自身**的信息，而不是内容或页面数据：Hugo 的版本号与编译信息、运行环境名称、站点是否多语言或多主机、项目工作目录、全局存储等。

这些值常用于条件渲染，例如只在生产环境输出统计脚本、在开发服务器上显示调试信息，或按版本号决定是否启用某个参数。

## 读完本章你应该能够

- 用 [`hugo.Version`](/functions/hugo/version/)、[`hugo.IsExtended`](/functions/hugo/isextended/) 判断当前二进制具备哪些能力，并知道版本号要拆成数字再比较；
- 用 [`hugo.Environment`](/functions/hugo/environment/)、[`hugo.IsProduction`](/functions/hugo/isproduction/)、[`hugo.IsDevelopment`](/functions/hugo/isdevelopment/)、[`hugo.IsServer`](/functions/hugo/isserver/) 区分构建/运行环境，并说清它们之间的差别；
- 用 [`hugo.Data`](/functions/hugo/data/) 读取 `data` 目录、用 [`hugo.Store`](/functions/hugo/store/) 跨模板共享数据，并知道后者的全局作用域会跨页面累积；
- 用 [`hugo.Sites`](/functions/hugo/sites/) 遍历多语言/多版本站点集合，取出默认站点；
- 收集排查问题所需的环境信息：[`hugo.BuildDate`](/functions/hugo/builddate/)、[`hugo.CommitHash`](/functions/hugo/commithash/)、[`hugo.GoVersion`](/functions/hugo/goversion/)、[`hugo.WorkingDir`](/functions/hugo/workingdir/)。

## 建议阅读顺序

1. 环境判断：[`hugo.Environment`](/functions/hugo/environment/) → [`hugo.IsProduction`](/functions/hugo/isproduction/) → [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/) → [`hugo.IsServer`](/functions/hugo/isserver/)；
2. 版本与发行版：[`hugo.Version`](/functions/hugo/version/) → [`hugo.IsExtended`](/functions/hugo/isextended/)；
3. 数据存取：[`hugo.Data`](/functions/hugo/data/) → [`hugo.Store`](/functions/hugo/store/)；
4. 多站点：[`hugo.Sites`](/functions/hugo/sites/) → [`hugo.IsMultilingual`](/functions/hugo/ismultilingual/) → [`hugo.IsMultihost`](/functions/hugo/ismultihost/) → [`hugo.Deps`](/functions/hugo/deps/)；
5. 按需查阅：[`hugo.Generator`](/functions/hugo/generator/)、[`hugo.BuildDate`](/functions/hugo/builddate/)、[`hugo.CommitHash`](/functions/hugo/commithash/)、[`hugo.GoVersion`](/functions/hugo/goversion/)、[`hugo.WorkingDir`](/functions/hugo/workingdir/)。
