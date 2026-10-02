{{- /* 章节页的 Markdown 版本（output format: md）。列出本章页面清单（含各自的 Markdown 地址）。 */ -}}
# {{ .Title }}

{{- with .Description }}
> {{ . }}
{{- end }}
{{ partial "teach-md.html" . }}
- 本页规范地址：{{ .Permalink }}
{{- with .Lastmod }}{{ if not .IsZero }}
- 最近更新：{{ .Format "2006-01-02T15:04:05Z07:00" }}
{{- end }}{{ end }}
- 站点：{{ site.Title }}（{{ site.BaseURL }}）· 社区维护的非官方中文翻译

## 本章页面

{{- range .Pages.ByWeight }}
- [{{ .LinkTitle }}]({{ .Permalink }}){{ with .Description }}：{{ . }}{{ end }}{{ with .OutputFormats.Get "md" }}（Markdown：{{ .Permalink }}）{{ end }}
{{- else }}
本章没有子页面。
{{- end }}

---

{{ partial "md-body.html" . }}
