+++
title = "资源指纹"
linkTitle = "资源指纹"
description = "为资源内容生成哈希文件名与 SRI 完整性值。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/hugo-pipes/fingerprint/"
+++

## 方法签名与用途

`resources.Fingerprint` 对资源内容做密码学哈希，返回带哈希值的资源对象，用于缓存失效与子资源完整性校验：

```text
resources.Fingerprint [ALGORITHM] RESOURCE
```

它也有别名 `fingerprint`。哈希算法可以是 `md5`、`sha256`（默认）、`sha384` 或 `sha512`。虽然最常见的用途是 CSS 与 JavaScript，但任何类型的资源都可以做指纹。

## 链式调用示例

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{ with . | fingerprint "sha256" }}
    <script src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
  {{ end }}
{{ end }}
```

嵌套两层 `with` 的做法很常见：外层确认资源存在，内层把资源交给指纹环节，同时把 `.` 绑定到指纹后的资源对象，因此后面可以直接取 `RelPermalink` 与 `Data.Integrity`。

Hugo 渲染出的结果大致如下：

```html
<script src="/js/main.62e...df1.js" integrity="sha256-Yuh...rfE=" crossorigin="anonymous"></script>
```

## 哈希带来的两项变化

对资源内容做哈希之后：

1. `Permalink` 与 `RelPermalink` 返回的路径中包含哈希值，文件名因此发生变化。
2. 资源的 `.Data.Integrity` 返回一个子资源完整性（SRI）值，由哈希算法名、一个连字符以及 base64 编码后的哈希和组成。

## SRI 与指纹的关系

文件名中的哈希与 `integrity` 属性中的哈希来自同一次计算，但用途不同：文件名哈希让浏览器把改版后的资源当作新文件重新下载，`integrity` 则让浏览器在加载脚本或样式时校验内容是否被篡改。示例里同时给出的 `crossorigin` 属性是使用 SRI 时常见的配套写法。

正因为两者同源，管道顺序必须“先压缩、后指纹”。如果先指纹再压缩，`integrity` 记录的会是压缩前内容的哈希，而实际发布出去的是压缩后的文件，浏览器校验失败就会拒绝加载。

## 缓存与 --gc

资源内容一变，哈希随之变化，文件名也就变了：旧文件名的资源不会自动从发布目录里消失。清理发布目录中的陈旧文件需要用清理目标目录的参数，而 `hugo build --gc` 负责在构建后清理未使用的缓存文件，两者职责不同，详见[命令](/commands/)。

## 常见坑

- 算法默认是 `sha256`；只有在确有兼容需求时才改用其他算法，并且要与 `integrity` 中出现的算法名保持一致。
- 不要在模板里手写哈希值或拼文件名，`RelPermalink` 已经包含哈希。
- `.Data.Integrity` 由 `resources.Fingerprint` 填充，没有做过指纹的资源没有这项数据。
- 想要“内容不变文件名就不变、内容一变文件名立刻变”的效果，指纹应放在管道的最后一环。

## 相关页面

- [Hugo Pipes 简介](/hugo-pipes/)
- [资源压缩](/hugo-pipes/minification/)
- [资源打包](/hugo-pipes/bundling/)
- [部署](/host-and-deploy/)
