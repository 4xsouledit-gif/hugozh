+++
title = "用 rclone 部署"
linkTitle = "用 rclone 部署"
description = "用 rclone 把 public/ 同步到支持 SFTP、S3 等协议的任意主机：连接参数、远端配置、验证方法与误删排查。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/host-and-deploy/deploy-with-rclone/"

[params.teach]
difficulty = "入门"
time = "15–25 分钟"
prereq = [
  "本地 `hugo` 能构建成功，`public/` 里有内容",
  "一台运行 Web 服务器的主机，以及可用的登录信息（SFTP 密码或密钥）",
  "已经安装 rclone，并能运行 `rclone version`",
]
outcomes = [
  "用一行 `rclone sync` 把 `public/` 同步到远端目录，并确认站点可访问",
  "用 `rclone config` 建一个命名远端，把连接参数从命令行里挪出去",
  "在真正同步前用 `--dry-run` 核对将要执行的操作，避免误删远端文件",
  "分清「文件没传上去」与「传上去了但网站不对」两类失败",
]
next = ["/host-and-deploy/deploy-with-rsync/", "/host-and-deploy/deploy-with-hugo-deploy/", "/troubleshooting/"]
+++

## 这一页解决什么问题

`hugo` 构建完之后，产物只在本机。这一页解决的是**把 `public/` 同步到一台你能通过 SFTP、S3 等协议访问的主机**，并让它变成一个能打开的网址。

它适合「有网页主机、但没有 SSH 命令行或不想写脚本」的场景：rclone 一条命令就能完成同步，不必依赖平台的 Git 集成。相对另外两条路线：

- 主机只提供 SFTP/FTP/WebDAV 等协议、不方便用 SSH 时，用 rclone 最省事；
- 主机能 SSH 登录、又想脚本化定时发布时，[rsync](/host-and-deploy/deploy-with-rsync/) 更常见；
- 目标是 S3、Azure Blob Storage 或 Google Cloud Storage 时，[hugo deploy](/host-and-deploy/deploy-with-hugo-deploy/) 不需要额外装工具。

## 从本地 public/ 到线上可访问

| 步骤 | 你做什么 | 你应当看到什么 |
| --- | --- | --- |
| 1 | 执行 `hugo build --gc --minify` | 退出码 0；`public/index.html` 存在 |
| 2 | 用 `rclone config` 建一个命名远端（或直接写连接参数） | `rclone listremotes` 能列出你刚建的远端名 |
| 3 | 先加 `--dry-run` 跑一次 `rclone sync` | 终端列出将要复制/删除的文件，实际没有改动 |
| 4 | 去掉 `--dry-run` 正式同步 | 终端显示传输的文件与字节数，没有 error |
| 5 | 打开网站首页 | 页面正常，样式与图片都在 |

第 3 步不是可选项。`rclone sync` 的语义是**让目标端与本地完全一致**：目标端多出来的文件会被删除（见下文「常见坑」）。

## 前提条件

