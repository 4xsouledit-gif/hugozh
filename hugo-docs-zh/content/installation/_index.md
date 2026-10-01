+++
title = "安装"
linkTitle = "安装"
description = "Hugo 的发行版差异、各平台安装方式、从源码构建、验证安装与升级方法。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/installation/"
+++

Hugo 是单个可执行文件，没有运行时依赖。你可以下载预编译的二进制文件，也可以用系统包管理器安装，或者从源码构建。

## 发行版（edition）

Hugo 提供多个发行版（edition）。除非需要额外功能，否则使用 standard 版即可。

| 特性 | standard | deploy (1) | extended | extended/deploy |
| --- | :-: | :-: | :-: | :-: |
| 核心功能 | ✓ | ✓ | ✓ | ✓ |
| 直接部署到云端 (2) | ✗ | ✓ | ✗ | ✓ |
| LibSass 支持 (3) | ✗ | ✗ | ✓ | ✓ |

1. deploy 版自 v0.159.2 起提供。
2. 把站点直接部署到 Google Cloud Storage 存储桶、AWS S3 存储桶或 Azure Storage 容器。
3. 通过内置的 LibSass 把 Sass 转译为 CSS。内置 LibSass 已在 v0.153.0 中弃用，并将在未来版本中移除，请改用任何 edition 都可用的 Dart Sass 转译器。

## 前置依赖（prerequisites）

Git、Go、Dart Sass 在 Hugo 的日常使用中很常见，但并非所有场景都需要。

Git 用于：

- 从源码构建 Hugo
- 使用 Hugo 模块（Hugo modules）
- 以 Git 子模块（Git submodule）方式安装主题
- 从本地 Git 仓库获取提交信息
- 把站点托管到 Cloudflare、GitHub Pages、GitLab Pages、Netlify、Render、Vercel 等 CI/CD（持续集成与持续交付）平台

Go 用于：

- 从源码构建 Hugo
- 使用 Hugo 模块

使用 Sass 语言的最新特性时，需要用 Dart Sass 把 Sass 转译为 CSS。

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的最新发布页面，向下滚动到 Assets 部分：

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH`，请查阅操作系统自身的文档。如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

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

## 验证安装

```bash
hugo version
```

能打印出版本号即安装成功。也可以用 `hugo help` 查看全部可用命令。

## 安装方式对比

| 关注点 | 预编译二进制 | 包管理器 | 发行版仓库 | 从源码构建 |
| --- | :-: | :-: | :-: | :-: |
| 安装容易 | ✓ | ✓ | ✓ | ✓ |
| 升级容易 | ✓ | ✓ | 视情况 | ✓ |
| 降级容易 | ✓ | ✓ | 视情况 | ✓ |
| 自动更新 | ✗ | 视情况 | ✗ | ✗ |
| 可获得最新版本 | ✓ | ✓ | 视情况 | ✓ |

包管理器中的 Snap 会自动更新，Homebrew 需要额外配置；当旧版本仍保留在系统中时，降级会更容易。
