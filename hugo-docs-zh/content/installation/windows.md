+++
title = "在 Windows 上安装"
linkTitle = "在 Windows 上安装"
description = "在 Windows 上通过 Winget、Chocolatey、Scoop、预编译二进制或源码安装 Hugo，并讲透 PATH、标准版与扩展版的选择。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/installation/windows/"

[params.teach]
difficulty = "入门"
time = "15–25 分钟"
prereq = [
  "Windows 10、Windows Server 2016 或更高版本（这是 Hugo 的硬性要求）",
  "会用 PowerShell 或命令提示符输入命令；不确定该开哪一个终端，先读 [快速开始](/getting-started/quick-start/) 的「第 0 步」",
  "用 Chocolatey 时需要**管理员** PowerShell；用 Scoop 或 Winget 时普通终端即可",
]
outcomes = [
  "在 Winget、Chocolatey、Scoop、预编译二进制、源码构建五条路径中选一条，并装好 Hugo",
  "看懂 `hugo version` 的输出，判断版本与 edition（扩展版带 `+extended`）",
  "在命令找不到时，按「二进制在不在 → 目录在不在 PATH → 终端要不要重开」三步排查",
  "知道多份 Hugo 共存、WSL 与 Windows 各装一份时会发生什么",
]
next = ["/installation/", "/getting-started/quick-start/", "/troubleshooting/faq/"]

+++

> [!NOTE]
> Hugo 要求 Windows 10、Windows Server 2016 或更高版本。

这一页比其它平台页长，原因很实际：Windows 上「装完了，但终端说找不到 `hugo`」的比例远高于 macOS 和 Linux。问题几乎都不在 Hugo 本身，而在 **`PATH` 环境变量**和**装了不止一份 Hugo**。下面把这两件事拆开讲。

## 先决定两件事

**第一件：装哪个发行版（edition）。** Windows 上三个包管理器默认都给 extended 版（见下方命令），预编译二进制和源码构建则要你自己选。判断标准见下一节的说明；拿不准就按下面的经验来：

| 你的情况 | 建议 |
| --- | --- |
| 跟随本站文档做一个普通站点 | 装 **extended** 更省心——主题里只要有一处 LibSass，standard 版就会构建失败 |
| 明确知道自己只用 Dart Sass，想要更小的二进制 | **standard** 足够 |
| 要用 `hugo deploy` 推到云存储 | 需要 **deploy** 或 **extended/deploy** |

**第二件：用哪种安装方式。** 五条路径的取舍：

| 方式 | 适合谁 | 命令能否自动进 `PATH` | 升级方式 |
| --- | --- | --- | --- |
| **Winget** | 大多数 Windows 用户；系统自带，无需额外安装 | 能（写入**用户** `PATH`） | `winget upgrade` |
| **Chocolatey** | 已经用 Chocolatey 管理软件的人 | 能（系统级 shim 目录） | `choco upgrade` |
| **Scoop** | 不想用管理员权限、偏好用户级安装的人 | 能（用户级 shim 目录） | `scoop update` |
| **预编译二进制** | 没有包管理器、或需要指定某个版本 | **不能，要手工加 `PATH`** | 重新下载解压 |
| **从源码构建** | 要改 Hugo 源码，或 Go 开发者 | **不能，`go install` 的目录默认不在 `PATH`** | 重新执行 `go install` |

**不要同时用两个包管理器装 Hugo**。两份共存不会报错，但 `PATH` 里靠前的那份会被执行，于是出现「我明明刚装了新版，`hugo version` 却是旧版」这类看起来毫无道理的现象。先卸载旧的，再装新的。

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

**会怎样**：edition 选错不是「功能少一点」，而是**构建直接失败**。当模板或主题用到当前 edition 没有的能力时，Hugo 会抛出：

```text
this feature is not available in this edition of Hugo
```

解决办法是换装 extended 版（或改用 [Dart Sass](/functions/css/sass/)），原因见[常见问题](/troubleshooting/faq/)。

