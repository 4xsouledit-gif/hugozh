+++
title = "在 macOS 上安装"
linkTitle = "在 macOS 上安装"
description = "在 macOS 上通过 Homebrew、MacPorts、预编译二进制或源码安装 Hugo，并说明 Apple 芯片的 Homebrew 路径差异。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/installation/macos/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "一台 macOS 电脑；Apple 芯片（M 系列）与 Intel 机型都可以",
  "会打开「终端」（`Command + 空格` 输入 `Terminal`）并输入命令",
  "能连外网；Homebrew 首次安装会下载较多内容",
]
outcomes = [
  "用 Homebrew、MacPorts、预编译二进制或源码四条路径之一装好 Hugo",
  "知道 Apple 芯片与 Intel 机型上 Homebrew 的安装前缀不同，并在命令找不到时据此排查",
  "用 `hugo version` 确认版本与 edition，用 `which -a hugo` 确认实际执行的是哪一份",
  "了解从浏览器下载的二进制被系统拦下时该怎么办",
]
next = ["/installation/", "/getting-started/quick-start/", "/troubleshooting/faq/"]

+++

macOS 上没有「发行版仓库版本落后」的烦恼，两条主流路径（Homebrew、MacPorts）都能拿到较新的版本。真正容易踩的坑只有一个：**Apple 芯片与 Intel 机型上 Homebrew 的安装前缀不同**，这直接决定了 `PATH` 该写什么，也决定了「命令找不到」时该查哪里。

## 先选路线

| 方式 | 装的是哪个 edition | 升级方式 | 适合谁 |
| --- | --- | --- | --- |
| **Homebrew** | extended/deploy | `brew upgrade hugo` | 大多数用户；macOS 上最省事的路径 |
| **MacPorts** | extended | 用 MacPorts 自身流程升级 | 已经用 MacPorts 管理软件的人 |
| **预编译二进制** | 自己指定 | 重新下载解压 | 需要固定版本，或不想装包管理器 |
| **从源码构建** | 自己指定 | 重新执行 `go install` | Go 开发者，或要改源码 |

**不要同时装两份**。Homebrew 与 MacPorts 各有自己的安装位置，两份共存不会报错，但 `PATH` 里靠前的那份会被执行。用 `which -a hugo` 可以看到全部，排在最前面的就是实际生效的那一份。

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

**好消息**：本节两条包管理器路径都不会让你选错 edition——`brew install hugo` 装的是 extended/deploy，`sudo port install hugo` 装的是 extended。只有预编译二进制与源码构建需要你自己挑。

**会怎样**：用 standard 版构建一个依赖 LibSass 的主题时，报错是 `this feature is not available in this edition of Hugo`；解决办法是换装 extended 版，或改用 [Dart Sass](/functions/css/sass/)。原因见[常见问题](/troubleshooting/faq/)。

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

