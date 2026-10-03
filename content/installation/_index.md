+++
title = "安装"
linkTitle = "安装"
description = "Hugo 的发行版差异、各平台安装方式、从源码构建、验证安装与升级方法，以及装不上或装错时怎么排查。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/installation/"

[params.teach]
difficulty = "入门"
time = "10–20 分钟"
prereq = [
  "一台能连外网的电脑，以及安装软件所需的权限（Windows 上 Chocolatey 需要管理员 PowerShell，Linux 上 Snap 与发行版仓库需要 `sudo`）",
  "会打开终端并输入命令。不确定该用哪个终端，先读 [快速开始](/getting-started/quick-start/) 的「第 0 步」",
]
outcomes = [
  "说清 standard、deploy、extended、extended/deploy 四个发行版（edition）的差别，并按自己的需求选定一个",
  "在 Windows、macOS、Linux 或 BSD 上把 Hugo 装好，并知道它装到了哪个目录、终端为什么能找到 `hugo`",
  "用 `hugo version` 判断安装是否成功、装的是不是 extended 版",
  "安装出问题时，按「命令找不到 / 没报错但结果不对 / 报错看不懂」三类分别定位",
]
next = ["/getting-started/quick-start/", "/getting-started/basic-usage/"]

+++

Hugo 是单个可执行文件，没有运行时依赖。你可以下载预编译的二进制文件，也可以用系统包管理器安装，或者从源码构建。

安装本身通常只要几分钟，真正的卡点只有两个：**装错了发行版（edition）**，以及**装好了但终端找不到 `hugo` 命令**。本章先把 edition 的差别讲清楚，再给出各平台的完整路径与验证方法。

本站文档按 Hugo **v0.167** 校对；站点配置要求 **v0.158 或更高**，标准版即可（不依赖 extended），详见[配置](/configuration/)。

## 读完本章你应该能够

- 说清 standard、deploy、extended、extended/deploy 四个 edition 的差别，并按自己的需求选定一个；
- 在自己的系统上装好 Hugo，并知道它装到了哪个目录、终端为什么能找到（或找不到）`hugo`；
- 用 `hugo version` 判断安装是否成功、装的是不是 extended 版；
- 安装出问题时，按「命令找不到 / 没报错但结果不对 / 报错看不懂」三类分别定位，并知道去哪里继续查。

## 阅读顺序

1. **先在本页决定装哪个 edition**（下一节）——这一步决定后面所有命令；
2. **按你的系统选一页照做**：[在 Linux 上安装](/installation/linux/)、[在 macOS 上安装](/installation/macos/)、[在 Windows 上安装](/installation/windows/)、[在 BSD 上安装](/installation/bsd/)；
3. **回到本页「验证安装」一节确认成功**——只有 `hugo version` 打印出版本号，才算装好；
4. **装完立刻跑通一个站点**：[快速开始](/getting-started/quick-start/)。

Windows 用户建议直接读[在 Windows 上安装](/installation/windows/)：那一页把 `PATH`、Winget/Chocolatey/Scoop 和 extended 版的选择单独展开了，本页只讲各平台共性的部分。

## 发行版（edition）

Hugo 提供多个发行版（edition）。除非需要额外功能，否则使用 standard 版即可。

| 特性 | standard | deploy (1) | extended | extended/deploy |
| --- | :-: | :-: | :-: | :-: |
| 核心功能 | ✓ | ✓ | ✓ | ✓ |
| 直接部署到云端 (2) | ✗ | ✓ | ✗ | ✓ |
| LibSass 支持 (3) | ✗ | ✗ | ✓ | ✓ |

1. deploy 版自 v0.159.2 起提供。
2. 把站点直接部署到 Google Cloud Storage 存储桶、AWS S3 存储桶或 Azure Storage 容器，详见[用 hugo deploy 部署](/host-and-deploy/deploy-with-hugo-deploy/)。
3. 通过内置的 LibSass 把 Sass 转译为 CSS。内置 LibSass 已在 v0.153.0 中弃用，并将在未来版本中移除，请改用任何 edition 都可用的 Dart Sass 转译器。