**怎么一眼确认装的是哪个 edition**：看 `hugo version` 输出里有没有 `+extended`。实测本机安装 winget 版 `Hugo.Hugo.Extended` 后的输出：

```text
hugo v0.167.0-3fff6fb5c267dacb26280c78dbe8c344054249c8+extended windows/amd64 BuildDate=2026-09-28T14:50:38Z VendorInfo=gohugoio
```

对应的标准版没有 `+extended` 这一段。实测用 `winget show` 查看包信息时，扩展版的描述里写明它多了两项能力：编码 WebP 图片（标准版只能解码），以及使用内嵌的 LibSass 转译器。两条命令分别是：

```powershell
winget show Hugo.Hugo.Extended   # 扩展版，包名带 .Extended
winget show Hugo.Hugo            # 标准版
```

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

**哪些可以暂时不装**：用 Winget、Chocolatey、Scoop 或预编译二进制安装，并且站点不使用 Hugo 模块时，Git、Go、Dart Sass 都可以先不装。只有「从源码构建」和「使用 Hugo 模块」这两条路必须提前装好 Git 与 Go。

## 预编译二进制（prebuilt binaries）

官方为各种操作系统与架构提供了预编译二进制文件。请访问 Hugo 的[最新发布页面](https://github.com/gohugoio/hugo/releases/latest)，向下滚动到 Assets 部分。

1. 下载所需 edition、操作系统与架构对应的压缩包
2. 解压
3. 把可执行文件移动到目标目录
4. 把该目录加入 `PATH` 环境变量
5. 确认对该文件有_执行_权限

如果需要设置文件权限或修改 `PATH` 环境变量，请查阅操作系统自身的文档。

如果找不到所需 edition、操作系统与架构的预编译二进制，请改用下面介绍的安装方式。

这条路径在 Windows 上可以完整走一遍，大约三分钟：

1. **选文件**：Windows 选 `.zip` 结尾、`windows-amd64`（ARM 设备是 `windows-arm64`）的压缩包。**文件名里带 `extended` 字的才是扩展版**。
2. **解压到固定目录**：例如 `C:\Hugo\bin`。不要解压到「下载」文件夹——那里的文件迟早会被清理。解压后该目录下应当有 `hugo.exe`。
3. **把 `C:\Hugo\bin` 加入 `PATH`**：
   - 按 `Win` 键，输入「环境变量」，选择**编辑账户的环境变量**（这个不需要管理员权限；「编辑系统环境变量」会影响所有用户，需要管理员）；
   - 在**用户变量**区域选中 `Path`，点「编辑」→「新建」，粘贴 `C:\Hugo\bin`，然后一路点「确定」；
   - **关闭并重新打开终端**。已经打开的终端读的是启动时的 `PATH`，不重开不会生效——这是最常被忽略的一步。
4. **验证**（下面「验证安装与升级」一节有完整说明）：

   ```powershell
   where.exe hugo
   hugo version
   ```

`where.exe` 应当打印出 `C:\Hugo\bin\hugo.exe`。如果什么都没有打印，说明第 3 步的路径没写对，或者终端没重开。

## 包管理器（package manager）

也可以用下列包管理器安装 Hugo。

### Chocolatey

[Chocolatey](https://chocolatey.org/) 是 Windows 上自由开源的包管理器。安装 extended 版的 Hugo：

```bash
choco install hugo-extended
```

- **需要管理员权限**：请以管理员身份打开 PowerShell 再执行（开始菜单搜索 PowerShell → 右键 → 以管理员身份运行）。
- **装到哪**：Chocolatey 的系统级目录（默认 `C:\ProgramData\chocolatey`），命令通过该目录下 `bin` 里的 shim 暴露，这个目录在安装 Chocolatey 时就已写入系统 `PATH`。
- **升级与卸载**：`choco upgrade hugo-extended`、`choco uninstall hugo-extended`。

### Scoop

[Scoop](https://scoop.sh/) 是 Windows 上自由开源的包管理器。安装 extended 版的 Hugo：

```bash
scoop install hugo-extended
```

- **不需要管理员权限**：Scoop 的设计就是用户级安装，装到你的用户目录下（默认 `%USERPROFILE%\scoop`），命令通过 `%USERPROFILE%\scoop\shims` 暴露。
- **升级与卸载**：`scoop update hugo-extended`、`scoop uninstall hugo-extended`。
- 若 `scoop` 命令本身找不到，说明 Scoop 还没装或它的 `shims` 目录不在 `PATH`，先按 [scoop.sh](https://scoop.sh/) 的说明安装并重开终端。

### Winget

[Winget](https://learn.microsoft.com/en-us/windows/package-manager/) 是微软官方的 Windows 自由开源包管理器。安装 extended 版的 Hugo：

```bash
winget install Hugo.Hugo.Extended
```

卸载 extended 版的 Hugo：

```bash
winget uninstall --name "Hugo (Extended)"
```

- **包名决定 edition**：`Hugo.Hugo.Extended` 是扩展版，`Hugo.Hugo` 是标准版（实测两者都存在，版本号一致）。
- **装到哪（实测）**：安装后 Hugo 位于 `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Hugo.Hugo.Extended_<源标识>\`，Winget 会把**这个包目录本身**写入**用户** `PATH`；同时 `%LOCALAPPDATA%\Microsoft\WinGet\Links` 也在用户 `PATH` 里，供 portable 包建立 shim 用。
- **首次运行 Winget 会要求同意源协议**（实测：会提示查看 msstore 源的条款）。这是 Winget 自身的行为，与 Hugo 无关。
- **升级**：`winget upgrade Hugo.Hugo.Extended`。

## 从源码构建

从源码构建 Hugo 需要先安装：

1. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. [Go](https://go.dev/doc/install)，版本不低于当前 Hugo 所要求的 Go 版本

> [!NOTE]
> macOS 与 Linux 的从源码构建说明中使用的 Bash 风格 `KEY=VALUE cmd` 语法在 PowerShell 或命令提示符（Command Prompt）中不可用，请使用与你的 shell 匹配的代码块。

**这条路径在 Windows 上要多注意两点**：

- `$env:CGO_ENABLED=1; go install ...` 里的环境变量**只对当前这个终端会话有效**，关掉窗口就没了；命令提示符里的 `set CGO_ENABLED=1` 同理。这不是持久配置，每次重新构建都要再设一次。
- 构建完成后，二进制落在 Go 的 bin 目录里（用 `go env GOPATH` 查看 GOPATH，通常就是 `%USERPROFILE%\go`，bin 目录即 `%USERPROFILE%\go\bin`）。**这个目录默认不在 `PATH` 里**，所以「构建成功、但 `hugo` 命令找不到」是这条路径的常见现象。按上一节的第 3 步把 `%USERPROFILE%\go\bin` 加入用户 `PATH`，并重开终端。

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

> [!NOTE]
> 在 Windows 上安装 GCC 的详细步骤，参见[这篇帖子](https://discourse.gohugo.io/t/41370)。

**报错看不懂时怎么下手**：`CGO_ENABLED=1` 的两次构建都依赖 C 编译器。没有编译器时，失败发生在编译阶段，报错里会出现 `cgo`、`gcc`、`exec: "gcc": executable file not found` 一类的字样；这时要么按上面的帖子装好 GCC，要么改用 `CGO_ENABLED=0` 构建 standard 或 deploy 版。

## 验证安装与升级

安装完成后，在 PowerShell、命令提示符或 Windows Terminal 中执行：

```bash
hugo version
```

命令会输出 Hugo 的版本、edition 与构建信息。如果提示找不到命令，说明可执行文件所在目录还没有加入 `PATH` 环境变量，请参考上面的预编译二进制步骤或查阅 Windows 文档。

**你应当看到什么**（实测本机输出）：

```text
hugo v0.167.0-3fff6fb5c267dacb26280c78dbe8c344054249c8+extended windows/amd64 BuildDate=2026-09-28T14:50:38Z VendorInfo=gohugoio
```

对应的失败输出有两种，含义不同：

- `hugo : 无法将"hugo"项识别为 cmdlet、函数、脚本文件或可运行程序的名称`、`'hugo' 不是内部或外部命令`——命令不在 `PATH` 里，或者终端没重开；
- 打印出的版本比你刚装的旧——系统里有不止一份 Hugo，`PATH` 里靠前的那份先被找到。

### 命令找不到时的三步排查

按顺序做，每一步都有可检验的结果：

1. **二进制到底在不在？** 在资源管理器地址栏输入你安装时用的目录（例如 `C:\Hugo\bin`），确认 `hugo.exe` 就在那里。不在，说明安装那一步没完成。
2. **目录在不在 `PATH` 里？** 在终端执行下面这行，查看当前用户 `PATH` 的全部条目：

   ```powershell
   [Environment]::GetEnvironmentVariable('Path','User') -split ';'
   ```

   逐条找有没有 Hugo 所在目录。没有就回到「预编译二进制」第 3 步添加。
3. **终端重开了吗？** 改完 `PATH` 必须关闭并重新打开终端。重开后执行：

   ```powershell
   where.exe hugo
   ```

   **你应当看到什么**：一行或多行以 `.exe` 结尾的完整路径。打印多行说明装了多份 Hugo，**排在最前面的那一份就是实际执行的那一份**。

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

## 常见坑（Windows 专项）

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `'hugo' 不是内部或外部命令` / `无法将"hugo"项识别为 cmdlet` | 二进制目录不在 `PATH`；或改完 `PATH` 没重开终端 | 按上面「命令找不到时的三步排查」走一遍 |
| 用 Winget 刚装完，当前终端仍然找不到 `hugo` | Winget 把包目录写进用户 `PATH`，但**已打开的终端**读的是旧 `PATH` | 关闭并重新打开终端 |
| `hugo version` 显示的版本比刚装的旧 | 装了多份 Hugo（例如先装过 Scoop 版，又装了 Winget 版），`PATH` 里靠前的那份先被执行 | `where.exe hugo` 列出全部，用对应包管理器的卸载命令卸掉多余的那份 |
| 明明装的是 extended，构建仍报 `this feature is not available in this edition of Hugo` | 实际执行的是另一份 standard 版二进制 | `where.exe hugo` 确认第一行指向哪一份；`hugo version` 是否带 `+extended` |
| 用 `choco install` 报权限错误 | Chocolatey 的系统级安装需要管理员终端 | 以管理员身份重新打开 PowerShell 再执行；或改用 Scoop、Winget |
| 在 WSL 里执行 `hugo` 找不到 | Windows 与 WSL 是两套独立环境，Windows 装的 Hugo 在 WSL 里不可见 | 在 WSL 里按 [在 Linux 上安装](/installation/linux/) 单独装一份 |
| 在 WSL 里运行 Hugo，但项目放在 Windows 分区，改了文件浏览器不刷新 | 跨文件系统的文件监视事件不可靠 | 给 `hugo server` 加 `--poll`，例如 `--poll 700ms`，原因与更多情形见[常见问题](/troubleshooting/faq/) |

其余构建与渲染问题见[故障排查](/troubleshooting/)。提问时请附上 `hugo version` 与 `hugo env` 的输出、完整报错，以及能复现问题的最小项目结构；中文提问可以用官方论坛的[中文分类](https://discourse.gohugo.io/c/chinese/42)。

## 接下来

装好之后，最短路径是[快速开始](/getting-started/quick-start/)：用它跑通第一个站点，再回来读[基本用法](/getting-started/basic-usage/)与[目录结构](/getting-started/directory-structure/)。
