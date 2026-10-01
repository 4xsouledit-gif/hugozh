+++
title = "从字符串创建资源"
linkTitle = "从字符串创建资源"
description = "用字符串创建资源并发布到目标路径。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/hugo-pipes/resource-from-string/"
+++

## 方法签名与用途

`resources.FromString` 从一个字符串创建资源，并以目标路径作为缓存键：

```text
resources.FromString TARGETPATH STRING
```

返回值类型是 `resource.Resource`，因此它可以继续参与管道，例如压缩或指纹。它适合生成那些内容来自配置或模板变量、而非来自磁盘文件的资源，典型的例子是 `security.txt` 与 `robots.txt`。

## 基本用法

下面的例子根据站点配置里的邮箱生成一个 `security.txt`：

```go-html-template
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
{{ end }}
```

字符串中的换行需要显式写出，例如 `printf` 里的 `\n`；否则生成的文件内容会挤成一行。

## 在管道中发布

如果想保持在一条管道里，可以用发布函数作为收尾：

```go-html-template
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ resources.FromString ".well-known/security.txt" $content | resources.Publish }}
```

除了 `Publish`，`Permalink` 与 `RelPermalink` 方法同样会触发资源发布；如果只是想把内容写进当前页面而不生成文件，可以改用 `.Content`。

## 字符串中包含模板动作时

字符串里的模板动作不会被自动执行。遇到这种情况，可以先用 `resources.FromString` 把字符串变成资源，再用 `resources.ExecuteAsTemplate` 指定最终路径并执行其中的模板动作：

```go-html-template
{{ $string := `Contact: mailto:{{ site.Params.email }}
Expires: {{ (now.AddDate 1 0 0).UTC.Format "2006-01-02T15:04:05Z" }}
` }}
{{ $r := resources.FromString "" $string }}
{{ $r = $r | resources.ExecuteAsTemplate ".well-known/security.txt" . }}
{{ $r.Publish }}
```

这里先用空的目标路径把字符串包成资源，最终发布路径交由模板执行环节指定，这也是上游文档采用的写法。关于执行模板资源的完整说明，见[从模板创建资源](/hugo-pipes/resource-from-template/)。

## 缓存与 --gc

因为缓存键是目标路径，同一目标路径的字符串资源在一次构建中会被复用；建议让一个目标路径只承载一种内容，避免不同内容之间相互覆盖或命中旧结果。

构建时可用 `hugo build --gc` 在构建后清理未使用的缓存文件，参数说明见[命令](/commands/)。

## 常见坑

- 目标路径决定发布位置：`.well-known/security.txt` 会发布为 `public/.well-known/security.txt`，可以在[目录结构](/getting-started/directory-structure/)中对照 `public` 目录的组织方式。
- 字符串里的模板动作必须经过模板执行环节才会生效，直接发布只会得到原样的文本。
- 资源只有在你引用或发布它之后才会出现在 `public` 目录里。
- 生成文件的编码与换行都来自字符串本身，写多行内容时注意不要漏掉换行符。

## 相关页面

- [Hugo Pipes 简介](/hugo-pipes/)
- [从模板创建资源](/hugo-pipes/resource-from-template/)
- [资源压缩](/hugo-pipes/minification/)