这张表是本章最该花时间看的部分。换成「你打算做什么」的说法：

| 你的情况 | 选它 | 原因 |
| --- | --- | --- |
| 做普通站点，用官方安装方式装 | **standard** | 核心功能齐全，体积最小；本站文档站本身就只用标准版 |
| 可能会执行 `hugo deploy`，把站点直接推到云存储 | **deploy** | 云部署能力只在 deploy 系列里 |
| 主题或模板用 `css.Sass` 的 **LibSass** 转译器转译 Sass | **extended** | LibSass 只在 extended 系列里 |
| 上面两项都要 | **extended/deploy** | 两者的并集 |

**为什么可以先选 standard**：内置 LibSass 已经弃用（上表第 3 条），官方推荐改用 [Dart Sass](/functions/css/sass/) 转译器，而 Dart Sass 在任何 edition 下都能工作。但要注意两点后果：

- 如果主题里写死了 LibSass，standard 版会在构建时报错，错误信息是 `this feature is not available in this edition of Hugo`；
- 换 edition 不是改个配置就行，需要重新安装。

**怎么确认自己装的是哪个 edition**：`hugo version` 的输出里，扩展版会带 `+extended` 标记。实测本机输出为：

```text
hugo v0.167.0-3fff6fb5c267dacb26280c78dbe8c344054249c8+extended windows/amd64 BuildDate=2026-09-28T14:50:38Z VendorInfo=gohugoio
```

标准版的同一行没有 `+extended` 这一段。实测用 `winget` 查看包信息时，扩展版的包描述也写明它多了两项能力：编码 WebP 图片（标准版只能解码），以及使用内嵌的 LibSass 转译器。更完整的说明见 [hugo version](/commands/hugo-version/)。

## 前置依赖（prerequisites）

Git、Go、Dart Sass 在 Hugo 的日常使用中很常见，但并非所有场景都需要。

Git 用于：

- 从源码构建 Hugo
- 使用 [Hugo 模块](/hugo-modules/)
- 以 Git 子模块（Git submodule）方式安装主题
- 从本地 Git 仓库获取提交信息
- 把站点托管到 Cloudflare、GitHub Pages、GitLab Pages、Netlify、Render、Vercel 等 CI/CD（持续集成与持续交付）平台，详见[托管与部署](/host-and-deploy/)

Go 用于：

- 从源码构建 Hugo
- 使用 Hugo 模块

使用 Sass 语言的最新特性时，需要用 Dart Sass 把 Sass 转译为 CSS。

**哪些可以暂时不装**：只下载预编译二进制、只用 `hugo` 命令构建、主题也直接放在 `themes/` 目录里的话，Git、Go、Dart Sass 都可以先不装。反过来，只要你打算用 [Hugo 模块](/hugo-modules/)（很多现代主题的推荐安装方式），Git 和 Go 就必须装——这是本节存在的原因。

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)，向下滚动到 Assets 部分：

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH`，请查阅操作系统自身的文档。如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

这条路径没有任何安装程序，全部靠手动，所以有两个具体提示：

- **压缩包文件名怎么读**：文件名里依次包含 edition、版本号、操作系统与架构（Windows 上是 `.zip`，macOS、Linux、BSD 通常是 `.tar.gz`）。**只有文件名里带 `extended` 的才是扩展版**；解压后得到的可执行文件在 Windows 上是 `hugo.exe`，其它平台是 `hugo`。
- **第 4 步是最容易漏的一步**：不写 `PATH`，下一步的 `hugo version` 就会报「找不到命令」。目标目录建议用一个长期存在的固定路径（例如 Windows 的 `C:\Hugo\bin`、macOS/Linux 的 `~/bin` 或 `/usr/local/bin`），不要放在「下载」目录里。

各平台的 `PATH` 改法与验证命令，见对应平台页。

## 包管理器（package manager）

### macOS 与 Linux：Homebrew

Homebrew 是 macOS 与 Linux 上的包管理器，它安装的是 extended/deploy 版：

```bash
brew install hugo
```

### macOS：MacPorts

MacPorts 安装的是 extended 版：

```bash
sudo port install hugo
```

### Windows

Hugo 要求 Windows 10、Windows Server 2016 或更高版本。

Chocolatey 与 Scoop 安装的都是 extended 版：

```bash
choco install hugo-extended
scoop install hugo-extended
```

Winget 是微软官方的包管理器：

```bash
winget install Hugo.Hugo.Extended
winget uninstall --name "Hugo (Extended)"
```

### Linux：Snap

Snap 安装的是 extended 版，并且会自动更新：

```bash
sudo snap install hugo
```

Hugo 的 snap 包是严格受限（strictly confined）的：严格受限的 snap 完全隔离运行，只保留被认为始终安全的最小访问权限，因此你创建和构建的站点必须位于主目录或可移动介质中。

```bash
# 关闭自动更新
sudo snap refresh --hold hugo

