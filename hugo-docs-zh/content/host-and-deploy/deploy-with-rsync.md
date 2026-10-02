+++
title = "用 rsync 部署"
linkTitle = "用 rsync 部署"
description = "用 rsync 把 public/ 同步到 SSH 主机：配置免密登录、写一个可重复执行的 deploy 脚本，以及权限、误删、行尾等常见故障。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/host-and-deploy/deploy-with-rsync/"

[params.teach]
difficulty = "入门"
time = "20–30 分钟"
prereq = [
  "本地 `hugo` 能构建成功，`public/` 里有内容",
  "一台能通过 SSH 登录的网页主机（VPS 或共享主机），并知道登录用户名与主机地址",
  "本机有 `ssh` 与 `rsync` 两个命令",
]
outcomes = [
  "把 SSH 公钥复制到主机，实现不用每次输密码的登录",
  "写一个 `deploy` 脚本，把「构建 + 同步」合并成一条命令",
  "说出 `--delete` 的作用与风险，并在上线前确认目标目录归这个站点独占",
  "遇到 `Permission denied`、`code 23`、`bad interpreter` 一类报错时，知道先查哪一环",
]
next = ["/host-and-deploy/deploy-with-rclone/", "/host-and-deploy/deploy-with-hugo-deploy/", "/troubleshooting/"]
+++

## 这一页解决什么问题

`hugo` 构建完之后，产物只在本机。这一页解决的是**把 `public/` 通过 SSH 同步到网页主机，并让它变成一个能打开的网址**，全过程可重复执行——准备好之后，以后发布只需要敲一条 `./deploy`。

它适合「能 SSH 登录主机、希望用脚本控制发布」的场景。选择建议：

- 主机能用 SSH 登录、并且本机是 macOS 或 Linux（自带 `rsync`）→ 用本页；
- 主机只提供 SFTP、不方便登录 shell → [用 rclone 部署](/host-and-deploy/deploy-with-rclone/)；
- 目标是对象存储（S3、Azure Blob、Google Cloud Storage）→ [用 hugo deploy 部署](/host-and-deploy/deploy-with-hugo-deploy/)。

## 从本地 public/ 到线上可访问

| 步骤 | 你做什么 | 你应当看到什么 |
| --- | --- | --- |
| 1 | 在本机执行 `hugo` | 退出码 0；`public/index.html` 存在 |
| 2 | 把 SSH 公钥复制到主机（本页下一节） | `ssh user@host` 不再要求输入密码 |
| 3 | 写 `deploy` 脚本并 `chmod +x deploy` | 用编辑器打开确认三个变量已改成你自己的值，且脚本在项目根目录 |
| 4 | 执行 `./deploy` | 终端先出现 Hugo 的构建统计，随后是 rsync 的 `sending incremental file list` 与文件列表 |
| 5 | 打开网站首页 | 页面正常，样式与图片都在；抽查一个子页面也正常 |

`./deploy` 里同时做了两件事：`hugo build` 生成产物，`rsync` 把产物搬过去。任何一步失败都会中断后面的步骤，因此看到「构建统计」就说明前半段已经成功。

## 前提条件

- 一台运行 Web 服务器的网页主机，共享主机环境或 VPS 都可以。
- 可以通过 SSH 访问该主机。
- 一个用 Hugo 构建好、可以正常运行的静态站点。

先说结论：部署整个网站只需要一条形如下面的命令：

```txt
hugo && rsync -avz --delete public/ www-data@ftp.topologix.fr:~/www/
```

接下来要做的，是把这条命令写进一个 shell 脚本文件，这样构建和部署就简化成执行一次 `./deploy`。

### 你要填的变量

本页各步骤里需要替换的值只有这些：

