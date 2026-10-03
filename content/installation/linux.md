+++
title = "在 Linux 上安装"
linkTitle = "在 Linux 上安装"
description = "在 Linux 上通过 Snap、Homebrew、发行版仓库、预编译二进制或源码安装 Hugo，并说明仓库版本落后、Snap 受限等实际影响。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/installation/linux/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "一台主流 Linux 发行版，以及 `sudo`（或 Alpine 上的 `doas`）权限",
  "会打开终端并输入命令；不确定该用哪种写法，先读 [快速开始](/getting-started/quick-start/) 的「第 0 步」",
  "能连外网；用 Snap 或 Homebrew 时需要先装好它们自己",
]
outcomes = [
  "在发行版仓库、Snap、Homebrew、预编译二进制、源码构建五条路径中选一条，并装好 Hugo",
  "用 `hugo version` 确认版本与 edition；理解「装了 Snap 版站点为什么必须放在主目录」",
  "知道发行版仓库的版本常常落后，并会先查仓库里的候选版本再决定",
  "命令找不到时，用 `which -a hugo` 定位实际执行的是哪一份",
]
next = ["/installation/", "/getting-started/quick-start/", "/troubleshooting/faq/"]

+++

Linux 上的选择比 Windows 多，也更容易走弯路：**发行版仓库最省事，但版本常常落后好几代**，而 Hugo 的新配置键与模板功能更新很快。这一页先帮你把路线定下来，再给出每条路线的完整命令与验证方法。

## 先选路线

| 方式 | 装的是哪个 edition | 版本新旧 | 适合谁 |
| --- | --- | --- | --- |
| **发行版仓库**（`apt`、`dnf`、`pacman`…） | 通常 extended（见各发行版小节） | **常落后**，取决于发行版与版本 | 只求一条命令装完、不在意版本的人 |
| **Snap** | extended，自动更新 | 较新，自动更新 | 想省心又想要较新版本的人 |
| **Homebrew** | extended/deploy | 较新，需手动 `brew upgrade` | 已经用 Homebrew 管理软件的人 |
| **预编译二进制** | 自己指定 | 最新，完全可控 | 需要固定版本、或无包管理器可用 |
| **从源码构建** | 自己指定 | 最新 | Go 开发者，或要改源码 |

**仓库版本到底有多旧**，装之前先查一眼即可（输出里看候选版本号）：

```bash
# Debian / Ubuntu
apt policy hugo

# Fedora / RHEL 系
dnf info hugo

# Arch 系
pacman -Si hugo

# openSUSE
zypper info hugo
```

**会怎样**：仓库的版本如果低于本站文档要求的 **v0.158**，`locale` 一类较新的配置键可能不被识别，模板里较新的函数也可能不存在。这时换 Snap、Homebrew 或预编译二进制更省时间。

**不要同时装两份**。发行版仓库、Snap、Homebrew 各有自己的安装位置，两份共存不会报错，但 `PATH` 里靠前的那份会被执行。用下面的命令可以列出全部：

```bash
which -a hugo
```

排在最前面的就是实际执行的那一份。

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

**会怎样**：edition 选错时构建会直接失败，错误信息是 `this feature is not available in this edition of Hugo`；解决办法是换装 extended 版，或改用 [Dart Sass](/functions/css/sass/)（任何 edition 都可用）。原因见[常见问题](/troubleshooting/faq/)。

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

发行版仓库里通常都有 Git；Go 与 Dart Sass 则要看发行版，Dart Sass 一般需要从[官方发布页](https://github.com/sass/dart-sass/releases)下载或用 Snap 安装。

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)，向下滚动到 Assets 部分。

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH` 环境变量，请查阅操作系统自身的文档。

如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

在 Linux 上把这几步具体化：

1. **选文件**：`linux-amd64`（ARM 设备是 `linux-arm64`）的 `.tar.gz`；**文件名里带 `extended` 的才是扩展版**。
2. **解压并放到固定目录**，例如：

   ```bash
   tar -xzf hugo_extended_*_linux-amd64.tar.gz
   sudo install -m 755 hugo /usr/local/bin/hugo
   ```

   `install -m 755` 同时完成了「移动」与「给执行权限」两步，正好对应上面的第 3、5 步。
3. **确认目录在 `PATH` 里**：`/usr/local/bin` 一般在 `PATH` 中；如果把它放到 `~/bin` 或 `~/.local/bin`，需要自己把该目录写进 `PATH`（写进 `~/.bashrc` 或 `~/.zshrc` 后重开终端）：

   ```bash
   export PATH="$PATH:$HOME/.local/bin"
   ```
4. **验证**：

   ```bash
   which -a hugo
   hugo version
   ```

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

**「严格受限」到底意味着什么**：snap 有自己的沙箱，看不到你主目录与可移动介质之外的路径。把站点建在 `/srv/site`、`/var/www/site`、`/opt/site` 这类位置时，Hugo 会读不到内容或写不出 `public/`，表现为构建失败或输出为空；**站点放在 `~/` 下面就能正常工作**。

**验证标准**：在主目录里建一个站点（先 `cd ~`，再执行 `hugo new project hugo-snap-demo`），进入该目录后 `hugo` 构建成功、`public/` 里有 `index.html`；把同一个站点复制到 `/srv` 下再构建，就会失败。这正是受限沙箱的表现，不是 Hugo 装坏了。如果站点必须在可移动介质上，用上面的 `snap connect hugo:removable-media` 放行。

**Snap 与发行版仓库同时装了 Hugo 时**，`/snap/bin/hugo` 与 `/usr/bin/hugo` 都会存在，`which -a hugo` 可以看清顺序。

### Homebrew

[Homebrew](https://brew.sh/) 是 macOS 与 Linux 上自由开源的包管理器。安装 extended/deploy 版的 Hugo：

```bash
brew install hugo
```

在 Linux 上使用 Homebrew 要求先按 [brew.sh](https://brew.sh/) 的说明装好 Homebrew，并把它的 bin 目录写进 `PATH`。装好后用 `brew upgrade hugo` 升级。

## 发行版仓库（repository packages）

大多数 Linux 发行版都维护了常用软件的仓库。

> [!NOTE]
> 仓库中 Hugo 的版本随发行版及其版本而不同，有时并不是[最新版本](https://github.com/gohugoio/hugo/releases/latest)。
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

`go install` 会把二进制写进 Go 的 bin 目录，而这个目录**默认不在 `PATH` 里**，所以「构建成功、命令找不到」是这条路径最常见的现象：

```bash
# 看看它在哪
go env GOPATH

