+++
title = "encoding.Base64Decode"
linkTitle = "Base64Decode"
description = "返回给定内容的 base64 解码结果。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/encoding/base64decode/"
+++

```go-html-template
{{ "SHVnbw==" | base64Decode }} → Hugo
```

用 `base64Decode` 函数可以解码 API 的响应。例如，调用 GitHub API 得到的响应中，包含仓库 README 文件的 base64 编码表示：

```text
https://api.github.com/repos/gohugoio/hugo/readme
```

要取回并渲染其中的内容：

```go-html-template
{{ $url := "https://api.github.com/repos/gohugoio/hugo/readme" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ with . | transform.Unmarshal }}
      {{ .content | base64Decode | markdownify }}
    {{ end }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```
