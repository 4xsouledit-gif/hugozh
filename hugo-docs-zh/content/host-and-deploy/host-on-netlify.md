+++
title = "部署到 Netlify"
linkTitle = "部署到 Netlify"
description = "用 Netlify 的 Git 集成持续部署 Hugo 站点：netlify.toml、构建命令与发布目录、Dart Sass 变体，附构建失败的排查入口。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/host-and-deploy/host-on-netlify/"

[params.teach]
difficulty = "入门"
time = "25–35 分钟"
prereq = [
  "一个 Netlify 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在仓库根目录新增 `netlify.toml` 并提交推送",
]
outcomes = [
  "用 `netlify.toml` 声明构建命令、发布目录与工具版本，让 Netlify 在云端构建",
  "说清 `--baseURL \"${URL}\"` 为什么能让正式域名与预览部署都正确",
  "站点需要 Sass 时，加上 Dart Sass 的安装步骤",
  "构建失败或页面 404 时，按 Netlify 的部署日志定位问题",
]
next = ["/host-and-deploy/host-on-vercel/", "/host-and-deploy/host-on-cloudflare/", "/configuration/caches/", "/troubleshooting/"]
+++

下面的步骤以 GitHub 仓库为例说明 Netlify 的持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里放一个 `netlify.toml` → 在 Netlify 里导入仓库 → 等首次部署完成 → 拿到网址**。

Netlify 的配置只有两处，理解了就不会填错：

- `[build] publish` 告诉 Netlify **从哪个目录取产物**（填错就是 404）；
- `[build] command` 告诉 Netlify **执行什么命令**（其中 `--baseURL "${URL}"` 用的是 Netlify 注入的地址，因此正式域名与预览域名都能自动正确）。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 写配置 | 创建 `netlify.toml`（第 1 步） | 文件在仓库根目录；`publish` 是 `public` |
| 3. 配置缓存 | 设置 `[caches.images]`（第 2 步） | 本地再跑一次 `hugo` 仍成功 |
| 4. 推送 | 提交并推送（第 3 步） | GitHub 仓库页面能看到 `netlify.toml` |
| 5. 导入项目 | 在 Netlify 仪表板导入仓库（第 4–10 步） | 「Review configuration」页面出现，说明仓库已连上 |
| 6. 部署 | 保留默认值按 **Deploy**（第 11 步） | 部署日志里出现 `hugo build` 的执行输出，随后显示发布成功 |
| 7. 访问 | 点击已发布站点的链接（第 12 步） | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `HUGO_VERSION` | `netlify.toml` 的 `[build.environment]` | 与本地一致的版本，例如 `0.167.0` | 云端用到旧版 Hugo，报模板或参数不存在 |
| `DART_SASS_VERSION` | 同上 | 站点用 Sass 时填，例如 `1.105.0` | 构建报找不到 `sass` |
| `GO_VERSION` / `NODE_VERSION` | 同上 | 有 `go.mod` / `package-lock.json` 时才需要 | 依赖 Hugo Modules 或 npm 时构建失败 |
| `TZ` | 同上 | 构建时区，例如 `Europe/Oslo` | 时间相关输出与预期不符 |
| `publish` | `[build]` | `public` | 部署成功但站点 404 |
| `command` | `[build]` | 示例中的构建命令（含 `--baseURL "${URL}"`） | 构建失败，或链接指向错误地址 |
| 项目名 | 仪表板 **Review configuration** 页面 | 任意可辨认的名字 | 多个项目重名、难以区分 |
| `baseURL` | 项目配置文件 | 仅在本地构建时需要；云端由 `${URL}` 覆盖 | 本地预览链接与线上不一致 |

## 前提条件

继续之前请先完成以下事项：

