{{- /* 首页的 Markdown 版本（output format: md）。
       llms.txt 声称「每个内容页都提供 index.md」，首页也不能例外；
       这里给出站点摘要 + 章节地图 + 指向全站清单，便于代理一次拿到导航结构。 */ -}}
# {{ site.Title }}

> {{ site.Params.description }}

- 站点：{{ site.BaseURL }}
- 官方上游：{{ site.Params.upstream }}
- 性质：社区维护的非官方中文翻译；如有出入以官方英文原文为准
- 语言：简体中文（zh-CN）

## 分主题入口

{{- range site.Home.Sections.ByWeight }}
- [{{ .LinkTitle }}]({{ .Permalink }}){{ with .Description }}：{{ . }}{{ end }}{{ with .OutputFormats.Get "md" }}（Markdown：{{ .Permalink }}）{{ end }}
{{- end }}

## 机器可读资源

- 全站页面清单（JSON，含标题/摘要/章节/官方原文/更新时间）：{{ site.BaseURL }}pages.json
- 全站页面清单（XML）：{{ site.BaseURL }}sitemap.xml
- LLM 入口文件：{{ site.BaseURL }}llms.txt
- 每个内容页的 Markdown：在页面 URL 后接 `index.md`

---

{{ partial "md-body.html" . }}
