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

## 安全性

默认情况下，使用 `os.Getenv` 函数时 Hugo 允许访问：

- `CI` 环境变量
- 任何以 `HUGO_` 开头的环境变量

要访问其它环境变量，请调整项目配置。例如，允许访问 `HOME` 与 `USER` 环境变量：

```toml
[security.funcs]
getenv = ['^HUGO_', '^CI$', '^USER$', '^HOME$']
```

更多信息请参见[配置安全性][configure security]。

## 示例

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
