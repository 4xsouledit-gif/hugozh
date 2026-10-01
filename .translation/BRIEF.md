# 翻译作业手册（en → zh-cn）

- **来源（只读）**：`hugoDocs/content/en/<相对路径>` —— 禁止修改上游克隆。
- **目标**：`hugo-docs-zh/content/<相同相对路径>` —— 文件名、目录结构保持一致。
- 上游文档为 Apache-2.0（内容部分）；译文必须保留 `source` 字段指向原文。

---

## 一、会让整站构建失败的三条（违反即返工）

### 1. 上游短代码调用**不能照抄**

本站**只有 `note` 一个短代码**，上游那些短代码在本站不存在，照抄会报
`failed to extract shortcode: template for shortcode "…" not found`，**整个站点**构建失败。必须改写：

| 上游写法 | 本站改写 |
| --- | --- |
| `{{< code-toggle file=hugo >}}…{{< /code-toggle >}}` | 普通围栏代码块，语言标 `toml`（或 `yaml`/`json`，按内容） |
| `{{< code-toggle file=content/x.md fm=true >}}…{{< /code-toggle >}}` | 围栏代码块，语言标 `toml` |
| `{{< new-in 0.146.0 >}}` / `{{< new-in 0.146.0 />}}` | 行内文字：**（0.146.0 新增）** |
| `{{< deprecated-in 0.144.0 >}}` | 行内文字：**（0.144.0 起弃用）** |
| `{{% include "/_common/xxx.md" %}}` | 打开 `hugoDocs/content/en/_common/xxx.md`，**翻译其内容并内联**到此处 |
| `{{< render-list-of-pages-in-section path=/functions >}}` | 一句话说明 + 链接该目录首页，或列出关键页；不要保留调用 |
| `{{% glossary-term foo %}}` | 中文词 + 链接 `/quick-reference/glossary/foo/` |
| `{{< eturl >}}` / `{{< chroma-lexers >}}` / `{{< per-lang-config-keys >}}` 等 | 转为等价文字或链接；**拿不准就用纯文字表述并省略该块** |
| `{{< img src="…" alt="…" >}}`（上游自定义） | 转成 Markdown 图片 `![alt](src)`；需要尺寸/类名时用原生 `<img>` |
| 任何其它 `{{< … >}}` / `{{% … %}}` 调用 | **一律改成纯 Markdown**，绝不留调用 |

**例外**：本站自有的 `note` 短代码可以用（标准记法）：
`{{< note type="warning" title="标题" >}}正文支持 Markdown{{< /note >}}`

### 2. 展示短代码写法时必须转义

正文里出现未转义的 `{{<` 或 `{{%` 会被 Hugo 在 Markdown **之前**提取。示例一律写成：

```text
{{</* name */>}}          显示为 {{< name >}}
{{%/* name */%}}          显示为 {{% name %}}
{{</*/* name */*/>}}      显示为 {{</* name */>}}（要展示转义写法本身时）
```

**围栏代码块不豁免**，行内代码也不豁免。

### 3. 不得出现字面串 `HAHAHUGOSHORTCODE`

它是 Hugo 短代码占位符前缀，出现会让该页渲染失败且报错**指向别处**。需要展示时写成
`H&#xfeff;AHAHUGOSHORTCODE`（`&#xfeff;` 实体必须写在代码 span **之外**，写在反引号里不会被解码）。

---

## 二、前置元数据契约（译文页统一六字段，顺序固定）

```toml
+++
title = "中文标题"
linkTitle = "侧栏用短名"
description = "一句话中文导语，不要照抄英文原句"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/strings/truncate/"
+++
```

- `weight`：同一目录内按上游文件名顺序，用 **10、20、30…** 递增，**不要重复**。
- `source`：`https://gohugo.io/` + 上游相对路径去掉 `.md`，**并全部转为小写**（Hugo 默认
  `disablePathToLower=false`，输出 URL 一律小写；这也是本站既有 200+ 页的写法），目录型页面以 `/` 结尾。
  例：`functions/collections/After.md` → `https://gohugo.io/functions/collections/after/`；
  `methods/page/TableOfContents.md` → `https://gohugo.io/methods/page/tableofcontents/`；
  `quick-reference/glossary/Page-Bundle.md` → `https://gohugo.io/quick-reference/glossary/page-bundle/`。
- 上游前置元数据里的别名/分类等**不要照搬**；只保留上述六字段（可另加上游已有的 `aliases`，如确有需要）。

---

## 三、正文约定

