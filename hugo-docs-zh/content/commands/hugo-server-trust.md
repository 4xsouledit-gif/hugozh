+++
title = "hugo server trust"
linkTitle = "hugo server trust"
description = "hugo server trust：把本地 CA 装入系统信任库。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/commands/hugo_server_trust/"
+++

`hugo server trust` 是 [hugo server](/commands/hugo-server/) 的子命令，作用是把本地 CA 证书安装到系统信任库中。

## 用法

```text
hugo server trust [flags] [args]
```

它属于 `hugo server` 命令：服务器在用 `--tlsAuto` 生成并启用本地受信任证书时，会创建一套本地 CA。只有在操作系统的信任库里登记过这套 CA，浏览器才会把服务器提供的 HTTPS 证书当作可信证书，从而不再弹出安全警告。本命令做的正是这一步登记工作。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h, --help` | 显示 trust 的帮助信息 |
| `--uninstall` | 卸载本地 CA，但不删除它 |

### 继承自父命令的选项

`hugo server trust` 会继承 `hugo` 的选项，常用者有 `--config`、`--configDir`、`--logLevel`、`--quiet`、`-s` / `--source`、`--themesDir`、`--clock`、`-e` / `--environment`、`-M` / `--renderToMemory`、`-d` / `--destination`、`--noBuildLock` 与 `--ignoreVendorPaths`。

## 示例

把本地 CA 安装到系统信任库：

```bash
hugo server trust
```

从系统信任库中移除本地 CA，但保留证书文件本身：

```bash
hugo server trust --uninstall
```

## 说明

- 安装到系统信任库通常需要相应的系统权限，请留意执行结果中的提示。
- `--uninstall` 只做卸载，不会删除本地 CA 文件；需要重新启用时，再次执行 `hugo server trust` 即可。
- 该命令接收可选参数 `[args]`，具体用途以 `hugo server trust --help` 的输出为准。
- 证书相关的文件路径由 [hugo server](/commands/hugo-server/) 的 `--tlsCertFile` 与 `--tlsKeyFile` 选项决定。
- 如果只是在本地预览，并不需要 HTTPS，那么完全可以跳过本命令，直接使用 `hugo server`。