- 一台运行 Web 服务器的网页主机，共享主机环境或 VPS 都可以。
- 能通过 rclone [支持的协议](https://rclone.org/#providers)访问该主机，例如 SFTP。
- 一个用 Hugo 构建好、可以正常运行的静态站点。
- 运行部署的操作系统在 rclone 支持范围内。
- 已经[安装 rclone](https://rclone.org/install/)。

> [!NOTE]
> 熟悉 rclone 之后，如果愿意，可以去掉下面命令中的 `--interactive`；`--gc` 与 `--minify` 也都是可选参数。

## 快速开始

先说结论：不做任何额外配置，也能从任何受支持的操作系统部署整个网站。以 SFTP 为例：

```bash
hugo build --gc --minify
rclone sync --interactive --sftp-host sftp.example.com --sftp-user www-data --sftp-ask-password public/ :sftp:www/
```

第一条命令构建站点：`--gc` 让 Hugo 在构建后做垃圾回收，`--minify` 压缩输出的 HTML、CSS、JS 等资源。第二条命令把本地 `public/` 目录同步到远端的 `www/` 目录，其中 `:sftp:` 表示使用 SFTP 协议，`--sftp-ask-password` 会让 rclone 交互式地询问密码。

这种方式把连接信息全部写在命令行上，只适合偶尔部署一次的场景。

### 你要填的变量

直接把参数写在命令行时，要替换的是这几项：

| 参数 | 填什么 | 填错的后果 |
| --- | --- | --- |
| `--sftp-host` | 主机地址，例如 `sftp.example.com` | 连接超时或解析失败，rclone 直接报错退出 |
| `--sftp-user` | 登录网页主机用的用户名 | 认证失败：`unable to authenticate` |
| `--sftp-ask-password` | 不需要值；加上它让 rclone 提示输入密码 | 省略时需要另外提供密码/密钥，否则认证失败 |
| `public/` | 本地发布目录，由配置项 `publishDir` 决定 | 源目录为空时会把目标端清空（见「常见坑」） |
| `:sftp:www/` | 远端目标路径，`www/` 是远端用户主目录下的相对路径 | 传到错误目录，网站看不到更新 |

## 简化 rclone 用法

每次都写一长串参数并不方便。最简单的做法是运行：

```bash
rclone config
```

这条命令会引导你把主机地址、用户名、认证方式等保存成一个「remote」（远端配置）。rclone 官方文档里提供了[配置 SFTP 远端的完整示例](https://rclone.org/sftp/)。

假设你把远端命名为 `hugo-www`，上面那组命令就可以简化成：

```bash
hugo build --gc --minify
rclone sync --interactive public/ hugo-www:www/
```

执行完这些命令（并回答所有提示）之后，打开网站确认一下，就能看到站点已经部署好了。

**你应当看到什么**：`rclone sync` 会列出每个被传输的文件名；最后一行给出传输的字节数与耗时。再执行一次同样的命令，由于文件没有变化，它应当显示**没有文件需要传输**——这是「同步确实生效」的最好证据，说明本地与远端已经一致。

## 命令组成说明

理解这两条命令的关键在于三个部分：

- `hugo build` 负责生成发布目录。默认是项目根目录下的 `public`，位置由 `publishDir` 决定。如果站点还没能在本地正常构建，先回到[基本用法](/getting-started/basic-usage/)排查。
- `rclone sync` 负责把本地目录的内容复制到远端，源路径和目标路径的写法是「本地目录 远端名:远端目录」。上面例子中的 `www/` 是远端用户主目录下的相对路径。
- `--interactive` 让 rclone 在真正动手之前列出将要执行的操作并等待确认，适合刚上手时使用。

## 失败时：典型报错与排查入口

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `rclone: command not found` / 「不是内部或外部命令」 | rclone 没装或没进 `PATH` | 按 [rclone 安装文档](https://rclone.org/install/)重装，重开终端后 `rclone version` 验证 |
| `Failed to create file system` / `didn't find section in config file` | 远端名拼错，或 `rclone config` 里没保存成功 | 用 `rclone listremotes` 核对名字大小写与冒号写法 |
| `unable to authenticate` / `permission denied` | 用户名、密码或密钥不对；账号无权写目标目录 | 先手工登录一次确认凭据；确认 `www/` 对当前用户可写 |
| 命令跑完没有报错，网站却没变化 | 传到了错误的远端目录（不是 Web 根目录），或浏览器/CDN 缓存 | 用 `rclone ls hugo-www:www/` 列出远端文件，确认 `index.html` 在 Web 根下 |
| 页面能打开但样式、图片丢失 | `baseURL` 与最终访问地址不一致，或模板里硬编码了绝对地址 | 把配置里的 `baseURL` 改成最终域名后重新构建、重新同步 |
| 远端多出来的文件被删了 | `rclone sync` 的语义是让目标与源**完全一致**，会删除目标端多余文件 | 先用 `--dry-run` 预览；目标目录里若有其他站点文件，应改用只增不删的传输方式或换个目标目录 |

> [!WARNING]
> `rclone sync` 是单向同步且会删除目标端的多余文件。上线前请确认 `:sftp:www/` 指向的是「这个站点独占的目录」，不要指向与其他站点共用的 Web 根目录，否则一次同步就可能删掉别人的文件。第一次同步务必加 `--dry-run`。

构建阶段就失败（`hugo` 报错、页面缺失）与部署无关，见[故障排查](/troubleshooting/)与[常见问题](/troubleshooting/faq/)。

## 部署之后

- 打开站点首页，确认样式、图片和导航都正常。如果页面能打开但样式丢失，先检查 `baseURL` 是否与最终访问地址一致。
- 如果站点使用了分页、标签页等需要多级路径的页面，顺手抽查一两个，确认远端目录层级完整。
- 部署脚本稳定之后，可以把 `rclone sync` 这一步接进你自己的发布流程，或者去掉 `--interactive` 以便无人值守执行。