1. 正文**从 `##` 开始**，绝不出现一级标题。
2. **站内链接一律根相对**：`[截断](/functions/strings/truncate/)`。只有 `source` 字段写外链。
3. **上游的 `[术语](g)` 写法可以原样保留**：本站已加链接渲染钩子
   （`themes/hugo-docs-theme/layouts/_markup/render-link.html`），会把它解析为
   `/quick-reference/glossary/<术语>/`；术语页尚未翻译时自动退化为纯文本，不会产生死链。
   **不要**改写成 `[术语](/quick-reference/glossary/…)`（slug 容易写错），保持 `(g)` 即可。
4. 代码、标识符、函数名、键名、CLI 参数、文件名**不译**；代码块保留原语言标记。
5. 原文的 `> [!NOTE]` / `> [!TIP]` 等 callout 语法保持原样。
6. 表格、列表结构保持；不要为了「好看」改动结构。
7. 上游的 `_index.md` 往往是短索引页，照译即可，不要额外扩写。
8. 术语表页（`quick-reference/glossary/*.md`）上游前置元数据里的 `reference` 字段是「参见主文档页」，
   请把它转成正文末尾的一行：`参见：[中文标题](/对应站内路径/)`。
9. **代码围栏的属性写法原样保留**：```go-html-template {file="layouts/x.html"}、{linenos=inline} 等。
   主题已有代码块渲染钩子（`layouts/_markup/render-codeblock.html`），会把 `file` 渲染成文件名标题，
   不会漏成非法 HTML 属性。
10. **块级属性独立一行原样保留**（如表格后的 `{.no-wrap-first-col}`）：本站已按上游开启
    `markup.goldmark.parser.attribute.block = true`；删掉反而与英文原文不一致。
11. `> [!NOTE]` / `> [!TIP]` / `> [!WARNING]` / `> [!IMPORTANT]` / `> [!CAUTION]` **原样保留**：
    主题已有引用块渲染钩子（`layouts/_markup/render-blockquote.html`），会渲染成带中文标签的警示框。
12. **函数/方法页必须保留签名信息**。上游前置元数据里的 `params.functions_and_methods`
    （`signatures` / `returnType` / `aliases`）是参考页最核心的内容，请转成 TOML 表放在前置元数据末尾：

    ```toml
    [params.functions_and_methods]
    signatures = ["strings.Chomp STRING"]
    returnType = "any"
    aliases = ["chomp"]
    ```

    缺哪项就省略哪项（`aliases: []` 视为缺项）。主题的 `partials/function-meta.html` 会把它渲染成
    「签名 / 返回类型 / 别名」一行。**若已漏掉也不必返工**：`.translation/backfill-signatures.ps1`
    会从上游机械回填（幂等）。

## 四、翻译风格

- 忠实、简洁、可操作；**不扩写、不删减技术细节**，不添加原文没有的结论。
- 专有名词首次出现写「中文（english）」，其后沿用中文；下文术语表优先。
- 函数/方法的**签名与返回值**必须与原文一致；`→` 示例结果保持原样。
- 拿不准的技术表述，宁可保留英文原词，也不要臆造中文说法。

### 术语表（沿用本站既有译法）

| 英文 | 译法 |
| --- | --- |
| front matter | 前置元数据（front matter） |
| page bundle / branch / leaf | 页面包 / 分支包 / 叶子包 |
| shortcode | 短代码（shortcode） |
| partial | 局部模板（partial） |
| render hook | 渲染钩子（render hook） |
| taxonomy | 分类法（taxonomy） |
| section | section（内容区块） |
| template / context | 模板 / 上下文 |
| layout / publish | 布局 / 发布 |
| nil | nil（不译） |

---

## 五、自检（提交前必须做）

```powershell
# 只校验语法与渲染，不写 public/，避免与其它代理并发冲突
hugo --ignoreCache --renderToMemory --quiet
```

- 退出码必须是 **0**；
- 若报错指向**你批次之外**的文件，可能是别的代理正在写，忽略即可；**指向你批次内的必须修**；
- 用搜索工具确认你批次内**没有**未转义的 `{{<` / `{{%`（除 `note` 调用外）与字面串 `HAHAHUGOSHORTCODE`；
- 不要运行 `hugo server`，不要运行不带 `--renderToMemory` / `--destination` 的 `hugo`（会与其它代理抢 `public/`）。

## 六、汇报格式

```
批次：<目录>
完成：<n>/<m> 页
自检：exit=0，未转义短代码 0，HAHAHUGOSHORTCODE 0
改写：<列出你把哪些上游短代码改成了什么>（没有就写「无」）
疑难：<拿不准的术语/段落，列原文位置>
```