# 重新开启自动更新
sudo snap refresh --unhold hugo

# 允许访问可移动介质
sudo snap connect hugo:removable-media

# 撤销可移动介质访问权限
sudo snap disconnect hugo:removable-media

# 允许访问 SSH 密钥
sudo snap connect hugo:ssh-keys

# 撤销 SSH 密钥访问权限
sudo snap disconnect hugo:ssh-keys
```

### Linux：发行版仓库

大多数 Linux 发行版都维护了常用软件的仓库。仓库中 Hugo 的版本随发行版及其版本而不同，有时并不是最新版本；如果仓库提供的版本不满足要求，请改用其他安装方式。

```bash
# Alpine Linux
doas apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community hugo

# Arch Linux 及其衍生版
sudo pacman -S hugo

# Debian 及其衍生版
sudo apt install hugo

# Fedora 及其衍生版
sudo dnf install hugo

# NixOS
nix-env -iA nixos.hugo

# openSUSE 及其衍生版
sudo zypper install hugo

# Solus
sudo eopkg install hugo

# Void Linux
sudo xbps-install -S hugo
```

Debian 用户也可以从最新发布页面下载 Deb 包。

Gentoo 与 Exherbo 需要先声明 `extended` 标记：Gentoo 在 `/etc/portage/package.use/hugo` 中写入 `www-apps/hugo extended`，然后执行 `sudo emerge www-apps/hugo`；Exherbo 在 `/etc/paludis/options.conf` 中写入 `www-apps/hugo extended`，再用 Paludis 的 `cave resolve -x repository/heirecka` 与 `cave resolve -x hugo` 安装。

### BSD：仓库包

多数 BSD 衍生版也维护了各自的仓库，其中的版本可能不是最新发布版本。

```bash
# DragonFly BSD 与 FreeBSD
sudo pkg install gohugo

# NetBSD
sudo pkgin install go-hugo

# OpenBSD，安装时会提示选择 edition
doas pkg_add hugo
```

## 从源码构建（build from source）

从源码构建需要先安装 Git 和 Go，Go 的版本需为最新的稳定版本或更新。

```bash
# standard 版
CGO_ENABLED=0 go install github.com/gohugoio/hugo@latest

# deploy 版，自 v0.159.2 起提供
CGO_ENABLED=0 go install -tags withdeploy github.com/gohugoio/hugo@latest

# extended 版，需先安装 GCC 或 Clang 等 C 编译器
CGO_ENABLED=1 go install -tags extended github.com/gohugoio/hugo@latest

