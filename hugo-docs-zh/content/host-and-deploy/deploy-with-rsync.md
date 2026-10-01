+++
title = "用 rsync 部署"
linkTitle = "用 rsync 部署"
description = "用 rsync 把 Hugo 构建产物同步到 SSH 主机并脚本化。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/host-and-deploy/deploy-with-rsync/"
+++

## 前提条件

- 一台运行 Web 服务器的网页主机，共享主机环境或 VPS 都可以。
- 可以通过 SSH 访问该主机。
- 一个用 Hugo 构建好、可以正常运行的静态站点。

先说结论：部署整个网站只需要一条形如下面的命令：

```bash
hugo && rsync -avz --delete public/ www-data@ftp.example.com:www/
```

接下来要做的，是把这条命令写进一个 shell 脚本文件，这样构建和部署就简化成执行一次 `./deploy`。

## 把 SSH 公钥复制到主机

为了让登录服务器更安全、更少交互，可以把你的 SSH 密钥上传到服务器。如果你已经在这台服务器上装好了 SSH 公钥，可以直接跳到下一节。

先安装 SSH 客户端。在 Debian 系发行版上执行：

```bash
sudo apt-get install openssh-client
```

然后生成 SSH 密钥。如果主目录下还没有 `.ssh` 目录，先创建它并进入：

```bash
cd && mkdir -p .ssh && cd .ssh
```

接着执行下面的命令，生成一对名为 `rsa_id` 的新密钥：

```bash
ssh-keygen -t rsa -q -C "For SSH" -f rsa_id
```

命令会提示你输入 passphrase（口令），这是额外一层保护。输入你想用的口令，并在再次提示时重复输入；如果不想要口令就直接留空。不设口令可以让你在非交互的情况下传输文件——登录时不会被要求输入密码，但安全性会略低一些。

为了让登录更方便，可以在 SSH 的 `config` 文件中为网页主机添加一段定义。把 `HOST` 换成主机的 IP 地址或域名，把 `USER` 换成你传输文件时登录网页主机所用的用户名：

```text
Host HOST
     Hostname HOST
     Port 22
     User USER
     IdentityFile ~/.ssh/rsa_id
```

然后用 `ssh-copy-id` 命令把 SSH 公钥复制到远端服务器：

```bash
ssh-copy-id -i rsa_id.pub USER@HOST.com
```

现在就可以直接连接远端服务器了：

```bash
ssh user@host
```

既然已经能用 SSH 密钥登录，接下来创建一个脚本，把 Hugo 站点的部署自动化。

## 编写部署脚本

在 Hugo 项目根目录下新建一个名为 `deploy` 的脚本文件，写入以下内容，并把 `USER`、`HOST`、`DIR` 换成你自己的值：

```bash
#!/bin/sh
USER=my-user
HOST=my-server.com
DIR=my/directory/to/example.com/   # 网站文件应该放到的目录

hugo build && rsync -avz --delete public/ ${USER}@${HOST}:${DIR} # 服务器上不在本地 public 目录里的内容都会被删除

exit 0
```

注意 `DIR` 是相对远端用户主目录的路径。如果你必须指定完整路径（例如服务器上的 `/var/www/mysite/`），就要把命令行里的 `~/${DIR}` 改成 `${DIR}`；大多数情况下用不到。

保存并关闭文件，然后给 `deploy` 文件加上可执行权限：

```bash
chmod +x deploy
```

## 运行部署

以后只要执行下面这一条命令，就能部署并更新网站：

```bash
./deploy
```

站点会自动构建并部署，输出类似：

```text
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

你还可以把其他处理任务（例如压缩图片、校验链接）一并加进这个部署脚本。