| 变量 | 填什么 | 填错的后果 |
| --- | --- | --- |
| `HOST` | 主机域名或 IP | 连接超时，或连到了错误的机器 |
| `USER` | 传输文件时登录网页主机的用户名 | `Permission denied` |
| `DIR` | 网站文件应该放到的目录（相对远端用户主目录） | 文件传上去了，但网站看不到更新 |
| `rsa_id` / `rsa_id.pub` | 密钥对文件名，可自定义 | `IdentityFile` 指向不存在的文件时，登录仍要求输密码 |
| 站点地址 `baseURL` | 最终对外域名 | 页面能打开，但样式与站内链接指向错误地址 |

## 把 SSH 公钥复制到主机

为了让登录服务器更安全、更少交互，可以把你的 SSH 密钥上传到服务器。如果你已经在这台服务器上装好了 SSH 公钥，可以直接跳到下一节。

先安装 SSH 客户端。在 Debian 系发行版上执行：

```sh {file="install-openssh.sh"}
sudo apt-get install openssh-client
```

然后生成 SSH 密钥。如果主目录下还没有 `.ssh` 目录，先创建它并进入：

```txt
~$ cd && mkdir .ssh & cd .ssh
```

> [!TIP]
> 行首的 `~$` 是命令提示符，不是你需要输入的字符。另外 `mkdir .ssh` 在目录已存在时会报 `File exists`，改用 `mkdir -p .ssh` 可以忽略这种情况。

接着执行下面的命令，生成一对名为 `rsa_id` 的新密钥：

```txt
~/.ssh/$ ssh-keygen -t rsa -q -C "For SSH" -f rsa_id
```

命令会提示你输入 passphrase（口令），这是额外一层保护。输入你想用的口令，并在再次提示时重复输入；如果不想要口令就直接留空。不设口令可以让你在非交互的情况下传输文件——登录时不会被要求输入密码，但安全性会略低一些。

为了让登录更方便，可以在 SSH 的 `config` 文件中为网页主机添加一段定义。把 `HOST` 换成主机的 IP 地址或域名，把 `USER` 换成你传输文件时登录网页主机所用的用户名：

```txt
~/.ssh/$ cat >> config <<EOF
Host HOST
     Hostname HOST
     Port 22
     User USER
     IdentityFile ~/.ssh/rsa_id
EOF
```

这段就是「把下面几行追加到 `~/.ssh/config` 文件末尾」。如果你更喜欢用编辑器，直接在该文件里写入同样五行内容、保存即可，效果一致；Windows 的 PowerShell 不支持 `<<EOF` 这种写法，请改用编辑器方式。

然后用 `ssh-copy-id` 命令把 SSH 公钥复制到远端服务器：

```bash
ssh-copy-id -i rsa_id.pub USER@HOST.com
```

现在就可以直接连接远端服务器了：

```txt
~$ ssh user@host
Enter passphrase for key '/home/mylogin/.ssh/rsa_id':
```

**你应当看到什么**：`ssh user@host` 之后直接进入远端 shell（设了口令时先提示输入口令），不再要求输入账号密码。如果仍然提示 `Permission denied (publickey)`，说明公钥没有真正落到远端的 `~/.ssh/authorized_keys`，回到 `ssh-copy-id` 这一步重做。

既然已经能用 SSH 密钥登录，接下来创建一个脚本，把 Hugo 站点的部署自动化。

## 编写部署脚本

在 Hugo 项目根目录下新建一个名为 `deploy` 的脚本文件：

```txt
~/websites/topologix.fr$ editor deploy
```

写入以下内容，并把 `USER`、`HOST`、`DIR` 换成你自己的值：

```sh
#!/bin/sh
USER=my-user
HOST=my-server.com
DIR=my/directory/to/topologix.fr/   # 网站文件应该放到的目录

hugo build && rsync -avz --delete public/ ${USER}@${HOST}:~/${DIR} # 服务器上不在本地 public 目录里的内容都会被删除

exit 0
```

注意 `DIR` 是相对远端用户主目录的路径。如果你必须指定完整路径（例如服务器上的 `/var/www/mysite/`），就要把命令行里的 `~/${DIR}` 改成 `${DIR}`；大多数情况下用不到。

