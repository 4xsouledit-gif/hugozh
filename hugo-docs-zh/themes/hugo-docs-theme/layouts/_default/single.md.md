{{- /* 供 AI 代理/LLM 抓取的 Markdown 版本（output format: md，isPlainText = true）。
       头部给出可直接引用的元数据，随后是正文 Markdown 原文，避免让代理解析 20KB HTML。
       模板命名 [page kind].[output format].[suffix] = single.md.md：
       https://gohugo.io/configuration/output-formats/#template-lookup-order
       .RawContent 依据：https://gohugo.io/methods/page/rawcontent/ */ -}}
# {{ .Title }}

{{- with .Params.description }}
> {{ . }}
{{- end }}

{{- if .Params.source }}
- 官方英文原文：{{ .Params.source }}
{{- end }}
- 本页规范地址：{{ .Permalink }}
{{- with .Lastmod }}{{ if not .IsZero }}
- 最近更新：{{ .Format "2006-01-02" }}
{{- end }}{{ end }}
{{- with .GitInfo }}
- 最后提交：{{ .AbbreviatedHash }} {{ .Subject }}
{{- end }}
{{- with .Params.functions_and_methods }}
{{- with .signatures }}
- 签名：{{ delimit . " ；" }}
{{- end }}
{{- with .returnType }}
- 返回类型：{{ . }}
{{- end }}
{{- end }}
- 站点：{{ site.Title }}（{{ site.BaseURL }}）· 社区维护的非官方中文翻译，如有出入以官方英文原文为准

---

{{- /* 去掉「独占一行」的短代码定界符（{{< note >}} … {{< /note >}}），保留其内部内容，
       这样代理拿到的是可读 Markdown 而不是未解析的短代码标记。 */ -}}
{{- $body := .RawContent -}}
{{- $body = replaceRE `(?m)^[ \t]*\{\{[<%][^\n]*[>%]\}\}[ \t]*\n?` "" $body -}}
{{ $body }}
