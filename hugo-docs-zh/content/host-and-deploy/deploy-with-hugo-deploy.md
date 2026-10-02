+++
title = "用 hugo deploy 部署"
linkTitle = "用 hugo deploy 部署"
description = "把本地 public/ 同步到 S3、Azure Blob Storage 或 Google Cloud Storage：配置部署目标、空跑确认、正式上传，以及报错时的排查入口。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/host-and-deploy/deploy-with-hugo-deploy/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "本地 `hugo` 能构建成功，`public/` 里有内容",
  "一个对象存储账号（AWS、Azure 或 Google Cloud）与已创建的存储桶",
  "会在命令行里配置云服务凭据（`aws configure`、`az login` 或 `gcloud auth login`）",
]
outcomes = [
  "在项目配置里写出一个可用的 `[[deployment.targets]]`，并说清 `name` 与 `url` 各自的作用",
  "先用 `--dryRun` 看清将要上传与删除的文件，再执行正式部署",
  "用 `--maxDeletes`、`include`、`exclude` 避免误删远端文件",
  "部署后在浏览器里确认站点可访问，并判断 403、404、旧页面分别该查哪里",
]
next = ["/host-and-deploy/deploy-with-rclone/", "/host-and-deploy/deploy-with-rsync/", "/configuration/deployment/", "/commands/hugo-deploy/"]
+++

`hugo deploy` 命令可以把你的站点部署到 Amazon S3、Azure Blob Storage 或 Google Cloud Storage。

> [!NOTE]
> 该功能需要 deploy 或 extended/deploy 版本的 Hugo，详见[安装 Hugo](/installation/)。

## 这一页解决什么问题

`hugo` 构建完之后，产物只在本机。这一页解决的是**把 `public/` 送到对象存储、并让它对外可访问**：写一个部署目标、先空跑看清楚 Hugo 打算改什么、再真正上传。

它适合「已经有一个存储桶，只想把文件同步上去」的场景。与另外两条路线相比：

- 用 `hugo deploy`：Hugo 自己比对本地与远端（文件名、大小、MD5），只上传变化的部分，并按匹配器设置远端文件头（例如缓存控制）；
- **别用**它做代码部署或需要执行远端脚本的发布——它只搬文件；需要 SFTP/任意主机时用 [rclone](/host-and-deploy/deploy-with-rclone/) 或 [rsync](/host-and-deploy/deploy-with-rsync/)；
- **别用**它替代构建——`hugo deploy` 不会替你运行 `hugo`，上传的是已经生成的产物。

## 从本地 public/ 到线上可访问

按顺序走完这六步，每一步都给出「你应当看到什么」：

| 步骤 | 你做什么 | 你应当看到什么 |
| --- | --- | --- |
| 1 | 在项目根目录执行 `hugo` | 退出码 0；`public/index.html` 存在且是你期望的首页内容 |
| 2 | 在配置文件中写入 `[[deployment.targets]]`（本页下文） | 配置文件保存后，`hugo deploy` 不再提示找不到目标 |
| 3 | 配置云凭据（`aws configure` / `az login` / `gcloud auth login`） | 对应 CLI 自己的一条读取命令能列出你的存储桶 |
| 4 | 执行 `hugo deploy --dryRun` | 终端列出「将上传」「将删除」的文件清单，且**不做任何改动** |
| 5 | 核对清单后执行 `hugo deploy` | 终端逐行显示上传/删除结果，最后没有 error 级别的输出 |
| 6 | 打开存储桶的静态网站地址（或你绑定的自定义域名） | 首页正常显示，样式与图片都在；抽查一个子页面也正常 |

这里最容易漏的是第 4 步。删除是**不可逆**的：本地 `public/` 里已经不存在的文件，远端会被删除。先用 `--dryRun` 看清清单，是这条路线唯一的安全网。

## 前提条件

