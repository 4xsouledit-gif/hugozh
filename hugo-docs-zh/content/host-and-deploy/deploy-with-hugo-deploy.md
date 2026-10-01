+++
title = "用 hugo deploy 部署"
linkTitle = "用 hugo deploy 部署"
description = "用 hugo deploy 把站点同步到对象存储的完整步骤。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/host-and-deploy/deploy-with-hugo-deploy/"
+++

`hugo deploy` 命令可以把你的站点部署到 Amazon S3、Azure Blob Storage 或 Google Cloud Storage。

> **说明：** 该功能需要 deploy 或 extended/deploy 版本的 Hugo，详见[安装 Hugo](/installation/)。

## 前提条件

1. 已经完成[快速开始](/getting-started/quick-start/)，或者已经有一个准备部署上线的 Hugo 站点。
2. 拥有要部署到的服务商账号：AWS、Azure 或 Google Cloud。
3. 已经完成身份认证：
   - **AWS**：安装 CLI 后执行 `aws configure`。
   - **Azure**：安装 CLI 后执行 `az login`。
   - **Google Cloud**：安装 SDK 后执行 `gcloud auth login`。

   三种服务都支持多种认证方式，包括通过环境变量提供凭据。
4. 已经创建用于部署的存储桶（bucket）。如果希望站点对外公开，还要把存储桶配置为可公开读取的静态网站。

## 配置部署目标

在项目配置文件中创建部署目标。必填参数只有名称 `name` 和地址 `url`：

```toml
[deployment]
  [[deployment.targets]]
    name = 'production'
    url = 's3://my_bucket?region=us-west-1'
```

## 执行部署

向某个目标部署：

```bash
hugo deploy [--target=<target name>]
```

该命令会把本地发布目录（默认是 `public`）的内容与目标存储桶同步。不指定目标时，Hugo 部署到配置中的第一个目标。

更多命令行选项见 `hugo help deploy` 或[命令文档](/commands/)。

### 生成文件清单

`hugo deploy` 会遍历本地发布目录和远端存储桶，各自生成一份文件清单。哪些文件纳入、哪些排除，由部署目标的配置决定：

- `include`：默认跳过所有文件，只保留匹配该模式的文件。
- `exclude`：跳过匹配该模式的文件。

> **说明：** 生成本地清单时，Hugo 会跳过 `.DS_Store` 文件和以点号开头的隐藏目录（例如 `.git`），但 `.well-known` 目录例外——如果存在就会被遍历。

### 比较文件清单

Hugo 会比较本地与远端两份清单，确定需要做哪些改动。它先比较文件名；如果两边都存在，再比较文件大小和 MD5 校验和。任何差异都会触发重新上传，而远端存在、本地已不存在的文件会被删除。

> **说明：** 因 `include` / `exclude` 规则被排除的远端文件不会被删除。

`--force` 标志会强制重新上传所有文件，即使 Hugo 没有发现本地与远端的差异。

`--confirm` 或 `--dryRun` 标志会让 Hugo 先显示检测到的差异，然后暂停或直接停止。

### 同步

最后，Hugo 把变更应用到远端存储桶：上传缺失或已变化的文件，删除本地已不存在的远端文件。上传文件的头部信息会依据匹配器（matchers）配置在远端设置。

> **说明：** 为防止误删数据，Hugo 默认最多删除 256 个远端文件。可以用 `--maxDeletes` 标志覆盖这一上限。

## 进阶配置

匹配器、缓存控制等进阶选项，请参阅官方文档中关于部署配置的章节。