> [!WARNING]
> `--delete` 会让远端目录与本地 `public/` **完全一致**：远端存在、本地没有的文件会被删除。因此 `DIR` 必须是这个站点独占的目录。第一次运行前，先确认远端目录里没有别的站点或手写文件；不确定时可以先加 `--dry-run` 跑一遍，它会列出将要删除的文件而不真正动手。

保存并关闭文件，然后给 `deploy` 文件加上可执行权限：

```txt
~/websites/topologix.fr$ chmod +x deploy
```

## 运行部署

以后只要执行下面这一条命令，就能部署并更新网站：

```txt
~/websites/topologix.fr$ ./deploy
```

站点会自动构建并部署，输出类似：

```txt
Started building sites ...
Built site for language en:
0 draft content
0 future content
0 expired content
5 pages created
0 non-page files copied
0 paginator pages created
0 tags created
0 categories created
total in 56 ms
sending incremental file list
404.html
index.html
index.xml
sitemap.xml
posts/
posts/index.html

sent 9,550 bytes  received 1,708 bytes  7,505.33 bytes/sec
total size is 966,557  speedup is 85.86
```

**你应当看到什么**：前半段是 Hugo 的构建统计（`5 pages created` 一类的行数应与你的站点规模相符），后半段是 rsync 的传输清单与总计。之后再跑一次，如果内容没有变化，rsync 只会传输少量文件甚至什么都不传——这正是它比整站上传更快的原因。

> **上面的输出是上游旧版 Hugo 的原文，措辞会随版本变化。** 实测 v0.167.0 的构建统计是 `Start building sites …` 加一张 `Pages │ 1965` 的表格，没有 `Started building sites ...` / `5 pages created` 这几行。**看行数与结构，不要逐字对照措辞**；想先确认自己这一版的输出，在项目里跑一次即可：
>
> ```bash
> hugo --renderToMemory
> ```
>
> 决定部署成败的是后半段 rsync 的传输清单与退出码，不是 Hugo 的文案。

你还可以把其他处理任务（例如压缩图片、校验链接）一并加进这个部署脚本。

## 失败时：典型报错与排查入口

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `rsync: command not found` | 本机没装 rsync（Windows 默认也没有） | macOS/Linux 用系统包管理器安装；Windows 可在 WSL 或 Git Bash 中执行本页命令 |
| `Permission denied (publickey)` | 公钥没上传成功、`IdentityFile` 路径不对、或用户名不对 | 重跑 `ssh-copy-id`；核对 `~/.ssh/config` 里的 `Hostname` 与 `User`；用 `ssh -v user@host` 看握手到哪一步失败 |
| `ssh: connect to host ... port 22: Connection timed out` | 主机地址、端口写错，或防火墙/安全组未放行 | 与主机商确认 SSH 端口；先在浏览器/终端外确认主机在线 |
| `rsync error: some files/attrs were not transferred`（常带 `code 23`） | 远端目标目录权限不足，或路径不存在 | 登录远端确认 `DIR` 存在且对 `USER` 可写；必要时先 `mkdir -p` 建目录 |
| 脚本执行报 `bad interpreter` / `^M` 一类字样 | 脚本被保存成了 Windows 行尾（CRLF） | 把文件行尾改成 LF（编辑器里切换，或在 `.gitattributes` 中声明 `*.sh text eol=lf`） |
| `./deploy: Permission denied` | 忘了 `chmod +x deploy` | 执行 `chmod +x deploy`；Windows 的 Git Bash 下也可以直接 `bash deploy` |
| 命令跑完没有报错，网站却没变化 | `DIR` 不是 Web 服务器的根目录，或 `baseURL` 不对 | 登录远端确认文件落在 Web 根下；把配置里的 `baseURL` 改成最终域名后重新部署 |

构建阶段（`hugo` 本身）失败时，问题不在部署工具，见[故障排查](/troubleshooting/)；想在上线前先体检一遍站点，见[审计](/troubleshooting/audit/)。