macOS 上有个便利之处：装了 Xcode 命令行工具（Command Line Tools）之后就自带 Git。在终端执行 `git --version`，若系统弹出安装提示，按提示装完即可。

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)，向下滚动到 Assets 部分。

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH` 环境变量，请查阅操作系统自身的文档。

如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

具体到 macOS：

1. **选文件**：下载 `darwin-universal`（`.tar.gz`）即可，它同时支持 Apple 芯片与 Intel；**文件名里带 `extended` 的才是扩展版**。
2. **解压并放到固定目录**，例如 `/usr/local/bin`：

   ```bash
   tar -xzf hugo_extended_*_darwin-universal.tar.gz
   sudo install -m 755 hugo /usr/local/bin/hugo
   ```

   `/usr/local/bin` 默认在 `PATH` 中，所以这一步同时解决了「给执行权限」与「加 PATH」两件事。若放到 `~/bin`，则需要自己把该目录写进 `PATH`：

   ```bash
   export PATH="$PATH:$HOME/bin"
   ```

3. **验证**：`which -a hugo` 与 `hugo version`。

**如果系统提示「无法验证开发者」或「无法打开」**：这是 macOS 对从浏览器下载的文件（带 quarantine 隔离属性）的例行拦截，与 Hugo 是否可靠无关。到**系统设置 → 隐私与安全性**，在页面下方找到被拦截的提示并选择「仍要打开」即可。

## 包管理器（package manager）

也可以用下列包管理器安装 Hugo。

### Homebrew

[Homebrew](https://brew.sh/) 是 macOS 与 Linux 上自由开源的包管理器。安装 extended/deploy 版的 Hugo：

```bash
brew install hugo
```

**Apple 芯片与 Intel 的路径差异**（这是 macOS 上「命令找不到」的头号原因）：

| 机型 | Homebrew 安装前缀 | 命令位置 |
| --- | --- | --- |
| Apple 芯片（M 系列） | `/opt/homebrew` | `/opt/homebrew/bin/hugo` |
| Intel | `/usr/local` | `/usr/local/bin/hugo` |

`/opt/homebrew/bin` 不一定在系统默认 `PATH` 里，需要由 Homebrew 自己写入。安装脚本会提示你把下面这行加到 shell 启动文件里（macOS 现在的默认 shell 是 zsh，对应 `~/.zprofile`）：

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**验证标准**：先执行 `brew --prefix` 看它打印哪个前缀；再执行 `which -a hugo`，输出里应当出现该前缀下的 `bin/hugo`。**如果你曾经在 Apple 芯片机器上用 Rosetta 装过 Intel 版 Homebrew**，`/usr/local/bin/hugo` 与 `/opt/homebrew/bin/hugo` 可能同时存在，此时 `which -a hugo` 打出的顺序就是实际生效顺序。

升级用 `brew upgrade hugo`；Homebrew 的自动更新需要额外配置，默认不会自动升级。

### MacPorts

[MacPorts](https://www.macports.org/) 是 macOS 上自由开源的包管理器。安装 extended 版的 Hugo：

```bash
sudo port install hugo
```

- MacPorts 自身的安装需要 Xcode 命令行工具（Command Line Tools），按 [macports.org](https://www.macports.org/) 的说明安装即可；
- 安装与升级都要 `sudo`：升级流程是 `sudo port selfupdate` 之后 `sudo port upgrade hugo`；
- MacPorts 默认把命令放在 `/opt/local/bin`，该目录通常会被写入 `PATH`；如果 `hugo` 找不到，用 `which -a hugo` 确认 `/opt/local/bin` 是否在 `PATH` 中。

## 从源码构建

从源码构建 Hugo 需要先安装：

1. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. [Go](https://go.dev/doc/install)，版本不低于当前 Hugo 所要求的 Go 版本

`go install` 把二进制写进 Go 的 bin 目录，而这个目录**默认不在 `PATH` 里**，所以「构建成功、命令找不到」是这条路径最常见的现象：

```bash
# 看看它在哪
go env GOPATH

