+++
title = "hugo gen chromastyles"
linkTitle = "hugo gen chromastyles"
description = "为 Chroma 代码高亮器生成 CSS 样式表。"
date = 2026-10-01
weight = 250
source = "https://gohugo.io/commands/hugo_gen_chromastyles/"
+++

`hugo gen chromastyles` 是 `hugo gen` 的子命令，按给定的样式名生成 Chroma 代码高亮器所需的 CSS 样式表。当配置中的 `markup.highlight.noClasses` 被禁用（也就是不再为高亮代码输出内联样式）时，站点必须引入这张样式表，否则高亮代码不会有任何颜色。

可用的样式名与预览见上游文档的语法高亮样式一览：https://gohugo.io/quick-reference/syntax-highlighting-styles/

## 用法

```text
hugo gen chromastyles [flags] [args]
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `--classDark string` | `--modeSelector` 用于深色样式时使用的类名，默认为 `dark` |
| `--classLight string` | `--modeSelector` 用于浅色样式时使用的类名，默认为 `light` |
| `-h`, `--help` | 显示 `chromastyles` 命令的帮助信息 |
| `--highlightStyle string` | 高亮行的前景色与背景色，例如 `--highlightStyle "#fff000 bg:#000fff"` |
| `--lineNumbersInlineStyle string` | 内联行号的前景色与背景色，例如 `--lineNumbersInlineStyle "#fff000 bg:#000fff"` |
| `--lineNumbersTableStyle string` | 表格行号的前景色与背景色，例如 `--lineNumbersTableStyle "#fff000 bg:#000fff"` |
| `--mode string` | 样式模式，取值为 `light` 或 `dark` |
| `--modeSelector` | 把选择器放在顶层模式类之下，例如 `.dark .chroma` |
| `--omitClassComments` | 生成的 CSS 中省略 CSS 类注释前缀 |
| `--omitEmpty` | 省略空的 CSS 规则（已废弃，不再需要） |
| `--style string` | 高亮器样式，默认为 `friendly` |

## 继承自父命令的全局选项

| 选项 | 说明 |
| --- | --- |
| `--clock string` | 设定 Hugo 使用的时钟，例如 `--clock 2021-11-06T22:30:00.00+09:00` |
| `--config string` | 指定配置文件，默认为 `hugo.yaml`、`hugo.json` 或 `hugo.toml` |
| `--configDir string` | 配置目录，默认为 `config` |
| `-d`, `--destination string` | 写入文件的文件系统路径 |
| `-e`, `--environment string` | 构建环境 |
| `--ignoreVendorPaths string` | 对匹配给定 Glob 模式的模块路径忽略其中的 `_vendor` |
| `--logLevel string` | 日志级别：`debug`、`info`、`warn` 或 `error` |
| `--noBuildLock` | 不创建 `.hugo_build.lock` 文件 |
| `--quiet` | 以静默模式构建 |
| `-M`, `--renderToMemory` | 渲染到内存，主要用于运行服务器时 |
| `-s`, `--source string` | 读取文件时相对的起始文件系统路径 |
| `--themesDir string` | 主题目录的文件系统路径 |

## 示例

生成 `monokai` 样式的高亮样式表，写入项目内的资源目录：

```bash
hugo gen chromastyles --style monokai > ./assets/css/chroma.css
```

不改动样式，导出默认的 `friendly` 样式：

```bash
hugo gen chromastyles > ./assets/css/chroma.css
```

把选择器收拢到顶层模式类之下，便于在浅色与深色之间切换：

```bash
hugo gen chromastyles --style monokai --mode dark --modeSelector --classDark dark
```

同时指定高亮行的配色：

```bash
hugo gen chromastyles --style monokai --highlightStyle "#fff000 bg:#000fff" > ./assets/css/chroma.css
```

## 说明

- 该命令只输出 CSS 到标准输出，不写入站点文件，需要用重定向保存到 `assets/` 或 `static/` 下的相对路径。
- 站点只有在 `markup.highlight.noClasses` 为 `false` 时才需要引入这张样式表；若该配置保持启用，Hugo 会直接为每个代码块输出内联样式。
- `--modeSelector` 通常与 `--mode`、`--classDark`、`--classLight` 搭配使用，用来生成可按模式切换的高亮样式。
- `--omitEmpty` 已废弃，新的 Hugo 版本中无需再传入。
