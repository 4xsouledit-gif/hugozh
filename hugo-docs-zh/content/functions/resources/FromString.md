+++
title = "resources.FromString"
linkTitle = "FromString"
description = "返回由字符串创建的资源。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/resources/fromstring/"

[params.functions_and_methods]
signatures = ["resources.FromString TARGETPATH STRING"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

有些「文件」在磁盘上并不存在，却必须发布出去：`robots.txt`、`.well-known/security.txt`、一份动态生成的内联样式、一段由站点配置拼出的 JSON。你希望它们和普通资源一样有 `.RelPermalink`、能被 `Publish`、能进管道。

`resources.FromString` 用「目标路径 + 一段字符串」造出这样一个资源。

## 什么时候用，什么时候别用

**该用**：

- 从站点配置生成 `security.txt`、`robots.txt` 之类的小文件；
- 把模板里拼好的字符串当作资源参与后续管道（`minify`、`fingerprint`、`ExecuteAsTemplate`）；
- 要一个「内容由运行时决定」的资源。

**别用**：

- 内容来自磁盘上的真实文件 → 用 [`resources.Get`](/functions/resources/get/)；
- 内容需要从 JSON/YAML/CSV **解析**出来 → 用 [`transform.Unmarshal`](/functions/transform/unmarshal/)；
- 想输出 HTML 片段 → 直接在模板里写即可，不必先变成资源；
- 内容里含模板动作（`{{ … }}`）→ 先用 `FromString` 造资源，再用 [`resources.ExecuteAsTemplate`](/functions/resources/executeastemplate/) 执行（见下文）。

`resources.FromString` 函数返回由字符串创建的资源，并以目标路径作为缓存键缓存结果。

例如，要根据站点配置创建并发布一个 `security.txt` 文件：

```go-html-template {file="layouts/baseof.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
{{ end }}
```

要在管道中发布，请使用 [`resources.Publish`][] 函数：

```go-html-template {file="layouts/baseof.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ resources.FromString ".well-known/security.txt" $content | resources.Publish }}
```

[`Permalink`][] 与 [`RelPermalink`][] 方法也会发布该资源。

如果字符串中包含模板动作，请把 `resources.FromString` 与 [`resources.ExecuteAsTemplate`][] 组合使用：

```go-html-template {file="layouts/baseof.html"}
{{ $string := `Contact: mailto:{{ site.Params.email }}
Expires: {{ (now.AddDate 1 0 0).UTC.Format "2006-01-02T15:04:05Z" }}
` }}
{{ $r := resources.FromString "" $string }}
{{ $r = $r | resources.ExecuteAsTemplate ".well-known/security.txt" . }}
{{ $r.Publish }}
```

## 完整示例：生成并发布 security.txt

站点配置里有 `[params] email = 'a@example.org'`：

```go-html-template {file="layouts/_partials/security-txt.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
  <p>发布到：{{ .RelPermalink }}</p>
{{ end }}
```

Hugo 0.167.0 实测：

- 页面输出 `<p>发布到：/.well-known/security.txt</p>`；
- 构建后 `public/.well-known/security.txt` 内容为：

```text
Contact: mailto:a@example.org
```

**你应当看到什么**：`.RelPermalink` 就是你给的 `TARGETPATH`（带前导斜杠），`.Publish` 把文件写进发布目录。注意 `.Publish` **方法**本身不返回可用的资源对象——实测写成 `{{ .Publish.RelPermalink }}` 会失败（`nil pointer evaluating error.RelPermalink`），所以要像上面那样「先调用 `.Publish`，再单独访问 `.RelPermalink`」，或改用函数形式 [`resources.Publish`](/functions/resources/publish/) 走管道。

组合 `ExecuteAsTemplate` 时（上游示例）：`{{ $r := resources.FromString "" $string }}` 先用空目标路径造资源，再 `ExecuteAsTemplate ".well-known/security.txt"` 指定最终路径。实测该链路可用，发布出的文件是执行过模板的版本：

```text
Contact: mailto:a@example.org
Expires: 2027-10-02T18:02:09Z
```

（`Expires` 是构建时刻加一年，每次构建都会不同。）

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 目标 `"test/from-string.txt"` + 内容 `"hello from string"` | `.RelPermalink` = `/test/from-string.txt`，`.Content` = `hello from string` | 否 |
| 目标 `""`（空字符串） | 仍返回资源；实测 `.RelPermalink` = `/.`，此时通常配合 `ExecuteAsTemplate` 再指定路径 | 否 |
| 内容是数字（如 `42`） | 被转成字符串：实测 `.Content` 为 `42` | 否 |
| 同一目标路径、**不同**内容，同一次构建里调用两次 | 各自得到各自的资源（实测 `[A][B][A]`：内容变更会形成新的缓存条目） | 否 |
| 同一目标路径、**相同**内容重复调用 | 复用同一个资源 | 否 |
| 只调用 `FromString` 而不访问 `.RelPermalink`／`.Publish` | 文件**不会**出现在 `public/` | 否 |
| 返回类型 | `resource.Resource` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `public/` 里没有这个文件 | 只造了资源，没有访问 `.RelPermalink`／`.Publish`／`.Permalink` | 加一次 `{{ .Publish }}`，或输出 `.RelPermalink` |
| 没报错但结果不对 | 内容里的 `{{ … }}` 原样出现在产物中 | `FromString` 不执行模板 | 接一步 [`resources.ExecuteAsTemplate`](/functions/resources/executeastemplate/) |
| 没报错但结果不对 | 改了内容但产物没更新 | 命中了构建内缓存 | 用 `hugo --ignoreCache` 复核；确认内容确实变了 |
| 报错看不懂 | 目标路径写成绝对路径或含 `..` | 路径越界 | 用相对发布目录的路径，如 `.well-known/security.txt` |
| 没报错但结果不对 | 文件内容多了一行空行 | 字符串里有尾随 `\n`，或模板换行被保留 | 用 `printf` 精确拼装，必要时 `trim` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Permalink`]: /methods/resource/permalink/
[`RelPermalink`]: /methods/resource/relpermalink/
[`resources.ExecuteAsTemplate`]: /functions/resources/executeastemplate/
[`resources.Publish`]: /functions/resources/publish/
