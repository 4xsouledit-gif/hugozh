+++
title = "用 rclone 部署"
linkTitle = "用 rclone 部署"
description = "用 rclone 把 Hugo 构建产物同步到远端主机。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/host-and-deploy/deploy-with-rclone/"
+++

## 前提条件

- 一台运行 Web 服务器的网页主机，共享主机环境或 VPS 都可以。
- 能通过 rclone 支持的某种协议访问该主机，例如 SFTP。
- 一个用 Hugo 构建好、可以正常运行的静态站点。
- 运行部署的操作系统在 rclone 支持范围内。
- 已经安装 rclone。

> **提示：** 熟悉 rclone 之后，如果愿意，可以去掉下面命令中的 `--interactive`；`--gc` 与 `--minify` 也都是可选参数。

## 快速开始

先说结论：不做任何额外配置，也能从任何受支持的操作系统部署整个网站。以 SFTP 为例：

```bash
hugo build --gc --minify
rclone sync --interactive --sftp-host sftp.example.com --sftp-user www-data --sftp-ask-password public/ :sftp:www/
```

第一条命令构建站点：`--gc` 让 Hugo 在构建后做垃圾回收，`--minify` 压缩输出的 HTML、CSS、JS 等资源。第二条命令把本地 `public/` 目录同步到远端的 `www/` 目录，其中 `:sftp:` 表示使用 SFTP 协议，`--sftp-ask-password` 会让 rclone 交互式地询问密码。

这种方式把连接信息全部写在命令行上，只适合偶尔部署一次的场景。

## 简化 rclone 用法

每次都写一长串参数并不方便。最简单的做法是运行：

```bash
rclone config
```

这条命令会引导你把主机地址、用户名、认证方式等保存成一个「remote」（远端配置）。rclone 官方文档里提供了配置 SFTP 远端的完整示例。

假设你把远端命名为 `hugo-www`，上面那组命令就可以简化成：

```bash
hugo build --gc --minify
rclone sync --interactive public/ hugo-www:www/
```

执行完这些命令（并回答所有提示）之后，打开网站确认一下，就能看到站点已经部署好了。

## 命令组成说明

理解这两条命令的关键在于三个部分：

- `hugo build` 负责生成发布目录。默认是项目根目录下的 `public`，位置由 `publishDir` 决定。如果站点还没能在本地正常构建，先回到[基本用法](/getting-started/basic-usage/)排查。
- `rclone sync` 负责把本地目录的内容复制到远端，源路径和目标路径的写法是「本地目录 远端名:远端目录」。上面例子中的 `www/` 是远端用户主目录下的相对路径。
- `--interactive` 让 rclone 在真正动手之前列出将要执行的操作并等待确认，适合刚上手时使用。

## 部署之后

- 打开站点首页，确认样式、图片和导航都正常。如果页面能打开但样式丢失，先检查 `baseURL` 是否与最终访问地址一致。
- 如果站点使用了分页、标签页等需要多级路径的页面，顺手抽查一两个，确认远端目录层级完整。
- 部署脚本稳定之后，可以把 `rclone sync` 这一步接进你自己的发布流程，或者去掉 `--interactive` 以便无人值守执行。