# 典型结果是 /Users/you/go，二进制就在 /Users/you/go/bin/hugo
# 把下面这行加进 ~/.zshrc，然后重开终端
export PATH="$PATH:$(go env GOPATH)/bin"
```

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

macOS 上装好 Xcode 命令行工具（`xcode-select --install`）就带 `clang`，因此 `CGO_ENABLED=1` 的两条命令通常可以直接跑。如果报错里出现 `cgo`、`clang` 或 `xcrun: error: invalid active developer path`，说明命令行工具没装好或路径失效，重装一次命令行工具即可。

## 验证安装与升级

安装完成后，在终端中执行：

```bash
hugo version
```

命令会输出 Hugo 的版本、edition 与构建信息。如果提示找不到命令，说明可执行文件所在目录还没有加入 `PATH` 环境变量，请参考上面的预编译二进制步骤或查阅系统文档。

**你应当看到什么**：

```text
hugo v0.167.0+extended darwin/universal BuildDate=... VendorInfo=gohugoio
```

- 以 `hugo v` 开头、版本号不低于 v0.158，即满足本站文档的要求；
- 带 `+extended` 说明是扩展版；标准版没有这一段；
- 平台字段是 `darwin/universal`（通用二进制）或 `darwin/arm64`。

再执行 `which -a hugo`：**只打印一行**，说明只有一份 Hugo；打印多行时要确认排在最前面的就是你刚装的那一份。

升级方式取决于你使用的安装方式：Homebrew 可以用 `brew upgrade hugo` 升级，它安装的是 extended/deploy 版；MacPorts 安装的包用 MacPorts 自身的升级流程；从源码构建时，重新执行对应的 `go install` 命令即可。自动更新并非默认行为，Homebrew 需要额外配置才能自动升级，从源码构建则完全依赖你手动重新执行命令。

## 对比

| | 预编译二进制 | 包管理器 | 从源码构建 |
| --- | :-: | :-: | :-: |
| 容易安装？ | ✓ | ✓ | ✓ |
| 容易升级？ | ✓ | ✓ | ✓ |
| 容易降级？ | ✓ | ✓ | ✓ |
| 自动更新？ | ✗ | ✗ | ✗ |
| 可获得最新版本？ | ✓ | ✓ | ✓ |

- 包管理器降级：如果旧版本仍然保留在系统中，降级很容易。
- 包管理器自动更新：可以实现，但需要额外配置。

## 常见坑

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `zsh: command not found: hugo` | 二进制目录不在 `PATH`；Apple 芯片上多为 `/opt/homebrew/bin` 没写进 `PATH` | `brew --prefix` 看前缀，把 `eval "$(/opt/homebrew/bin/brew shellenv)"` 写进 `~/.zprofile`，重开终端 |
| 刚 `brew install` 完，当前终端仍找不到 | 安装脚本改的是 shell 启动文件，**已打开的终端**不会重新读取 | 关闭并重新打开终端 |
| 能运行，但版本或 edition 不对 | 装了多份 Hugo（MacPorts 与 Homebrew、或两套不同前缀的 Homebrew） | `which -a hugo` 列出全部，用对应包管理器的卸载命令卸掉多余的那份 |
| 构建时报 `this feature is not available in this edition of Hugo` | 当前 edition 不提供该功能（例如在 standard 版上用 LibSass） | 换装 extended 版；`brew install hugo` 与 `port install hugo` 装的都是扩展系列 |
| 双击下载的 `hugo` 提示「无法验证开发者」 | 浏览器下载的文件带 quarantine 隔离属性，被 Gatekeeper 拦下 | 系统设置 → 隐私与安全性 → 「仍要打开」 |
| `sudo port install hugo` 提示找不到 `port` | MacPorts 自身没有安装 | 按 [macports.org](https://www.macports.org/) 安装 MacPorts（需要 Xcode 命令行工具） |
| `go install` 构建成功但仍找不到 `hugo` | 二进制在 `$(go env GOPATH)/bin`，该目录不在 `PATH` | 把 `$(go env GOPATH)/bin` 写进 `~/.zshrc` 并重开终端 |
| 在 Apple 芯片上用 `sudo` 装到了 `/usr/local` | Rosetta 下的 Intel 版 Homebrew 抢先执行 | `which -a brew` 确认用的是哪一个 `brew`，必要时在 `PATH` 中让 `/opt/homebrew/bin` 优先 |

其余构建与渲染类问题见[故障排查](/troubleshooting/)。提问时请附上 `hugo version`、`hugo env` 的输出与完整报错。

## 接下来

装好之后从[快速开始](/getting-started/quick-start/)跑通第一个站点，再读[基本用法](/getting-started/basic-usage/)与[目录结构](/getting-started/directory-structure/)。
