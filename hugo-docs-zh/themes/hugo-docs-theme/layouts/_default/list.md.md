{{- /* 章节页的 Markdown 版本（output format: md）。
       给出本章的页面清单（含每页的 Markdown 地址），方便代理按章节批量抓取。 */ -}}
# {{ .Title }}

{{- with .Description }}
> {{ . }}
{{- end }}
- 本页规范地址：{{ .Permalink }}
{{- with .Lastmod }}{{ if not .IsZero }}
- 最近更新：{{ .Format "2006-01-02" }}
{{- end }}{{ end }}
- 站点：{{ site.Title }}（{{ site.BaseURL }}）· 社区维护的非官方中文翻译

## 本章页面

{{- range .Pages.ByWeight }}
- [{{ .LinkTitle }}]({{ .Permalink }}){{ with .Description }}：{{ . }}{{ end }}{{ with .OutputFormats.Get "md" }}（Markdown：{{ .Permalink }}）{{ end }}
{{- else }}
本章没有子页面。
{{- end }}

---

{{- $body := .RawContent -}}
{{- $body = replaceRE `(?m)^[ \t]*\{\{[<%][^\n]*[>%]\}\}[ \t]*\n?` "" $body -}}
{{ $body }}
