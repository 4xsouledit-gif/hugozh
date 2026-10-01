+++
title = "托管与部署"
linkTitle = "托管与部署"
description = "把 Hugo 站点发布到托管平台或对象存储的部署指南。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/host-and-deploy/"
+++

## 本章内容

Hugo 生成的是纯静态文件，所以「部署」本质上就是把构建产物送到一台会回应 HTTP 请求的服务器或对象存储上。本部分从两个角度介绍这件事。

**第一条线是通用部署命令。** 站点构建完成后，用命令行工具把发布目录同步到远端：

- [用 hugo deploy 部署](/host-and-deploy/deploy-with-hugo-deploy/)：Hugo 内置的部署命令，可同步到 Amazon S3、Azure Blob Storage 或 Google Cloud Storage。
- [用 rclone 部署](/host-and-deploy/deploy-with-rclone/)：适合支持 SFTP、S3 等协议的任意主机。
- [用 rsync 部署](/host-and-deploy/deploy-with-rsync/)：适合能通过 SSH 访问的 VPS 或共享主机。

**第二条线是托管平台集成。** 把站点源码放进 Git 仓库，由平台在每次推送时自动构建并发布，本地不必执行部署命令：

- [部署到 AWS Amplify](/host-and-deploy/host-on-aws-amplify/)
- [部署到 Azure Static Web Apps](/host-and-deploy/host-on-azure-static-web-apps/)
- [部署到 Cloudflare Pages](/host-and-deploy/host-on-cloudflare/)
- [部署到 Codeberg Pages](/host-and-deploy/host-on-codeberg-pages/)

## 部署之前

无论选哪种方式，先确认下面几件事：

1. 站点能在本地正常构建和预览，参见[快速开始](/getting-started/quick-start/)与[基本用法](/getting-started/basic-usage/)。
2. 清楚构建命令与发布目录。构建命令通常是 `hugo build`，发布目录默认是项目根目录下的 `public`，其位置由[配置](/configuration/)中的 `publishDir` 决定。
3. 站点根地址已经设置正确。页面里的绝对链接、站点地图和 RSS 都依赖 `baseURL`；如果打算绑定自定义域名，最好在部署前就把它改成最终地址，免得上线后再改一遍。
4. 知道构建产物会出现在哪里。托管平台的「输出目录」「artifacts」一类设置，指的就是这个目录。

## 关于构建产物

Hugo 每次构建都会重新生成发布目录，因此：

> **注意：** 不要把发布目录（`public`）的内容提交到 Git 仓库，Hugo 会在下次构建时重新创建它。正确做法是在 `.gitignore` 中忽略它，只提交源码与配置文件。

托管平台只需要「源码加构建命令」，不需要你提交构建结果；把产物一起提交反而容易让仓库里留下过期文件，掩盖真正的构建问题。

## 各平台页面的共同结构

托管平台的界面和术语各不相同，但每个平台页面的组织方式是一致的：

- **前置条件**：需要哪些账号、仓库，以及本地要先完成什么。
- **仓库与配置**：把平台要求的配置文件（构建脚本、工作流文件）放到正确路径下，然后提交推送。
- **构建命令与输出目录**：平台执行什么命令、从哪里取走产物。多数平台直接用 `public` 作为输出目录。
- **域名与重定向**：首次部署后会拿到一个临时域名；绑定自定义域名、处理 404 与重定向通常需要额外设置。

## 域名与重定向注意事项

- **自定义域名**：临时域名只在测试阶段有意义。绑定自定义域名后，记得把 `baseURL` 改成该域名并重新部署，否则页面内的绝对链接仍指向临时地址。
- **404 页面**：静态托管平台一般提供自定义 404 的入口。在 `layouts/` 中定义 404 模板，构建后会得到 `public/404.html`，再在平台侧把它设为错误页。
- **重定向与尾斜杠**：Hugo 默认输出以 `/` 结尾的 URL。如果平台强制去除尾斜杠或做大小写归一化，可能出现重定向循环或 404。上线后建议抽查几个页面。
- **缓存**：静态资源的缓存策略由平台控制，重新部署不等于所有访客立刻拿到新文件。更新样式或图片后要留意旧缓存的影响。
