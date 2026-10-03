+++
title = "在 BSD 上安装"
linkTitle = "在 BSD 上安装"
description = "在 DragonFly BSD、FreeBSD、NetBSD、OpenBSD 上通过仓库包、预编译二进制或源码安装 Hugo。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/installation/bsd/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "一台 BSD 衍生系统（DragonFly BSD、FreeBSD、NetBSD 或 OpenBSD）",
  "会用该系统的包管理命令，并具备 `sudo`（OpenBSD 上是 `doas`）权限",
  "能连外网；仓库同步与从源码构建都需要网络",
]
outcomes = [
  "用仓库包、预编译二进制或源码四条路径之一装好 Hugo",
  "知道各 BSD 的包管理命令与提示差异（`pkg` / `pkgin` / `pkg_add`，OpenBSD 会先问你选哪个 edition）",
  "用 `hugo version` 确认版本与 edition，并判断仓库里的版本是否够新",
  "命令找不到时按 `PATH` 与实际执行的二进制两步定位",
]
next = ["/installation/", "/getting-started/quick-start/", "/troubleshooting/faq/"]

+++

BSD 上的安装路径和 Linux 类似，但每个系统的包管理命令各不相同，而且**仓库里的版本往往落后于官方发布**。这一页把四条 BSD 的命令集中列出来，并说明版本落后时怎么换路径。

## 先选路线

| 方式 | 装的是哪个 edition | 版本新旧 | 说明 |
| --- | --- | --- | --- |
| **仓库包** | extended（OpenBSD 由你选择） | 常落后 | 一条命令装完，最简单 |
| **预编译二进制** | 自己指定 | 最新 | 官方发布页提供 BSD 平台的压缩包 |
| **从源码构建** | 自己指定 | 最新 | 需要先装 Git 与 Go |

装之前不妨先看仓库里是哪个版本（不同系统的查询命令不同，见下节各小节）。**会怎样**：版本过低时，本站文档里较新的配置键与模板函数可能不可用；此时改用预编译二进制或从源码构建。

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

**会怎样**：edition 选错时构建直接失败，错误信息是 `this feature is not available in this edition of Hugo`（例如用 standard 版构建依赖 LibSass 的主题）；换装 extended 版，或改用 [Dart Sass](/functions/css/sass/) 即可，原因见[常见问题](/troubleshooting/faq/)。

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