1. [注册](https://app.netlify.com/signup) Netlify 账号。
2. [登录](https://app.netlify.com/login) Netlify 账号。
3. [注册](https://github.com/signup) GitHub 账号。
4. [登录](https://github.com/login) GitHub 账号。
5. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
6. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：创建 Netlify 配置

在项目根目录创建 `netlify.toml`，按需调整工具版本与时区。

```toml {file="netlify.toml"}
[build.environment]
GO_VERSION = "1.27.1"
HUGO_VERSION = "0.167.0"
NODE_VERSION = "24.21.0"
TZ = "Europe/Oslo"

[build]
publish = "public"
command = """\
  git config --global core.quotepath false && \
  hugo build --gc --minify --baseURL "${URL}"
  """
```

`publish` 指向 Hugo 的输出目录 `public`，`command` 是 Netlify 在每次部署时执行的构建命令。`--baseURL "${URL}"` 使用 Netlify 注入的环境变量，因此无论预览部署的临时域名还是正式域名都能生成正确的绝对地址。`git config --global core.quotepath false` 避免 Git 对非 ASCII 文件名转义。

如果项目需要用 Dart Sass 把 Sass 编译成 CSS，还要设置 `DART_SASS_VERSION`，并在构建命令中加入 Dart Sass 的安装步骤。

```toml {file="netlify.toml"}
[build.environment]
DART_SASS_VERSION = "1.105.0"
GO_VERSION = "1.27.1"
HUGO_VERSION = "0.167.0"
NODE_VERSION = "24.21.0"
TZ = "Europe/Oslo"

[build]
publish = "public"
command = """\
  curl -sfLO "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz" && \
  tar -C "${HOME}/.local" -xf "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz" && \
  rm "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz" && \
  export PATH="${HOME}/.local/dart-sass:${PATH}" && \
  git config --global core.quotepath false && \
  hugo build --gc --minify --baseURL "${URL}"
  """
```

**你应当看到什么**：把 `netlify.toml` 保存后，本地用 `hugo build --gc --minify` 仍能成功（`${URL}` 是 Netlify 才有的变量，本地手动执行那串命令时不要照搬）。真正的验证在部署日志里：`command` 的执行输出会显示 `hugo build` 的构建统计。

### 第 2 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

这样本地构建与 Netlify 构建都会把处理过的图片缓存到 `.cache/hugo/images`。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 3 步：推送代码

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。

### 第 4 步：导入项目

在 Netlify 仪表板右上角点击 **Add new project** 按钮，然后选择 "Import an existing project"。

### 第 5 步：连接 GitHub

选择连接到 GitHub。

### 第 6 步：授权 Netlify

点击 "Authorize Netlify" 按钮，允许 Netlify 应用访问你的 GitHub 账号。

### 第 7 步：在 GitHub 上配置 Netlify

点击 **Configure Netlify on GitHub** 按钮。

### 第 8 步：选择账号

选择你希望安装 Netlify 应用的 GitHub 账号。

### 第 9 步：选择仓库范围

授权 Netlify 应用访问全部仓库或仅访问选定仓库，然后点击 Install 按钮。浏览器会跳回 Netlify 仪表板。

### 第 10 步：选择仓库

点击你希望导入的仓库名称。

### 第 11 步：确认配置

在 "Review configuration" 页面上填写项目名称，其余设置保留默认值，然后点击 **Deploy** 按钮。构建命令、发布目录与工具版本都来自仓库里的 `netlify.toml`，因此这里不需要再手工填写。

> [!TIP]
> 如果这个页面让你手工填「Build command」与「Publish directory」，说明 Netlify 没读到 `netlify.toml`——先确认该文件在仓库根目录且已经推送。

### 第 12 步：查看站点

部署完成后，点击指向已发布站点的链接即可访问。

之后每次从本地仓库推送改动，Netlify 都会重新构建并部署站点。Netlify 会为每个拉取请求生成预览部署，预览也使用同一份 `netlify.toml`。

**你应当看到什么**：首次部署完成后，站点地址形如 `https://<随机名>.netlify.app`；首页、一个内页、一张图片都应当正常。预览部署的地址不同，但由于 `--baseURL "${URL}"`，预览里的链接也应当指向预览地址本身。

## 失败时：典型报错与排查入口

排查入口是 **Netlify 仪表板 → 你的站点 → Deploys → 点开某次部署**，日志按「构建」与「发布」两段展开。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 构建日志报 `hugo: command not found` 或版本过旧 | `HUGO_VERSION` 缺失或没写进 `[build.environment]` | 加上 `HUGO_VERSION`，值取 `hugo version` 显示的版本 |
| 构建命令报 `command failed with exit code 2` | 命令本身失败，常见于 Sass 未安装或 `PATH` 没导出 | 用带 Dart Sass 的第二个配置；确认 `export PATH` 与 `hugo build` 在同一条命令链里 |
| 部署成功但访问 404 | `publish` 不是真正的发布目录 | 改成 `public`（或你配置的 `publishDir`），重新部署 |
| 页面能打开但样式、图片丢失 | `--baseURL` 没生效（例如手工改成了固定域名），或站点地址与访问地址不符 | 保留 `--baseURL "${URL}"`；只有确实要固定域名时才写死 |
| 预览部署里链接指向正式域名 | 配置里写死了 `baseURL` | 改回 `--baseURL "${URL}"`，让每次部署使用自己的地址 |
| 找不到 `netlify.toml` 里的设置 | 文件不在仓库根目录，或文件名拼错 | 确认路径与文件名为 `netlify.toml`，并在仪表板里重新触发部署 |
| 构建很慢，每次重新处理图片 | 缓存目录与 `[caches.images].dir` 不一致 | 两边统一指向 `:cacheDir/images` |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在站点的 **Domain management** 中添加域名并把 DNS 指向 Netlify，证书由 Netlify 自动签发与续期；域名生效后 `${URL}` 会变为该域名，配置文件无需改动。

**重定向**：Netlify 支持在 `netlify.toml` 中写 `[[redirects]]` 区段，也可以使用仓库根目录的 `_redirects` 文件；Hugo 自身的页面别名同样会生成跳转页面。

**404 页面**：Hugo 生成的 `public/404.html` 会随产物发布，Netlify 在找不到路径时会使用它。

## 相关资源

- [Netlify 通用文档](https://docs.netlify.com/)
- [自定义域名设置](https://docs.netlify.com/domains-https/custom-domains/)
