+++
title = "常见问题"
linkTitle = "常见问题"
description = "新用户最常遇到的问题及其原因与解决办法。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/troubleshooting/faq/"
+++

## 关于这份常见问题

Hugo 的[论坛](https://discourse.gohugo.io)是活跃的用户与开发者社区，两万多个主题中往往已经有人回答过你的问题；中文提问请用官方论坛的[中文分类](https://discourse.gohugo.io/c/chinese/42)。提问之前，请先阅读论坛的[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)。下面列出新用户最常问到的若干问题。

## 提示某个功能不可用

当你在所安装的版本（edition）中使用它并不提供的功能时，Hugo 会抛出这个错误：

```text
this feature is not available in this edition of Hugo
```

解决办法是安装另一个版本，详见[安装](/installation/)。

## 访问首页时显示「Page Not Found」

请检查 `content/_index.md` 文件：

- `draft` 是否被设为 `true`？
- `date` 是否在未来？
- `publishDate` 是否在未来？
- `expiryDate` 是否已经过去？

只要有一项答案为「是」，就修改字段值，或使用 `--buildDrafts`、`--buildFuture`、`--buildExpired` 中的一个命令行标志。

## 某个页面没有被发布

请检查 `content/section/page.md` 或 `content/section/page/index.md` 文件，判断标准与上一个问题相同：`draft`、`date`、`publishDate`、`expiryDate`。同样，修改字段值，或使用 `--buildDrafts`、`--buildFuture`、`--buildExpired`。

## 看不到某个页面的下级页面

你可能用了 `index.md`，而这里应当是 `_index.md`。详见[页面包](/content-management/page-bundles/)。

## `index.md` 与 `_index.md` 有什么区别

含 `index.md` 的目录是叶子包，含 `_index.md` 的目录是分支包。详见[页面包](/content-management/page-bundles/)。

## 局部模板没有按预期渲染

调用局部模板（partial）时，可能忘记传入所需的上下文。例如：

```go-html-template
{{/* 错误：缺少上下文 */}}
{{ partial "pagination.html" }}

{{/* 正确 */}}
{{ partial "pagination.html" . }}
```

## 给变量赋值时 `:=` 与 `=` 有什么区别

用 `:=` 初始化变量，用 `=` 给此前已经初始化的变量赋值。详见 [text/template 关于变量的说明](https://pkg.go.dev/text/template#hdr-Variables)。

## 列表页分页后页面集合没有按条件过滤

很可能在同一页面上多次调用了 `Paginate` 或 `Paginator` 方法。详见[分页](/templates/pagination/)。

## 为什么短代码有两种调用方式

如果短代码模板本身，或开始与结束标签之间的内容包含 Markdown，使用 `{{%/* shortcode */%}}` 写法；否则使用 `{{</* shortcode */>}}` 写法。详见[短代码的写法](/shortcodes/#两种定界符)。

## 可以用环境变量控制配置吗

可以。详见[配置](/configuration/introduction/#环境变量)。

## 每次构建的输出为什么不一致

最常见的原因是页面冲突（两个页面发布到同一路径）以及并发带来的影响。用 `--printPathWarnings` 命令行标志检查页面冲突；如果怀疑是并发问题，请在[论坛](https://discourse.gohugo.io)发帖说明。

## 开发服务器为什么检测不到文件变化

在默认配置下，以下情形中 Hugo 的文件监视器可能无法检测到文件变化：

- 在 Windows Subsystem for Linux（WSL/WSL2）中运行 Hugo，而项目文件位于 Windows 分区；
- 在本地运行 Hugo，而项目文件位于可移动驱动器；
- 在本地运行 Hugo，而项目文件位于通过 NFS、SMB 或 CIFS 协议访问的存储服务器。

这些情况下请改用 `--poll` 命令行标志，以轮询代替原生文件系统事件。例如每 700 毫秒轮询一次项目文件：`--poll 700ms`。

## 页面的 Store 里为什么缺少某个值

`Page` 对象的 `Store` 方法为该页面建立持久的数据结构，用于存放和操作键值数据。这些值通常在短代码模板、由短代码调用的局部模板或渲染钩子模板中设置；在 Hugo 渲染页面内容之前，它们都不是确定值。

如果需要从父模板访问已存储的值，而父模板尚未渲染页面内容，可以把返回值赋给一个无用的 noop 变量，以此触发内容渲染：

```go-html-template
{{ $noop := .Content }}
{{ .Store.Get "mykey" }}
```

用其他方法同样可以触发内容渲染，见下一个问题。

## 哪些页面方法会触发内容渲染

`Page` 对象上的以下方法会触发内容渲染：`Content`、`ContentWithoutSummary`、`FuzzyWordCount`、`Len`、`Plain`、`PlainWords`、`ReadingTime`、`Summary`、`Truncated`、`WordCount`。

## 更多问题

其他问题请访问[论坛](https://discourse.gohugo.io)，提问之前请先阅读[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)。
