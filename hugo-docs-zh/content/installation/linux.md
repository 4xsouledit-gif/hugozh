+++
title = "在 Linux 上安装"
linkTitle = "在 Linux 上安装"
description = "在 Linux 上通过 Snap、Homebrew、发行版仓库或源码安装 Hugo。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/installation/linux/"
+++

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

安装方法请查阅各自的文档：

- [安装 Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [安装 Go](https://go.dev/doc/install)
- [安装 Dart Sass](https://sass-lang.com/dart-sass)

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)，向下滚动到 Assets 部分。

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH` 环境变量，请查阅操作系统自身的文档。

如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

## 包管理器（package manager）

也可以用下列包管理器安装 Hugo。

### Snap

[Snap](https://snapcraft.io/) 是 Linux 上自由开源的包管理器。它可用于[大多数发行版](https://snapcraft.io/docs/installing-snapd)，snap 包安装简单，并且会自动更新。

Hugo 的 snap 包是[严格受限（strictly confined）](https://snapcraft.io/docs/snap-confinement)的：严格受限的 snap 完全隔离运行，只保留被认为始终安全的最小访问权限，因此你创建和构建的站点必须位于主目录或可移动介质中。

安装 extended 版的 Hugo：

```bash
sudo snap install hugo
```

控制自动更新：

```bash
# 关闭自动更新
sudo snap refresh --hold hugo

# 重新开启自动更新
sudo snap refresh --unhold hugo
```

控制可移动介质的访问权限：

```bash
# 允许访问可移动介质
sudo snap connect hugo:removable-media

# 撤销可移动介质访问权限
sudo snap disconnect hugo:removable-media
```

控制 SSH 密钥的访问权限：

```bash
# 允许访问 SSH 密钥
sudo snap connect hugo:ssh-keys

# 撤销 SSH 密钥访问权限
sudo snap disconnect hugo:ssh-keys
```

### Homebrew

[Homebrew](https://brew.sh/) 是 macOS 与 Linux 上自由开源的包管理器。安装 extended/deploy 版的 Hugo：

```bash
brew install hugo
```

## 发行版仓库（repository packages）

大多数 Linux 发行版都维护了常用软件的仓库。

> **说明：** 仓库中 Hugo 的版本随发行版及其版本而不同，有时并不是[最新版本](https://github.com/gohugoio/hugo/releases/latest)。
>
> 如果仓库提供的版本不满足要求，请改用其他安装方式。

### Alpine Linux

在 [Alpine Linux](https://alpinelinux.org/) 上安装 extended 版的 Hugo：

```bash
doas apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community hugo
```

### Arch Linux

[Arch Linux](https://archlinux.org/) 的衍生发行版包括 [EndeavourOS](https://endeavouros.com/)、[Garuda Linux](https://garudalinux.org/)、[Manjaro](https://manjaro.org/) 等。安装 extended 版的 Hugo：

```bash
sudo pacman -S hugo
```

### Debian

[Debian](https://www.debian.org/) 的衍生发行版包括 [elementary OS](https://elementary.io/)、[KDE neon](https://neon.kde.org/)、[Linux Lite](https://www.linuxliteos.com/)、[Linux Mint](https://linuxmint.com/)、[MX Linux](https://mxlinux.org/)、[Pop!_OS](https://pop.system76.com/)、[Ubuntu](https://ubuntu.com/)、[Zorin OS](https://zorin.com/os/) 等。安装 extended 版的 Hugo：

```bash
sudo apt install hugo
```

也可以从[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)下载 Debian 软件包。

### Exherbo

在 [Exherbo](https://www.exherbolinux.org/) 上安装 extended 版的 Hugo：

1. 把下面这行加入 `/etc/paludis/options.conf`：

    ```text
    www-apps/hugo extended
    ```

2. 用 Paludis 包管理器安装：

    ```bash
    cave resolve -x repository/heirecka
    cave resolve -x hugo
    ```

### Fedora

[Fedora](https://getfedora.org/) 的衍生发行版包括 [CentOS](https://www.centos.org/)、[Red Hat Enterprise Linux](https://www.redhat.com/) 等。安装 extended 版的 Hugo：

```bash
sudo dnf install hugo
```

### Gentoo

[Gentoo](https://www.gentoo.org/) 的衍生发行版包括 [Calculate Linux](https://www.calculate-linux.org/)、[Funtoo](https://www.funtoo.org/) 等。安装 extended 版的 Hugo：

1. 在 `/etc/portage/package.use/hugo` 中指定 `extended` [USE](https://packages.gentoo.org/packages/www-apps/hugo) 标志：

    ```text
    www-apps/hugo extended
    ```

2. 用 Portage 包管理器构建：

    ```bash
    sudo emerge www-apps/hugo
    ```

### NixOS

NixOS 发行版在其软件仓库中收录了 Hugo。安装 extended 版的 Hugo：

```bash
nix-env -iA nixos.hugo
```

### openSUSE

[openSUSE](https://www.opensuse.org/) 的衍生发行版包括 [GeckoLinux](https://geckolinux.github.io/)、[Linux Karmada](https://linuxkamarada.com/) 等。安装 extended 版的 Hugo：

```bash
sudo zypper install hugo
```

### Solus

[Solus](https://getsol.us/) 发行版在其软件仓库中收录了 Hugo。安装 extended 版的 Hugo：

```bash
sudo eopkg install hugo
```

### Void Linux

在 [Void Linux](https://voidlinux.org/) 上安装 extended 版的 Hugo：

```bash
sudo xbps-install -S hugo
```

## 从源码构建

从源码构建 Hugo 需要先安装：

1. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. [Go](https://go.dev/doc/install)，版本不低于当前 Hugo 所要求的 Go 版本

### Standard 版

构建并安装 standard 版：

```bash
CGO_ENABLED=0 go install github.com/gohugoio/hugo@latest
```

### Deploy 版

构建并安装 deploy 版：

```bash
CGO_ENABLED=0 go install -tags withdeploy github.com/gohugoio/hugo@latest
```

### Extended 版

构建并安装 extended 版，需要先安装 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)，然后执行：

```bash
CGO_ENABLED=1 go install -tags extended github.com/gohugoio/hugo@latest
```

### Extended/deploy 版

构建并安装 extended/deploy 版，需要先安装 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)，然后执行：

```bash
CGO_ENABLED=1 go install -tags extended,withdeploy github.com/gohugoio/hugo@latest
```

## 验证安装与升级

安装完成后，在终端中执行：

```bash
hugo version
```

命令会输出 Hugo 的版本、edition 与构建信息。如果提示找不到命令，说明可执行文件所在目录还没有加入 `PATH` 环境变量，请参考上面的预编译二进制步骤或查阅发行版文档。

升级方式取决于你使用的安装方式：Snap 包会自动更新，也可以用前面介绍的 `snap refresh --hold` 与 `--unhold` 控制自动更新；Homebrew 可以用 `brew upgrade hugo` 升级；发行版仓库的包用发行版自身的仓库升级命令，版本是否最新取决于该仓库；从源码构建时，重新执行对应的 `go install` 命令即可。

## 对比

| | 预编译二进制 | 包管理器 | 发行版仓库 | 从源码构建 |
| --- | :-: | :-: | :-: | :-: |
| 容易安装？ | ✓ | ✓ | ✓ | ✓ |
| 容易升级？ | ✓ | ✓ | 视情况而定 | ✓ |
| 容易降级？ | ✓ | ✓ | 视情况而定 | ✓ |
| 自动更新？ | ✗ | 视情况而定 | ✗ | ✗ |
| 可获得最新版本？ | ✓ | ✓ | 视情况而定 | ✓ |

- 包管理器降级：如果旧版本仍然保留在系统中，降级很容易。
- 自动更新：Snap 包会自动更新；Homebrew 需要额外配置。
