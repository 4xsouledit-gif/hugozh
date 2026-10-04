{{- /* 供 AI 代理/LLM 抓取的 Markdown 版本（output format: md，isPlainText = true）。
       头部给出可直接引用的元数据（含 ISO 8601 时间），随后是处理过的正文 Markdown。
       模板命名 [page kind].[output format].[suffix] = single.md.md：
       https://gohugo.io/configuration/output-formats/#template-lookup-order */ -}}
# {{ .Title }}

{{- with .Params.description }}
> {{ . }}
{{- end }}
{{ partial "teach-md.html" . }}

{{- if .Params.source }}
- 官方英文原文：{{ .Params.source }}
{{- end }}
- 本页规范地址：{{ .Permalink }}
{{- with .Lastmod }}{{ if not .IsZero }}
- 最近更新：{{ .Format "2006-01-02T15:04:05Z07:00" }}
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

{{ partial "md-body.html" . }}
{{ partial "examples-md.html" . }}
