+++
title = "os.Getenv"
linkTitle = "Getenv"
description = "返回环境变量的值；若该环境变量未设置，则返回空字符串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/os/getenv/"

[params.functions_and_methods]
signatures = ["os.Getenv VARIABLE"]
returnType = "string"
aliases = ["getenv"]
+++

## 这一页解决什么问题

把**构建环境**里的信息带进模板：CI 流水线号、构建时间戳、部署的环境名（`staging`/`production`）。用环境变量而不是改配置文件，可以让同一份内容在本地与流水线上产出可区分的页面。

## 什么时候用，什么时候别用

**该用**：

- 从 CI/CD 注入的值（版本号、提交号、环境名）；
- 需要「本地为空、线上有值」的行为。

**别用**：

- 站点自身可配置的参数 → 用 `site.Params`（写在 `hugo.toml` 里，可被使用者覆盖）；
- 读取文件内容 → 用 [`os.ReadFile`](/functions/os/readfile/)；
- 想取构建时间 → 用 [`time.Now`](/functions/time/now/)。

> [!WARNING]
> 出于安全策略，`os.Getenv` **默认只允许**访问 `CI` 和以 `HUGO_` 开头的变量。访问其它变量（例如 `HOME`、`USER`）**不是返回空字符串，而是直接让构建失败**（实测见下文）。这不是「取不到值」，是「不允许取」。

## 用法

### 安全性

默认情况下，使用 `os.Getenv` 函数时 Hugo 允许访问：

- `CI` 环境变量
- 任何以 `HUGO_` 开头的环境变量

要访问其它环境变量，请调整项目配置。例如，允许访问 `HOME` 与 `USER` 环境变量：

```toml
[security.funcs]
getenv = ['^HUGO_', '^CI$', '^USER$', '^HOME$']
```

更多信息请参见[配置安全性][configure security]。

### 示例

```go-html-template
{{ getenv "HOME" }} → /home/victor
{{ getenv "USER" }} → victor
```

构建项目时可以传入值：

```sh
MY_VAR1=foo MY_VAR2=bar hugo

OR

export MY_VAR1=foo
export MY_VAR2=bar
hugo
```

然后在模板中取出这些值：

```go-html-template
{{ getenv "MY_VAR1" }} → foo
{{ getenv "MY_VAR2" }} → bar
```

[configure security]: /configuration/security/

## 完整示例（实测）

`hugo.toml` 使用默认安全配置；构建前设置环境变量 `HUGO_ZH_TEST=hello-from-env`（`HUGO_` 前缀默认在白名单里）。

```go-html-template {file="layouts/_partials/build-env.html"}
[{{ getenv "HUGO_ZH_TEST" }}]|[{{ getenv "HUGO_NOPE" }}]
```

Hugo 0.167.0 实测输出：

```text
[hello-from-env]|[]
```

**你应当看到什么**：已设置的白名单变量取到值；`HUGO_NOPE` 虽在白名单里但没设置，返回**空字符串**（这是「未设置」的正常行为）。

配置 `[security.funcs] getenv = ['^HUGO_', '^CI$', '^MY_TEST_VAR$']` 后，实测 `{{ getenv "MY_TEST_VAR" }}` 在设置该变量时返回其值，未设置时返回空字符串。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 变量在白名单内且已设置（实测 `HUGO_ZH_TEST`） | 变量值 | 否 |
| 变量在白名单内但未设置（实测 `HUGO_NOPE`、`CI`） | `""`（空字符串） | 否 |
| 变量**不在**白名单（实测 `HOME`，默认配置） | —— | **是，构建失败**：`error calling getenv: access denied: "HOME" is not whitelisted in policy "security.funcs.getenv"; the current security configuration is:` |
| 在白名单里补上该变量（实测 `[security.funcs] getenv=[…,'^MY_TEST_VAR$']`） | 正常取到值 / 未设置时返回空串 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `access denied: "HOME" is not whitelisted in policy "security.funcs.getenv"`，整站构建失败 | 变量不在安全白名单里（实测默认只放行 `CI` 与 `HUGO_*`） | 在 `[security.funcs] getenv` 里加入对应正则，或换用 `HUGO_` 前缀的变量名 |
| 没报错但结果不对 | 取到的值是空字符串 | 变量确实没设置，或名字拼写/大小写不一致 | 先用 `with` 判断非空再使用；核对变量名 |
| 没报错但结果不对 | 想改成站点参数却被使用者覆盖 | 用环境变量表达的是「构建环境」而不是「站点配置」 | 站点配置类参数改用 `site.Params` |

更多排查入口见[故障排查](/troubleshooting/)。