# extended/deploy 版，同样需要 C 编译器
CGO_ENABLED=1 go install -tags extended,withdeploy github.com/gohugoio/hugo@latest
```

Windows 上不能使用上面这种 Bash 风格的 `KEY=VALUE 命令` 写法：在 PowerShell 中应写成 `$env:CGO_ENABLED=0; go install ...`，在命令提示符中则要先执行 `set CGO_ENABLED=0`，再单独执行 `go install`。

走这条路径的人最常遇到的不是构建失败，而是**构建成功却仍然找不到命令**：`go install` 把二进制写进 Go 的 bin 目录（用 `go env GOPATH` 查看 GOPATH，其下的 `bin` 就是目标目录），而这个目录默认不在 `PATH` 里。构建完成后先看 `go env GOPATH` 打印到哪里，再把它下面的 `bin` 加入 `PATH`。

## 验证安装

```bash
hugo version
```

能打印出版本号即安装成功。也可以用 `hugo help` 查看全部可用命令。

**你应当看到什么**：一行以 `hugo v` 开头的输出，包含版本号、edition 标记与平台信息（实测本机）：

```text
hugo v0.167.0-3fff6fb5c267dacb26280c78dbe8c344054249c8+extended windows/amd64 BuildDate=2026-09-28T14:50:38Z VendorInfo=gohugoio
```

拆开看三件事：`v0.167.0` 是版本号；带 `+extended` 说明是扩展版；`windows/amd64` 是平台与架构。版本号不低于 v0.158 即可满足本站文档的要求。

反过来，出现下面两种输出都说明**还没装好**，不要继续往下做：

- `hugo: command not found`、`'hugo' 不是内部或外部命令`、`无法将"hugo"项识别为 cmdlet`——命令不在 `PATH` 里；
- 打印出的版本号比你刚装的旧——系统里有多份 Hugo，`PATH` 里靠前的那份先被找到。

需要把环境信息贴给别人时，用 `hugo env`（见 [hugo env](/commands/hugo-env/)）；它比 `hugo version` 多输出配置与环境变量。

## 安装方式对比

| 关注点 | 预编译二进制 | 包管理器 | 发行版仓库 | 从源码构建 |
| --- | :-: | :-: | :-: | :-: |
| 安装容易 | ✓ | ✓ | ✓ | ✓ |
| 升级容易 | ✓ | ✓ | 视情况 | ✓ |
| 降级容易 | ✓ | ✓ | 视情况 | ✓ |
| 自动更新 | ✗ | 视情况 | ✗ | ✗ |
| 可获得最新版本 | ✓ | ✓ | 视情况 | ✓ |

包管理器中的 Snap 会自动更新，Homebrew 需要额外配置；当旧版本仍保留在系统中时，降级会更容易。

**升级**：Snap 自动更新，也可以用 `snap refresh --hold` / `--unhold` 控制；Homebrew 用 `brew upgrade hugo`；Windows 上 Winget、Chocolatey、Scoop 分别用 `winget upgrade Hugo.Hugo.Extended`、`choco upgrade hugo-extended`、`scoop update hugo-extended`；发行版仓库的包用发行版自身的升级命令；从源码构建则重新执行对应的 `go install`。

## 常见坑

先按现象定位，再动手：

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `command not found` / `不是内部或外部命令` | 二进制目录没进 `PATH`；或改了 `PATH` 但没重开终端 | 用 `where.exe hugo`（Windows）或 `which -a hugo`（macOS/Linux/BSD）确认二进制位置；按平台页把目录写进 `PATH` 后**重开终端** |
| 命令能跑，但版本或 edition 不是刚装的那个 | 系统里装了多份 Hugo，`PATH` 里靠前的那份先被找到 | 用 `where.exe hugo` / `which -a hugo` 列出全部，卸载多余的那份 |
| 构建时报 `this feature is not available in this edition of Hugo` | 用了当前 edition 不提供的功能（例如在 standard 版上用 LibSass） | 换装 extended 版，或改用 [Dart Sass](/functions/css/sass/)；原因见[常见问题](/troubleshooting/faq/) |
| 发行版仓库装完发现版本很旧 | 发行版仓库的版本常落后于[最新发布](https://github.com/gohugoio/hugo/releases/latest) | 改用 Homebrew、Snap、预编译二进制或从源码构建 |
| 从源码构建成功，`hugo` 仍找不到 | `go install` 写进了 `$(go env GOPATH)/bin`，该目录不在 `PATH` | 把 `go env GOPATH` 下的 `bin` 加入 `PATH` |

其余构建与渲染类问题见[故障排查](/troubleshooting/)；向他人求助时附上 `hugo version` 与 `hugo env` 的输出、完整报错和最小复现项目，会快得多。