1. 已经完成[快速开始](/getting-started/quick-start/)，或者已经有一个准备部署上线的 Hugo 站点。
2. 拥有要部署到的服务商账号：[AWS](https://aws.amazon.com)、[Azure](https://azure.microsoft.com) 或 [Google Cloud](https://cloud.google.com/)。
3. 已经完成身份认证：
   - **AWS**：安装 CLI 后执行 [`aws configure`](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)。
   - **Azure**：安装 CLI 后执行 [`az login`](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli)。
   - **Google Cloud**：安装 SDK 后执行 [`gcloud auth login`](https://cloud.google.com/sdk/gcloud/reference/auth/login)。

   三种服务都支持多种认证方式，包括通过环境变量提供凭据，详见 [gocloud.dev 说明](https://gocloud.dev/howto/blob/#services)。
4. 已经创建用于部署的存储桶（bucket）。如果希望站点对外公开，还要把存储桶配置为可公开读取的静态网站。
   - AWS：[创建存储桶](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html)并[托管静态网站](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
   - Azure：[创建存储容器](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-portal)并[托管静态网站](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
   - Google Cloud：[创建存储桶](https://cloud.google.com/storage/docs/creating-buckets)并[托管静态网站](https://cloud.google.com/storage/docs/hosting-static-website)

> [!TIP]
> 第 4 步的「可公开读取」是很多人卡住的地方：凭据配好、上传成功，但浏览器打开是 403。它不是 Hugo 的问题，而是桶策略没放开匿名读。

## 配置部署目标

在[项目配置](/configuration/deployment/)文件中创建部署目标。必填参数只有名称 `name` 和地址 `url`：

```toml
[deployment]
  [[deployment.targets]]
    name = 'production'
    url = 's3://my_bucket?region=us-west-1'
```

两个字段的分工：

- `name`：给这个目标起的名字，`hugo deploy --target=<target name>` 用它来选择目标；
- `url`：远端位置。方案前缀决定服务商（`s3://`、`azblob://`、`gs://` 等），查询串里可以带服务商参数（上面例子里的 `region`）。

### 你要填的变量

| 变量 | 填什么 | 在哪填 |
| --- | --- | --- |
| `name` | 目标名，例如 `production`、`staging` | 项目配置文件的 `[[deployment.targets]]` 下 |
| `url` | 存储桶地址，含方案前缀与必要的服务商参数 | 同上 |
| 云凭据 | 访问密钥、账号登录态或服务账号 | 云服务 CLI（`aws configure`、`az login`、`gcloud auth login`）或环境变量 |
| 站点地址 | 最终对外地址，即配置里的 `baseURL` | 项目配置文件；绑定自定义域名后必须同步修改 |

## 执行部署

向某个目标部署：

```bash
hugo deploy [--target=<target name>]
```

该命令会把本地发布目录（默认是 `public`）的内容与目标存储桶同步。不指定目标时，Hugo 部署到配置中的第一个目标。

更多命令行选项见 `hugo help deploy` 或[命令文档](/commands/hugo-deploy/)。

### 生成文件清单

`hugo deploy` 会遍历本地发布目录和远端存储桶，各自生成一份文件清单。哪些文件纳入、哪些排除，由部署目标的[配置](/configuration/deployment/)决定：

- `include`：默认跳过所有文件，只保留匹配该模式的文件。
- `exclude`：跳过匹配该模式的文件。

> [!NOTE]
> 生成本地清单时，Hugo 会跳过 `.DS_Store` 文件和以点号开头的隐藏目录（例如 `.git`），但 [`.well-known`](https://en.wikipedia.org/wiki/Well-known_URI) 目录例外——如果存在就会被遍历。

### 比较文件清单

Hugo 会比较本地与远端两份清单，确定需要做哪些改动。它先比较文件名；如果两边都存在，再比较文件大小和 MD5 校验和。任何差异都会触发重新上传，而远端存在、本地已不存在的文件会被删除。

> [!NOTE]
> 因 `include` / `exclude` 规则被排除的远端文件不会被删除。

`--force` 标志会强制重新上传所有文件，即使 Hugo 没有发现本地与远端的差异。

`--confirm` 或 `--dryRun` 标志会让 Hugo 先显示检测到的差异，然后暂停或直接停止。

两个标志的差别值得记住：`--dryRun` 只显示、不执行，也不会等你按键；`--confirm` 会显示清单后停下来等你确认，适合真正要动手但想再看一眼的时候。

### 同步

最后，Hugo 把变更应用到远端存储桶：上传缺失或已变化的文件，删除本地已不存在的远端文件。上传文件的头部信息会依据匹配器（matchers）配置在远端设置。

> [!NOTE]
> 为防止误删数据，Hugo 默认最多删除 256 个远端文件。可以用 `--maxDeletes` 标志覆盖这一上限。

## 验证：部署后你应当看到什么

别只看终端的成功提示，按下面两级确认：

1. **远端确实有文件**：用云服务 CLI 列一遍桶里的对象（例如 `aws s3 ls s3://my_bucket/ --recursive`），应当看到 `index.html`、`404.html`、`sitemap.xml` 与你内容目录对应的子目录。
2. **浏览器确实能访问**：打开桶的静态网站地址或自定义域名。首页、一篇内页、一张图片各点开一次；图片能显示说明相对路径与 `baseURL` 都对得上。

如果第 1 步有文件、第 2 步打不开，问题在访问策略（桶策略、静态网站托管开关、CDN），不在 Hugo。

## 失败时：典型报错与排查入口

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 报错形如 `unknown command "deploy" for "hugo"` | 装的是不含 deploy 功能的 Hugo 版本 | 换成 deploy 或 extended/deploy 版本，见[安装 Hugo](/installation/)；用 `hugo version` 确认 |
| 认证失败：报错里出现凭据相关的字样，或提示找不到默认凭据 | 凭据没配、配置在另一个终端环境、或环境变量没生效 | 重新执行 `aws configure` / `az login` / `gcloud auth login`，然后用对应 CLI 的一条读取命令验证凭据可用 |
| 上传时报权限类错误（`AccessDenied`、403 等） | 凭据有权登录但无权写这个桶 | 检查账号对该桶的写权限；桶策略与 IAM 规则属于服务商侧，链接见本页「前提条件」 |
| 站点能打开首页，子页面或图片 404 | 上传的目标路径与静态网站托管的根路径不一致 | 用 CLI 列出远端对象，核对 `index.html` 是否在托管的根下；必要时调整 `url` 的路径部分 |
| 浏览器 403，但文件确实上传了 | 桶没有开放匿名读取，或静态网站托管没开启 | 回到「前提条件」第 4 步，按服务商文档配置公开读取 |
| 终端显示删除了一大批远端文件 | 本地 `public/` 是空的或不完整（例如构建失败后仍然部署），或 `include`/`exclude` 写错 | 立即停止后续部署；用 `--dryRun` 复现清单，检查 `include`/`exclude`；删除上限由 `--maxDeletes` 控制（默认 256），它是保护而不是修复 |
| 部署成功，但打开还是旧页面 | CDN 缓存或浏览器缓存 | 等待失效、强制刷新；`--invalidateCDN` 的默认行为与匹配器设置在[部署配置](/configuration/deployment/)里 |

`--dryRun` 是这一页最有用的排查工具：它把 Hugo 的完整计划打印出来，且不改动任何远端文件。看不明白结果时，先把 `--dryRun` 的输出保存下来逐行读。

更多云端与部署相关的问题，见[故障排查](/troubleshooting/)与[常见问题](/troubleshooting/faq/)。

## 进阶配置

匹配器、缓存控制等进阶选项，见[配置部署](/configuration/deployment/)；完整命令行选项见 [hugo deploy](/commands/hugo-deploy/)。
