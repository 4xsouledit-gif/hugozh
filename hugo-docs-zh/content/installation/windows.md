+++
title = "在 Windows 上安装"
linkTitle = "在 Windows 上安装"
description = "在 Windows 上通过 Chocolatey、Scoop、Winget、二进制或源码安装 Hugo。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/installation/windows/"
+++

> **说明：** Hugo 要求 Windows 10、Windows Server 2016 或更高版本。

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

### Chocolatey

[Chocolatey](https://chocolatey.org/) 是 Windows 上自由开源的包管理器。安装 extended 版的 Hugo：

```bash
choco install hugo-extended
```

### Scoop

[Scoop](https://scoop.sh/) 是 Windows 上自由开源的包管理器。安装 extended 版的 Hugo：

```bash
scoop install hugo-extended
```

### Winget

[Winget](https://learn.microsoft.com/en-us/windows/package-manager/) 是微软官方的 Windows 自由开源包管理器。安装 extended 版的 Hugo：

```bash
winget install Hugo.Hugo.Extended
```

卸载 extended 版的 Hugo：

```bash
winget uninstall --name "Hugo (Extended)"
```

## 从源码构建

从源码构建 Hugo 需要先安装：

1. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. [Go](https://go.dev/doc/install)，版本不低于当前 Hugo 所要求的 Go 版本

> **说明：** macOS 与 Linux 的从源码构建说明中使用的 Bash 风格 `KEY=VALUE cmd` 语法在 PowerShell 或命令提示符（Command Prompt）中不可用，请使用与你的 shell 匹配的代码块。

### Standard 版

构建并安装 standard 版。

PowerShell：

```powershell
$env:CGO_ENABLED=0; go install github.com/gohugoio/hugo@latest
```

命令提示符：

```bat
set CGO_ENABLED=0
go install github.com/gohugoio/hugo@latest
```

### Deploy 版

deploy 版自 v0.159.2 起提供。

构建并安装 deploy 版。

PowerShell：

```powershell
$env:CGO_ENABLED=0; go install -tags withdeploy github.com/gohugoio/hugo@latest
```

命令提示符：

```bat
set CGO_ENABLED=0
go install -tags withdeploy github.com/gohugoio/hugo@latest
```

### Extended 版

构建并安装 extended 版，需要先安装 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)，然后执行下面的命令。

PowerShell：

```powershell
$env:CGO_ENABLED=1; go install -tags extended github.com/gohugoio/hugo@latest
```

命令提示符：

```bat
set CGO_ENABLED=1
go install -tags extended github.com/gohugoio/hugo@latest
```

### Extended/deploy 版

构建并安装 extended/deploy 版，需要先安装 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)，然后执行下面的命令。

PowerShell：

```powershell
$env:CGO_ENABLED=1; go install -tags extended,withdeploy github.com/gohugoio/hugo@latest
```

命令提示符：

```bat
set CGO_ENABLED=1
go install -tags extended,withdeploy github.com/gohugoio/hugo@latest
```

> **说明：** 在 Windows 上安装 GCC 的详细步骤，参见[这篇帖子](https://discourse.gohugo.io/t/41370)。

## 验证安装与升级

安装完成后，在 PowerShell、命令提示符或 Windows Terminal 中执行：

```bash
hugo version
```

命令会输出 Hugo 的版本、edition 与构建信息。如果提示找不到命令，说明可执行文件所在目录还没有加入 `PATH` 环境变量，请参考上面的预编译二进制步骤或查阅 Windows 文档。

升级方式取决于你使用的安装方式：Chocolatey、Scoop 与 Winget 安装的包用各自包管理器的升级命令升级；从源码构建时，重新执行对应的 `go install` 命令即可。自动更新并非默认行为，需要额外配置才能实现。

## 对比

| | 预编译二进制 | 包管理器 | 从源码构建 |
| --- | :-: | :-: | :-: |
| 容易安装？ | ✓ | ✓ | ✓ |
| 容易升级？ | ✓ | ✓ | ✓ |
| 容易降级？ | ✓ | ✓ | ✓ |
| 自动更新？ | ✗ | ✗ | ✗ |
| 可获得最新版本？ | ✓ | ✓ | ✓ |

- 包管理器自动更新：可以实现，但需要额外配置。
- 包管理器降级：如果旧版本仍然保留在系统中，降级很容易。