# 典型结果是 /home/you/go，二进制就在 /home/you/go/bin/hugo
# 把下面这行加进 ~/.bashrc 或 ~/.zshrc，然后重开终端
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

**报错看不懂时怎么下手**：两条 `CGO_ENABLED=1` 的命令依赖 C 编译器。没有装 `gcc`/`clang` 时，报错里会出现 `cgo`、`gcc` 或 `exec: "gcc": executable file not found in $PATH` 一类的字样；此时要么按 `Debian: sudo apt install build-essential`、`Fedora: sudo dnf install gcc` 一类方式装好编译器（各发行版包名不同，以发行版文档为准），要么改用 `CGO_ENABLED=0` 构建 standard 或 deploy 版。

## 验证安装与升级

安装完成后，在终端中执行：

```bash
hugo version
```

命令会输出 Hugo 的版本、edition 与构建信息。如果提示找不到命令，说明可执行文件所在目录还没有加入 `PATH` 环境变量，请参考上面的预编译二进制步骤或查阅发行版文档。

**你应当看到什么**：

```text
hugo v0.167.0+extended linux/amd64 BuildDate=... VendorInfo=gohugoio
```

- 以 `hugo v` 开头、版本号不低于 v0.158，即满足本站文档的要求；
- 带 `+extended` 说明是扩展版；标准版没有这一段；
- `linux/amd64` 或 `linux/arm64` 应当与你的机器架构一致。

再执行一次 `which -a hugo`，确认实际执行的那一份就是你刚装的那一份。打印多行时，排在最前面的才是生效的。

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

## 常见坑

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `hugo: command not found` | 二进制目录不在 `PATH`；或改了 `PATH` 没重开终端 | `which -a hugo` 看它在哪；把目录写进 `PATH`（`~/.bashrc` 或 `~/.zshrc`）后重开终端 |
| 能运行，但版本比刚装的旧 | 装了多份 Hugo（例如 Snap 与 apt 各一份），`PATH` 里靠前的先被执行 | `which -a hugo` 列出全部，用对应包管理器的卸载命令卸掉多余的那份 |
| 构建时报 `this feature is not available in this edition of Hugo` | 当前 edition 不提供该功能（例如在 standard 版上用 LibSass） | 换装 extended 版，或改用 [Dart Sass](/functions/css/sass/)；见[常见问题](/troubleshooting/faq/) |
| Snap 版构建时报读不到文件、`public/` 为空 | snap 是严格受限的，只能访问主目录与可移动介质 | 把站点移到 `~/` 下；或 `sudo snap connect hugo:removable-media` |
| 发行版仓库装完版本很旧 | 仓库版本落后于[最新发布](https://github.com/gohugoio/hugo/releases/latest) | 先 `apt policy hugo` 一类命令查看候选版本，不满意就改用 Snap、Homebrew 或预编译二进制 |
| `go install` 构建成功但仍找不到 `hugo` | 二进制在 `$(go env GOPATH)/bin`，该目录不在 `PATH` | 把 `$(go env GOPATH)/bin` 写进 shell 启动文件并重开终端 |
| 用 `sudo hugo` 构建后产物属主是 root | `sudo` 会以 root 身份写 `public/` | 不要用 `sudo` 构建站点；权限已经乱了就用 `sudo chown -R "$USER" .` 修回 |

其余构建与渲染类问题见[故障排查](/troubleshooting/)。提问时请附上 `hugo version`、`hugo env` 的输出与完整报错。

## 接下来

装好之后从[快速开始](/getting-started/quick-start/)跑通第一个站点，再读[基本用法](/getting-started/basic-usage/)与[目录结构](/getting-started/directory-structure/)。
