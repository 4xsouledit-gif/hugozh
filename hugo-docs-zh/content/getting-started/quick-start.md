+++
title = "快速开始"
linkTitle = "快速开始"
description = "手把手从零跑通第一个 Hugo 站点：装好环境、创建项目、写第一篇内容、在浏览器里看到它，最后发布成静态文件。每一步都给验证方法。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/getting-started/quick-start/"

[params.teach]
difficulty = "入门"
time = "15–20 分钟"
prereq = [
  "一台电脑，以及**管理员的耐心**——第一次安装需要改动系统设置（Windows 需要配置环境变量，macOS 需要确认安全提示）。",
  "会打开终端并输入命令。若从没接触过命令行，请先读下面「第 0 步」，那里把每一类命令都解释了一遍。",
  "能连外网。本教程要克隆一个主题仓库；离线环境请改读 [安装 Hugo](/installation/) 的选择。",
]
outcomes = [
  "在自己的操作系统上确认 Hugo 可用、版本不低于 **v0.158.0**；",
  "用 `hugo new project` 生成一个完整项目骨架，并启动开发服务器在浏览器里看到页面；",
  "写出一篇带前置元数据（front matter）的文章，并理解 `draft` 为什么会让它不显示；",
  "把站点渲染成 `public/` 目录下的静态文件，知道接下来该去读哪几页。",
]
next = ["/installation/", "/getting-started/basic-usage/", "/getting-started/directory-structure/"]

+++

这一页的目标只有一个：**让你在半小时内，在自己电脑上真正跑起来一个 Hugo 站点**，而不是读完一堆概念。走完之后你会有一个能看的本地站点、一篇自己写的文章，以及一个可以上传到任何静态托管平台的 `public/` 目录。

本页只走主线。想要「为什么」的读者，每完成一步后面都给了对应章节的入口；想先了解 Hugo 是什么，可以看[简介](/about/introduction/)。

## 第 0 步：先把环境这件事说清楚

这一步不算在「四件事」里，但它决定了后面会不会卡住。**跳过这一步，是新手最常见的第一处卡点。**

### 先确认终端能跑起来

后面的命令都要在**终端**里执行。按你的系统打开它：

| 系统 | 打开方式 | 说明 |
| --- | --- | --- |
| Windows | 开始菜单搜索 **PowerShell**，打开名为「PowerShell 7」或「PowerShell」的那个应用 | 见下方「Windows 用户的坑」 |
| macOS | `Command + 空格`，输入 `Terminal` 回车 | 系统自带，无需安装 |
| Linux | `Ctrl + Alt + T`，或在应用列表里找「终端」 | 各发行版略有差异 |

### Windows 用户的坑：别用「Windows PowerShell」

Windows 上叫「PowerShell」的应用其实有**两个**，它们不是同一个软件：

- **PowerShell 7**（应用名 `PowerShell`，命令是 `pwsh`）：本教程命令可以直接用；
- **Windows PowerShell 5.1**（应用名 `Windows PowerShell`，命令是 `powershell`）：**不要用它执行本教程的命令**。

原因不是风格问题，而是它会**把配置文件写坏**。本教程里有一句给项目配置追加主题的命令：

```powershell
echo "theme = 'ananke'" >> hugo.toml
```

在 Windows PowerShell 5.1 里，`>>` 重定向默认写 **UTF-16LE 编码并带 BOM**。写入后 Hugo 读这个文件会直接报错：

```text
ERROR failed to load config: "…/hugo.toml:1:1": unmarshal failed:
toml: invalid character at start of key: U+00FF 'ÿ'
```

这句报错会让人以为是 Hugo 坏了或者语法写错了，其实是**编码**问题——文件开头多了两个字节 `FF FE`，TOML 解析器不认。

要确认自己用的是哪个，在终端里看提示符前面有没有 `PS` 无所谓，直接查版本：

```powershell
$PSVersionTable.PSVersion
```

- 输出 `Major` 为 **7** 或更高 → 可以直接用本教程命令；
- 输出 `Major` 为 **5.1** → 换用 PowerShell 7，或者用 **WSL / Git Bash** 等 Linux 终端。

> **不想装 PowerShell 7 也行**：把那句 `echo … >>` 换成用编辑器手动打开 `hugo.toml`，在文件末尾加一行 `theme = 'ananke'`，效果完全相同。这是本教程里唯一需要 shell 重定向的地方。

### 确认 Hugo 已安装

先安装 Hugo（**任何发行版都可以，但版本不能低于 v0.158.0**）：

