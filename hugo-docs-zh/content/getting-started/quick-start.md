+++
title = "快速开始"
linkTitle = "快速开始"
description = "用几条命令创建 Hugo 项目、添加内容、启动本地服务器并生成静态站点。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/getting-started/quick-start/"
+++

本教程带你完成四件事：创建项目、添加内容、配置项目、发布项目。

## 准备条件

开始之前，请先：

1. 安装 Hugo。任何发行版（edition）都可以，但版本不能低于 v0.158.0，安装方式见[安装 Hugo](/installation/)。
2. 安装 Git。

你还需要熟悉命令行的基本操作。

## 创建项目

用下面这组命令创建新的 Hugo 项目。

### 命令

> **如果你是 Windows 用户：**
>
> - 不要使用命令提示符（Command Prompt）
> - 不要使用 Windows PowerShell
> - 请在 PowerShell，或 WSL、Git Bash 这类 Linux 终端中执行命令
>
> PowerShell 与 Windows PowerShell 是两个不同的应用。

先确认已安装 v0.158.0 或更高版本的 Hugo：

```bash
hugo version
```

再创建使用 Ananke 主题的项目。下一小节会逐条解释这些命令。

```bash
hugo new project quickstart
cd quickstart
git init
git submodule add https://github.com/gohugo-ananke/ananke themes/ananke
echo "theme = 'ananke'" >> hugo.toml
hugo server
```

在终端显示的网址上查看站点。按 `Ctrl + C` 停止 Hugo 的开发服务器（development server）。

### 命令说明

在 `quickstart` 目录中创建项目的[项目骨架](/getting-started/directory-structure/#项目骨架project-skeleton)：

```bash
hugo new project quickstart
```

把当前目录切换到项目根目录：

```bash
cd quickstart
```

在当前目录初始化一个空的 Git 仓库：

```bash
git init
```

把 Ananke 主题克隆到 `themes` 目录，并以 Git 子模块（Git submodule）的形式加入项目：

```bash
git submodule add https://github.com/gohugo-ananke/ananke themes/ananke
```

向项目配置文件追加一行，指定当前使用的主题：

```bash
echo "theme = 'ananke'" >> hugo.toml
```

启动 Hugo 的开发服务器：

```bash
hugo server
```

按 `Ctrl + C` 停止开发服务器。

## 添加内容

向项目添加一个新页面：

```bash
hugo new content content/posts/my-first-post.md
```

Hugo 在 `content/posts` 目录中创建了这个文件，用编辑器打开它：

```markdown
+++
title = 'My First Post'
date = 2024-01-14T07:07:07+01:00
draft = true
+++
```

注意[前置元数据](/content-management/front-matter/)（front matter）中的 `draft` 为 `true`。默认情况下，构建项目时 Hugo 不会发布草稿内容。关于草稿、将来与过期内容的行为，见[基本用法](/getting-started/basic-usage/#草稿将来与过期内容)。

在正文中添加一些 Markdown，但先不要修改 `draft` 的值：

```markdown
+++
title = 'My First Post'
date = 2024-01-14T07:07:07+01:00
draft = true
+++

## 简介

这是**粗体**文字，这是*强调*文字。

访问 [Hugo](https://gohugo.io) 官网！
```

保存文件，然后启动开发服务器。下面两条命令都可以把草稿内容包含进来：

```bash
hugo server --buildDrafts
hugo server -D
```

在终端显示的网址上查看站点。继续添加和修改内容时，让开发服务器保持运行。

对内容满意后，把前置元数据中的 `draft` 改为 `false`。

> Hugo 的渲染引擎遵循 CommonMark 的 Markdown [规范](https://spec.commonmark.org/)，该组织还提供了一个由参考实现驱动的[在线测试工具](https://spec.commonmark.org/dingus/)。

## 配置项目

用编辑器打开项目根目录下的[项目配置文件](/configuration/)：

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Project'
theme = 'ananke'
```

做以下修改：

1. 设置项目的 `baseURL`。该值必须以协议开头、以斜杠结尾，如上例所示。
2. 把 `locale` 改成你所在的区域。
3. 设置项目的 `title`。

启动开发服务器查看修改效果，记得包含草稿内容：

```bash
hugo server -D
```

> 装好 Ananke 主题后，可以查看它的[文档](https://ananke-documentation.netlify.app/)与[演示站点](https://ananke-theme.netlify.app/)，了解如何配置和定制主题。

## 发布项目

这一步是_发布_（publish）项目，而不是_部署_（deploy）项目。

发布时，Hugo 会把所有构建产物渲染到项目根目录的 `public` 目录中，其中包括各个站点的 HTML 文件，以及图片、CSS、JavaScript 等资源。命令很简单：

```bash
hugo
```

要了解如何_部署_项目，请查阅[托管与部署](/host-and-deploy/)相关内容。

## 获取帮助

Hugo 的[官方论坛](https://discourse.gohugo.io/)是一个活跃的社区，用户和开发者在这里回答问题、分享经验、提供示例。搜索两万多个话题，往往就能找到答案。第一次提问前，请先阅读社区关于[如何提问](https://discourse.gohugo.io/t/requesting-help/9132)的说明。

## 其他资源

想通过书籍、视频教程等途径继续学习 Hugo，可以查阅外部的学习资源页面。
