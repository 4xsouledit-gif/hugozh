+++
title = "部署到 Netlify"
linkTitle = "部署到 Netlify"
description = "用 Netlify 的 Git 集成持续部署 Hugo 站点。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/host-and-deploy/host-on-netlify/"
+++

下面的步骤以 GitHub 仓库为例说明 Netlify 的持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 前置条件

继续之前请先完成以下事项：

1. [注册](https://app.netlify.com/signup) Netlify 账号。
1. [登录](https://app.netlify.com/login) Netlify 账号。
1. [注册](https://github.com/signup) GitHub 账号。
1. [登录](https://github.com/login) GitHub 账号。
1. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
1. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
1. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
1. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

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

在 Netlify 仪表板右上角点击 **Add new project** 按钮，然后选择 “Import an existing project”。

### 第 5 步：连接 GitHub

选择连接到 GitHub。

### 第 6 步：授权 Netlify

点击 “Authorize Netlify” 按钮，允许 Netlify 应用访问你的 GitHub 账号。

### 第 7 步：在 GitHub 上配置 Netlify

点击 **Configure Netlify on GitHub** 按钮。

### 第 8 步：选择账号

选择你希望安装 Netlify 应用的 GitHub 账号。

### 第 9 步：选择仓库范围

授权 Netlify 应用访问全部仓库或仅访问选定仓库，然后点击 Install 按钮。浏览器会跳回 Netlify 仪表板。

### 第 10 步：选择仓库

点击你希望导入的仓库名称。

### 第 11 步：确认配置

在 “Review configuration” 页面上填写项目名称，其余设置保留默认值，然后点击 **Deploy** 按钮。构建命令、发布目录与工具版本都来自仓库里的 `netlify.toml`，因此这里不需要再手工填写。

### 第 12 步：查看站点

部署完成后，点击指向已发布站点的链接即可访问。

之后每次从本地仓库推送改动，Netlify 都会重新构建并部署站点。Netlify 会为每个拉取请求生成预览部署，预览也使用同一份 `netlify.toml`。

## 后续配置

**自定义域名**：在站点的 **Domain management** 中添加域名并把 DNS 指向 Netlify，证书由 Netlify 自动签发与续期；域名生效后 `${URL}` 会变为该域名，配置文件无需改动。

**重定向**：Netlify 支持在 `netlify.toml` 中写 `[[redirects]]` 区段，也可以使用仓库根目录的 `_redirects` 文件；Hugo 自身的页面别名同样会生成跳转页面。

## 相关资源

- [Netlify 通用文档](https://docs.netlify.com/)
- [自定义域名设置](https://docs.netlify.com/domains-https/custom-domains/)
