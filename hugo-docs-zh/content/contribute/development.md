+++
title = "参与开发"
linkTitle = "参与开发"
description = "参与 Hugo 开发：贡献方式、功能提案、构建测试与提交补丁的流程。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/contribute/development/"
+++

## 概述

参与 Hugo 项目有很多种方式，不限于写代码。你可以：

- 在[论坛](https://discourse.gohugo.io)回答问题（中文交流见[中文分类](https://discourse.gohugo.io/c/chinese/42)）；
- 改进[文档](https://github.com/gohugoio/hugoDocs)；
- 关注[议题队列](https://github.com/gohugoio/hugo/issues)；
- 创建或改进[主题](https://themes.gohugo.io/)；
- 修复[缺陷](https://github.com/gohugoio/hugo/issues?q=is%3Aopen+is%3Aissue+label%3ABug)。

文档相关的议题与拉取请求请提交到文档仓库。完整的贡献指南见 [CONTRIBUTING.md](https://github.com/gohugoio/hugo/blob/master/CONTRIBUTING.md)。

## 功能提案

如果你有改进或新功能的想法，请先在论坛的 Feature 分类发起新话题。这样做有助于：

- 确认该能力是否已经存在；
- 衡量社区的兴趣；
- 打磨概念。

如果兴趣足够，再[提交提案](https://github.com/gohugoio/hugo/issues/new?labels=Proposal%2C+NeedsTriage&template=feature_request.md)。在项目负责人接受提案之前，请不要提交拉取请求。

## 前置条件

要从源码构建 Hugo，必须先安装：

1. 安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)；
2. 安装 [Go](https://go.dev/doc/install)，版本不低于官方文档标注的当前版本。

## GitHub 工作流

> [!NOTE]
> 本节假定你熟悉 Go、Git 与 GitHub，并且习惯在命令行中工作。

用下面的流程创建并提交拉取请求。

1. 派生（fork）[项目仓库](https://github.com/gohugoio/hugo/)。
2. 克隆你的派生仓库。
3. 新建一个分支，分支名要有描述性，并包含对应的议题编号。新增功能时：

   ```bash
   git checkout -b feat/implement-some-feature-99999
   ```

   修复缺陷时：

   ```bash
   git checkout -b fix/fix-some-bug-99999
   ```

4. 修改代码。
5. 构建并安装。构建标准版本：

   ```bash
   CGO_ENABLED=0 go install
   ```

   构建 deploy 版本（自 v0.159.2 起）：

   ```bash
   CGO_ENABLED=0 go install -tags withdeploy
   ```

   构建扩展（extended）版本，需要先安装 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)：

   ```bash
   CGO_ENABLED=1 go install -tags extended
   ```

   构建扩展版加 deploy 版本，同样需要 C 编译器：

   ```bash
   CGO_ENABLED=1 go install -tags extended,withdeploy
   ```

6. 测试你的改动：

   ```bash
   go test ./...
   ```

7. 提交改动，并写清楚提交信息（约定见下）。
8. 把新分支推送到你的派生仓库。
9. 访问[项目仓库](https://github.com/gohugoio/hugo/)，创建拉取请求（PR）。
10. 项目维护者会审查你的 PR，可能会要求修改。维护者合并 PR 之后，你可以删除该分支。

### 提交信息约定

- 第一行是摘要，通常不超过 50 个字符，之后空一行。摘要以包名开头，后接冒号、空格，以及以大写字母开头的简短说明；使用祈使句的现在时态，具体要求见[提交信息指南](https://github.com/gohugoio/hugo/blob/master/CONTRIBUTING.md#git-commit-message-guidelines)。
- 可选地提供详细描述，每行不超过 72 个字符，之后空一行。
- 添加一行或多行 `Fixes`、`Closes` 关键字，各自单独成行，并引用本次改动解决的[议题](https://github.com/gohugoio/hugo/issues)。

例如：

```bash
git commit -m "tpl/strings: Create wrap function

The strings.Wrap function wraps a string into one or more lines,
splitting the string after the given number of characters, but not
splitting in the middle of a word.

Fixes #99998
Closes #99999"
```
