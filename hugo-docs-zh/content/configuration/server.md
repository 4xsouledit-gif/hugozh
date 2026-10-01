+++
title = "服务器配置"
linkTitle = "服务器配置"
description = "配置 Hugo 开发服务器的请求头与重定向规则。"
date = 2026-10-01
weight = 280
source = "https://gohugo.io/configuration/server/"
+++

这些设置只作用于 Hugo 的开发服务器，因此推荐为开发环境单独建立一个配置目录，把服务器配置放在其中：

```text
project/
└── config/
    ├── _default/
    │   └── hugo.toml
    └── development/
        └── server.toml
```

配置目录的用法见 `/configuration/`。

## 默认设置

对于请求了并不存在的 URL，开发服务器默认重定向到 `/404.html`，详见下文的 404 错误一节。

## 重定向键

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `force` | `bool` | `false` | 即使该路径下已存在内容，也强制重定向。 |
| `from` | `string` | 无 | 匹配请求 URL 的 glob 模式。`from` 与 `fromRE` 必须至少设置一个；若两者都设置，URL 必须同时匹配两者。 |
| `fromHeaders` | `map[string][string]` | 无 | 重定向需要匹配的请求头，把 HTTP 头名称映射到待匹配取值的 glob 模式。该映射为空时重定向总是触发。0.144.0 版本新增。 |
| `fromRe` | `string` | 无 | 匹配请求 URL 的正则表达式。`from` 与 `fromRE` 必须至少设置一个；若两者都设置，URL 必须同时匹配两者。正则的捕获组可在 `to` 字段中以 `$1`、`$2` 等引用。0.144.0 版本新增。 |
| `status` | `string` | 无 | 重定向使用的 HTTP 状态码。状态码为 200 时会触发 URL 重写。 |
| `to` | `string` | 无 | 把请求转发到的目标 URL。 |

## 响应头

在每个服务器响应中都加入响应头，便于测试，尤其是内容安全策略（CSP）这类功能：

```toml
[[headers]]
for = '/**'

[headers.values]
X-Frame-Options = 'DENY'
X-XSS-Protection = '1; mode=block'
X-Content-Type-Options = 'nosniff'
Referrer-Policy = 'strict-origin-when-cross-origin'
Content-Security-Policy = 'script-src localhost:1313'
```

`for` 用于匹配请求路径，`headers.values` 下的键值对会原样写入响应头。

## 重定向

可以定义简单的重定向规则：

```toml
[[redirects]]
from = '/myspa/**'
to = '/myspa/'
status = 200
force = false
```

示例中的 `200` 状态码会触发 URL 重写，这通常是单页应用（SPA）想要的行为。

## 404 错误

开发服务器默认把任何指向不存在 URL 的请求重定向到 `/404.html`。

如果已经定义了其他重定向，就必须显式补上这条 404 重定向：

```toml
[[redirects]]
force = false
from   = '/**'
to     = '/404.html'
status = 404
```

多语言项目要确保默认语言的 404 重定向定义在最后：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = false
[[redirects]]
from = '/fr/**'
to = '/fr/404.html'
status = 404

[[redirects]] # 默认语言必须放在最后。
from = '/**'
to = '/404.html'
status = 404
```

当默认语言放在子目录中提供服务时：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = true
[[redirects]]
from = '/fr/**'
to = '/fr/404.html'
status = 404

[[redirects]] # 默认语言必须放在最后。
from = '/**'
to = '/en/404.html'
status = 404
```

## 完整示例

只保留开发环境需要的内容，可把开发服务器配置单独放在 `config/development/server.toml`：

```toml
[[headers]]
for = '/**'

[headers.values]
X-Content-Type-Options = 'nosniff'

[[redirects]]
from = '/myspa/**'
to = '/myspa/'
status = 200
force = false

[[redirects]]
force = false
from   = '/**'
to     = '/404.html'
status = 404
```