- Windows / macOS / Linux 各平台的安装方式，见[安装 Hugo](/installation/)；
- 只想最省事：macOS 用 `brew install hugo`，Windows 用 `winget install Hugo.Hugo.Extended`，Linux 用发行版包管理器或去[发布页](https://github.com/gohugoio/hugo/releases)下载对应压缩包。

然后在这里验证。**这是第一个检查点**：

```bash
hugo version
```

你应当看到类似输出（版本号 ≥ v0.158.0 即可）：

```text
hugo v0.167.0+extended windows/amd64 ...
```

看到 `command not found` 或「不是内部或外部命令」，说明 Hugo 没装好，或者装了但没进 `PATH`：回到[安装 Hugo](/installation/) 按平台步骤重做，**不要带着这个问题往下走**。

### 确认 Git 已安装

本教程用 Git 来拉取主题：

```bash
git --version
```

同样，报错就先装 Git（[git-scm.com](https://git-scm.com/downloads)）。

## 第 1 步：创建项目

三条命令，先跑再解释。**记得用上面确认过的终端。**

```bash
hugo new project quickstart
cd quickstart
git init
git submodule add https://github.com/gohugo-ananke/ananke themes/ananke
echo "theme = 'ananke'" >> hugo.toml
hugo server
```

在终端最后一行会打印一个本地网址（通常是 `http://localhost:1313/`）。**用浏览器打开它**——你应该看到一个已经成型的站点，有首页、有示例导航。这就是 Hugo 的**开发服务器（development server）**：它监视文件变化并自动刷新页面。

按 `Ctrl + C` 停止开发服务器。

### 逐条解释这几条命令

**① 生成项目骨架**

```bash
hugo new project quickstart
```

在 `quickstart` 目录里创建[项目骨架](/getting-started/directory-structure/#项目骨架project-skeleton)：一份 `hugo.toml` 配置、`content/`、`layouts/`、`assets/` 等目录，以及一篇示例首页内容。**它不包含主题**——这是下一步要做的事。

**② 进入项目目录**

```bash
cd quickstart
```

`cd` 是 change directory。后面的命令都必须在**项目根目录**下执行；忘了这一步，Hugo 会找不到 `hugo.toml`，构建出一个空站点（而且**不报错**）。

**③ 初始化 Git 仓库**

```bash
git init
```

**④ 以 Git 子模块方式加入主题**

```bash
git submodule add https://github.com/gohugo-ananke/ananke themes/ananke
```

把 Ananke 主题克隆到 `themes/ananke`，并在 `.gitmodules` 里登记为子模块。选子模块而不是直接复制，是为了让主题跟着上游更新。**这一步需要联网。**

> 嫌子模块麻烦（比如不打算用 Git 管理站点），可以把 `git submodule add …` 换成 `git clone https://github.com/gohugo-ananke/ananke themes/ananke`，效果对构建而言一样。

**⑤ 告诉 Hugo 用哪个主题**

```bash
echo "theme = 'ananke'" >> hugo.toml
```

向 `hugo.toml` 末尾追加一行主题声明。**Windows 用户务必用第 0 步确认过的终端**。

**⑥ 启动开发服务器**

```bash
hugo server
```

Hugo 在这里做了一次完整构建，然后起了一个本地 HTTP 服务并开始监视文件。终端会打印站点地址与页面数量；地址就是你要在浏览器里打开的。

### 这一步的验证标准

- 浏览器打开 `http://localhost:1313/` 能看到站点首页与主题自带的示例文章；
- 终端里没有 `ERROR` 字样；
- 在浏览器里改一下地址，站点还有别的页面（例如主题自带的 `About`）。

三者都满足才继续。**只有第一条满足但终端有报错**，请把报错贴到[官方论坛中文分类](https://discourse.gohugo.io/c/chinese/42) 或先查[故障排查](/troubleshooting/)。

## 第 2 步：添加你的第一篇内容

保持开发服务器运行，**另开一个终端窗口**（同一个窗口里按 `Ctrl + C` 会把服务器停掉），进入项目目录：

```bash
hugo new content content/posts/my-first-post.md
```

Hugo 会在 `content/posts/` 下创建这个文件。用任意编辑器打开它，内容大致是：

```markdown
+++
title = 'My First Post'
date = 2024-01-14T07:07:07+01:00
draft = true
+++
```

顶部用 `+++` 包起来的是[前置元数据](/content-management/front-matter/)（front matter）：Hugo 用它描述页面，而不是把它渲染成正文。三个字段的含义分别是：

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `date` | 发布日期 |
| `draft` | `true` 表示这是**草稿**，正式构建时不发布 |

### 为什么你的文章「不见了」

`draft = true` 是新手遇到的第二处卡点：写完文章、刷新浏览器，**文章不在列表里**。这不是出错，而是 Hugo 的默认策略——草稿不发布。

两个选择：

```bash
hugo server -D            # 连同草稿一起预览（-D 是 --buildDrafts 的简写）
hugo server --buildDrafts # 与上一行完全等价
```

内容定稿后，把 `draft` 改成 `false`，它就会出现在正式构建中。草稿、定时发布（`publishDate`）、过期内容（`expiryDate`）的完整规则见[基本用法](/getting-started/basic-usage/#草稿将来与过期内容)。

### 给文章写点正文

在第二个 `+++` 下面接着写 Markdown：

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

保存文件后浏览器会自动刷新（开发服务器在监视文件）。**这里要注意**：正文标题用 `##`，不用 `#`——`#` 一级标题由页面自身承担，重复写会出现两个 `<h1>`。

> Markdown 的解析遵循 [CommonMark 规范](https://spec.commonmark.org/)；拿不准某种写法会渲染成什么时，可以用官方的[在线测试工具](https://spec.commonmark.org/dingus/)先试。

### 这一步的验证标准

- `hugo server -D` 之后，浏览器里能看到 `My First Post` 这篇文章；
- `hugo server`（不带 `-D`）之后，它**不出现**——这恰好证明草稿规则生效了。

## 第 3 步：配置项目

用编辑器打开项目根目录下的[项目配置文件](/configuration/) `hugo.toml`：

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Project'
theme = 'ananke'
```

改三处：

1. **`baseURL`** —— 将来站点的正式地址。必须是**协议开头、斜杠结尾**（`https://example.org/`），否则 RSS、站点地图和站内绝对链接会指向错误位置。
2. **`locale`** —— 你的区域，例如简体中文写 `zh-cn`。它影响日期与数字的本地化格式。
3. **`title`** —— 站点标题，会出现在浏览器标签与主题页头。

改完重新预览（记得带草稿）：

```bash
hugo server -D
```

> 配置键很多，但**不要一次改一堆**。先让站点跑起来，再按需到[配置](/configuration/)里逐项查。改了配置不生效时，先确认改的是**项目根目录**下的 `hugo.toml`。
>
> 想了解主题自己的可配置项，看 Ananke 的[文档](https://ananke-documentation.netlify.app/)与[演示站点](https://ananke-theme.netlify.app/)。

## 第 4 步：发布（生成静态文件）

注意区分两个词：这一步是**发布**（publish），不是**部署**（deploy）。发布是把源码渲染成静态文件，部署是把这些文件送到服务器或托管平台上。

```bash
hugo
```

Hugo 会把全部产物写进项目根目录的 `public/`：每个页面的 HTML，以及图片、CSS、JavaScript 等资源。**`public/` 就是可以原样上传的成品**。

两个常见疑问：

- **`public/` 要不要提交进 Git？** 不要。它是构建产物，加进 `.gitignore` 即可。
- **构建时刷新了草稿？** 检查是否还有 `draft = true` 的页面。默认 `hugo` 不包含草稿。

发布完成后，`public/` 里应当有 `index.html`。本地想验证成品，可以用任意静态服务器打开它，例如：

```bash
hugo server --renderToMemory   # 或者简单地重新用 hugo server 预览
```

要真正**部署**到线上，见[托管与部署](/host-and-deploy/)。

## 卡住了怎么办

按现象查最快的入口：

| 现象 | 先查这里 |
| --- | --- |
| `hugo: command not found` / 不是内部或外部命令 | Hugo 没进 `PATH` → [安装 Hugo](/installation/) 对应平台小节 |
| `unmarshal failed: toml: invalid character at start of key: U+00FF` | 配置被写成了 UTF-16 → 回到本页「Windows 用户的坑」 |
| 页面数突然变成 0 或很少，且没有报错 | 不在项目根目录执行，或 `theme` 没生效 → 见[目录结构](/getting-started/directory-structure/)与[故障排查](/troubleshooting/) |
| 站点没有样式，页面像纯文本 | 主题没装好或 `theme` 写错 → 检查 `themes/ananke` 是否存在 |
| 文章不显示 | `draft = true` → 用 `hugo server -D`，或把 `draft` 改成 `false` |
| 构建报「短代码未闭合」但内容里明明没有短代码 | 看[疑难解答](/troubleshooting/)中关于短代码占位符的条目 |

提问时请附上 `hugo version` 的输出、完整报错，以及能复现问题的最小项目结构——这会显著提高被解答的速度。中文用户可以去[官方论坛的中文分类](https://discourse.gohugo.io/c/chinese/42)，其余分类有两万多个主题可直接搜索。

## 接下来读什么

到这里主线已经跑完。按你下一步想做的事选：

1. **想搞清楚刚生成的目录各自是干什么的** → [目录结构](/getting-started/directory-structure/)（排查「文件放错地方」类问题的第一站）；
2. **想让站点按自己的需求构建、预览** → [基本用法](/getting-started/basic-usage/)；
3. **想改外观、自己写模板** → [模板](/templates/) 与[渲染钩子](/render-hooks/)；
4. **想用现成主题** → [Hugo 模块](/hugo-modules/)与[工具](/tools/)；
5. **想发布到线上** → [托管与部署](/host-and-deploy/)。