**哪些可以暂时不装**：只用仓库包或预编译二进制、且不打算用 [Hugo 模块](/hugo-modules/)时，Git、Go、Dart Sass 都可以先不装。仓库里通常也能装到 Git 与 Go（各系统的包名以仓库为准）。

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)，向下滚动到 Assets 部分。

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH` 环境变量，请查阅操作系统自身的文档。

如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

BSD 上的具体做法与 Linux 相同：下载 `freebsd-amd64`、`openbsd-amd64`、`netbsd-amd64` 一类的 `.tar.gz`（**文件名里带 `extended` 的才是扩展版**），解压后把 `hugo` 放到 `/usr/local/bin` 并确保它有执行权限：

```bash
tar -xzf hugo_extended_*_freebsd-amd64.tar.gz
sudo install -m 755 hugo /usr/local/bin/hugo
```

`/usr/local/bin` 通常已在 `PATH` 中；若放到别处（例如 `~/bin`），需要自己把该目录写进 shell 启动文件并重开终端。

## 发行版仓库（repository packages）

大多数 BSD 衍生系统都维护了常用软件的仓库。请注意，这些仓库中可能不是[最新版本](https://github.com/gohugoio/hugo/releases/latest)。

### DragonFly BSD

[DragonFly BSD](https://www.dragonflybsd.org/) 在其软件仓库中收录了 Hugo。安装 extended 版的 Hugo：

```bash
sudo pkg install gohugo
```

### FreeBSD

[FreeBSD](https://www.freebsd.org/) 在其软件仓库中收录了 Hugo。安装 extended 版的 Hugo：

```bash
sudo pkg install gohugo
```

首次使用 `pkg` 时，FreeBSD 会提示安装 `pkg` 自身（会要求确认一次），按提示继续即可。想先看仓库里的版本，用 `pkg search hugo` 或 `pkg info hugo`。

### NetBSD

[NetBSD](https://www.netbsd.org/) 在其软件仓库中收录了 Hugo。安装 extended 版的 Hugo：

```bash
sudo pkgin install go-hugo
```

### OpenBSD

[OpenBSD](https://www.openbsd.org/) 在其软件仓库中收录了 Hugo。执行下面的命令后，会提示你选择要安装的 Hugo edition：

```bash
doas pkg_add hugo
```

**注意**：OpenBSD 用 `doas` 而不是 `sudo`（`sudo` 默认没有安装）；提示选择 edition 时要看清再输入，选错了就得卸载重装。

## 从源码构建

从源码构建 Hugo 需要先安装：

1. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. [Go](https://go.dev/doc/install)，版本不低于当前 Hugo 所要求的 Go 版本

`go install` 把二进制写进 Go 的 bin 目录，而这个目录**默认不在 `PATH` 里**，所以「构建成功、命令找不到」是这条路径最常见的现象：

```bash
go env GOPATH                    # 典型结果是 /home/you/go
export PATH="$PATH:$(go env GOPATH)/bin"
```

把 `export` 那行加进 shell 启动文件，重开终端即可长期生效。

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

FreeBSD 与 OpenBSD 的 base 系统自带 `clang`，NetBSD 自带 `gcc`，所以 `CGO_ENABLED=1` 的两条命令通常可以直接跑；报错里出现 `cgo`、`gcc`、`clang` 或「executable file not found」时，说明编译器不在 `PATH` 中，先装好编译器或改用 `CGO_ENABLED=0` 构建 standard 或 deploy 版。

## 验证安装与升级

安装完成后，在终端中执行：

```bash
hugo version
```

命令会输出 Hugo 的版本、edition 与构建信息。如果提示找不到命令，说明可执行文件所在目录还没有加入 `PATH` 环境变量，请参考上面的预编译二进制步骤或查阅系统文档。

**你应当看到什么**：

```text
hugo v0.167.0+extended freebsd/amd64 BuildDate=... VendorInfo=gohugoio
```

- 以 `hugo v` 开头、版本号不低于 v0.158，即满足本站文档的要求；
- 带 `+extended` 说明是扩展版；标准版没有这一段；
- 平台字段应当与你的系统与架构一致（`freebsd`、`openbsd`、`netbsd`、`dragonfly`）。

再执行一次 `which -a hugo`：打印多行说明装了不止一份，**排在最前面的那一份才是实际生效的**。

升级方式取决于你使用的安装方式：仓库中的包用系统自身的仓库升级命令升级，能否得到最新版本取决于该仓库；从源码构建时，重新执行对应的 `go install` 命令即可。自动更新并非默认行为。

## 对比

| | 预编译二进制 | 发行版仓库 | 从源码构建 |
| --- | :-: | :-: | :-: |
| 容易安装？ | ✓ | ✓ | ✓ |
| 容易升级？ | ✓ | 视情况而定 | ✓ |
| 容易降级？ | ✓ | 视情况而定 | ✓ |
| 自动更新？ | ✗ | 视情况而定 | ✗ |
| 可获得最新版本？ | ✓ | 视情况而定 | ✓ |

## 常见坑

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `hugo: Command not found.` | 二进制目录不在 `PATH` | `which -a hugo` 看它在哪；把目录写进 `PATH` 并重开终端 |
| OpenBSD 上 `sudo` 命令不存在 | OpenBSD 默认用 `doas`，不预装 `sudo` | 改用 `doas pkg_add hugo`，或自行安装 `sudo` |
| FreeBSD 上 `pkg: not found` | `pkg` 尚未初始化 | 直接运行一次 `pkg`，按提示确认安装 `pkg` 自身 |
| 仓库里的版本明显偏旧 | BSD 仓库的包版本常落后于[最新发布](https://github.com/gohugoio/hugo/releases/latest) | 装之前先 `pkg search hugo` / `pkgin search hugo` 查版本；不满意就改用预编译二进制或从源码构建 |
| 构建时报 `this feature is not available in this edition of Hugo` | 当前 edition 不提供该功能（例如在 standard 版上用 LibSass） | 换装 extended 版，或改用 [Dart Sass](/functions/css/sass/)；见[常见问题](/troubleshooting/faq/) |
| `go install` 构建成功但仍找不到 `hugo` | 二进制在 `$(go env GOPATH)/bin`，该目录不在 `PATH` | 把该目录写进 shell 启动文件并重开终端 |

其余构建与渲染类问题见[故障排查](/troubleshooting/)。提问时请附上 `hugo version`、`hugo env` 的输出与完整报错。

## 接下来

装好之后从[快速开始](/getting-started/quick-start/)跑通第一个站点，再读[基本用法](/getting-started/basic-usage/)与[目录结构](/getting-started/directory-structure/)。
