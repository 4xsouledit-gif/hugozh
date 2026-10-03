# 贡献指南

感谢愿意一起把 Hugo 带到中文世界。下面是最有价值的几种贡献方式，以及动笔前需要知道的几条硬规矩。

## 最欢迎的贡献

1. **可复现的踩坑**：一段「现象 → 真因 → 修法」。请附上 `hugo version`、最小复现（几行配置/模板/内容），以及你的排查过程。技能包里 G1–G28 都是这样来的。
2. **译文修正**：给出**上游原文链接**（页面的 `source` 字段或 <https://gohugo.io/> 对应页）与具体段落，说明为什么现在的译法不准确。
3. **补译缺失章节**：上游的 `functions/`、`methods/`、`quick-reference/glossary/`、`news/` 尚未翻译，欢迎认领。

## 动笔前必读的四条硬规矩

1. **短代码示例必须转义**。正文里出现 `{{<` 或 `{{%` 会被 Hugo 在 Markdown 之前提取：写 `{{</* name */>}}`、`{{%/* name */%}}`，要展示转义写法本身用 `{{</*/* name */*/>}}`。**围栏代码块并不豁免。**
2. **正文里不要出现字面串 `HAHAHUGOSHORTCODE`**（Hugo 短代码占位符前缀），它会让你这一页渲染失败且报错指向别处；需要展示时写成 `H&#xfeff;AHAHUGOSHORTCODE`（零宽字符，实体必须写在代码 span 之外）。
3. **站内链接用根相对路径**（`/section/page/`）。改名或移动页面后，务必把指向旧路径的链接一并改掉。
4. **前置元数据保持契约**：`title` / `linkTitle` / `description` / `date` / `weight` / `source`（`source` 仅译文页需要）。正文从 `##` 开始，一级标题由模板提供。

## 新增页面

```bash
cd hugo-docs-zh
hugo new content <章节>/<页面>.md
```

填入前置元数据后，侧栏、章节列表与上一篇/下一篇会自动带上它；新章节只需在 `content/` 下新建目录并添加 `_index.md`。

## 提交前请自检

```bash
cd hugo-docs-zh
hugo --cleanDestinationDir --ignoreCache \
     --printPathWarnings --printUnusedTemplates --printI18nWarnings
```

- 退出码必须为 0，且不出现新的警告；
- `public/` 中应能找到你改动页面对应的 `index.html`；
- 改了标题或锚点时，检查站内有没有指向旧锚点的链接（中文标题的 id 会保留汉字并去掉标点，例如 `## 草稿、将来与过期内容` → `#草稿将来与过期内容`）；
- 提交信息请说明**改了什么、为什么**，一次提交只做一件事。

## 许可与署名

提交即表示你同意按本仓库的许可发布：**译文内容 Apache-2.0**（演绎自上游 Hugo 文档），**站点代码与技能包 MIT**。新增译文请保留 `source` 字段并在提交信息中注明上游来源，以便他人核对。
