+++
title = "参与文档"
linkTitle = "参与文档"
description = "参与 Hugo 文档：仓库分工、写作与 Markdown 约定、提交流程。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/contribute/documentation/"
+++

## 概述

我们欢迎对文档的修正与改进。文档与主项目位于不同的仓库，参与方式因此有两种：

- 修正与改进既有文档：向[文档仓库](https://github.com/gohugoio/hugoDocs/)提交议题与拉取请求。
- 为新功能编写文档：把文档改动包含在向[项目仓库](https://github.com/gohugoio/hugo)提交的拉取请求中。

## 写作风格

在可行的情况下遵循 Google 的[开发者文档风格指南](https://developers.google.com/style)，并遵守下列约定：

- 优先使用主动语态与现在时。写「用 Hugo 构建静态站点」，而不是「使用 Hugo 可以构建静态站点」。
- 使用第二人称，而不是第三人称。写「删除文件时要小心」，而不是「用户删除文件时应小心」。
- 尽量少用副词。
- 用完整的句子引出列表与代码示例，不要用缺少主语或谓语的片段。
- 尽可能使用面向全球读者的基础英语。
- 优先写当前的最佳实践，而不是罗列多种方案或历史信息。
- 避免使用括号中的 e.g. 表达、破折号与分号。

## Markdown 约定

- 使用 ATX 标题（二至四级），不要使用 setext 标题。
- 使用折叠式链接引用；链接到同一页面内的片段时使用行内链接。
- 使用围栏代码块，不要使用缩进代码块。为代码块标注语言，模板用 `go-html-template`，Markdown 用 `md`，命令行用 `sh`，目录树用 `tree`。
- 无序列表使用连字符，不要使用星号；有序列表的每一项都以 `1.` 开头，而不是逐个编号。
- 用提示块（callout）强调内容，不要用加粗代替；也不要用加粗代替标题。
- 不要在 Markdown 中混入原始 HTML。
- 不要使用 Hugo 的 `ref` 或 `relref` 短代码。
- 不要在标题之后紧接列表，先写一句引导语。
- 删除连续的空行与行尾空格。

## 章节标题与文件路径

标题中不要使用反引号、加粗、斜体等格式；使用句式大小写，保持简洁；不要只设一个子标题，要么补充更多子标题，要么去掉该标题。目录名、文件名与文件路径一律用反引号包裹。

## 术语

术语要保持一致。例如 file name、front matter、home page 都写作两个词，website 写作一个词，Markdown 首字母大写，用 map 而不是 dictionary。同时要区分产品与可执行文件：产品与项目名用普通文本并大写，例如 Hugo；命令行可执行文件用小写并加反引号，例如 `hugo`。

## 前置元数据

文档页面使用 `title`、`description`、`categories`、`keywords` 四个必需字段，但其中只有 `title` 与 `description` 需要填写数据。可选的常用字段包括 `linkTitle`、`weight`、`aliases`，以及控制搜索索引的 `params.searchable` 等。需要引号时优先使用单引号。

## 代码示例

代码示例要短小、聚焦。模板示例用两个空格缩进，开始定界符之后、结束定界符之前各留一个空格，并始终以函数的规范形式调用函数或方法。用 `file` 与 `copy` 属性可以显示文件名并添加复制按钮。

## 本地预览与 GitHub 工作流

> [!NOTE]
> 本节假定你熟悉 Git 与 GitHub，并且习惯在命令行中工作。

1. 派生[文档仓库](https://github.com/gohugoio/hugoDocs/)。
2. 克隆你的派生仓库。
3. 新建分支，分支名要有描述性并包含对应的议题编号（如果有）：

   ```bash
   git checkout -b restructure-foo-page-99999
   ```

4. 修改文档。
5. 在本地构建站点，预览你的改动。
6. 提交改动。沿用在开发流程中说明的提交信息约定，但摘要以 `content`、`theme`、`config`、`all` 或 `misc` 之一开头，后接冒号、空格，以及以大写字母开头的简短说明；可选地添加引用议题的 `Fixes`、`Closes` 行。例如：

   ```bash
   git commit -m "content: Restructure the taxonomy page

   This restructures the taxonomy page by splitting topics into logical
   sections, each with one or more examples.

   Fixes #9999
   Closes #9998"
   ```

7. 把新分支推送到你的派生仓库。
8. 访问文档仓库，创建拉取请求（PR）。
9. 项目维护者会审查你的 PR，可能会要求修改。维护者合并 PR 之后，你可以删除该分支。
