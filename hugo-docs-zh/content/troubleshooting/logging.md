+++
title = "日志"
linkTitle = "日志"
description = "用 --logLevel 控制构建日志的详细程度，把输出重定向到文件，用 warnf / errorf 从模板里打印提示，以及打开 LiveReload 调试日志。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/troubleshooting/logging/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "能在项目根目录执行 `hugo` / `hugo build`",
  "遇到的是「构建有问题但看不清发生了什么」，或想给模板加上自己的校验提示",
]
outcomes = [
  "按需要选择 error / warn / info / debug 四个级别，并知道默认为什么看不到 INFO",
  "把构建输出重定向到文件，并避开 Windows 上的编码坑",
  "用 `warnf` / `warnidf` / `errorf` / `erroridf` 在模板里报告问题，并知道哪种可以被 `ignoreLogs` 屏蔽",
]
next = ["/troubleshooting/deprecation/", "/troubleshooting/inspection/", "/functions/fmt/warnf/"]

+++

日志是排查里成本最低的一手证据：不用改模板、不用猜，只要把级别调高，Hugo 就会把自己做了什么、在哪一步停了说清楚。这一页解决三件事——**看多少**（级别）、**看到哪去**（重定向）、**怎么让模板也说话**（模板函数）。

## 命令行

用 `--logLevel` 命令行标志启用控制台日志。Hugo 有四个日志级别，级别越高，显示的消息越详细：

`error`
: 只显示错误消息。

  ```bash
  hugo build --logLevel error
  ```

`warn`
: 显示警告与错误消息。

  ```bash
  hugo build --logLevel warn
  ```

`info`
: 显示信息、警告与错误消息。

  ```bash
  hugo build --logLevel info
  ```

`debug`
: 显示调试、信息、警告与错误消息。

  ```bash
  hugo build --logLevel debug
  ```

> [!NOTE]
> 如果没有用 `--logLevel` 指定日志级别，警告与错误始终会显示。

**为什么默认看不到 INFO**：默认级别相当于 `warn`，只保证警告与错误一定出现。弃用提示、构建步骤耗时这类信息属于 INFO，不主动指定就看不到。要观察细节时，从 `info` 或 `debug` 开始逐级放宽。

**你应当看到什么**：实测在 Hugo v0.167.0 上，`--logLevel info` 的输出形如（每行以级别标签开头，标签后跟两个空格）：

```text
INFO  static: syncing static files to \ duration 4.3307ms
INFO  build:  step process substep collect files 949 files_total 949 pagesources_total 948 resourcesources_total 1 duration 18.1492ms
INFO  build:  step assemble duration 191.2217ms
```

判据：出现 `INFO` 开头的行，说明级别已生效；`--logLevel debug` 还会额外出现 DEBUG 行。若输出与不指定级别时完全一样，先确认标志写在子命令之后、且拼写正确（用 `hugo build --help` 核对）。

弃用提示也属于 INFO 级别，升级后想看到它们就必须显式指定 `--logLevel info`，详见[弃用说明](/troubleshooting/deprecation/)。

### 把输出写入文件

构建输出较长时，可以重定向到文件后再慢慢查看。下面的写法把标准输出与标准错误一并写入 `build.log`：

```bash
hugo build --logLevel info > build.log 2>&1
```

Windows PowerShell 里同样可以：

```powershell
hugo build --logLevel info *> build.log
```

重定向只影响输出去向，不改变日志级别；要调整显示的内容，仍然通过 `--logLevel` 控制。

> **编码提示**：Windows PowerShell 5.1 的 `>` / `>>` 默认写出 UTF-16LE（带 BOM），在部分编辑器里会显示成乱码。用 PowerShell 7，或改用 `hugo build --logLevel info 2>&1 | Out-File -Encoding utf8 build.log`。**注意不要把这种重定向用在内容文件或配置文件上**——Hugo 读到带 BOM 的 TOML 会直接报 `toml: invalid character at start of key: U+00FF`。

## 模板函数

也可以用模板函数把警告或错误打印到控制台。这类函数通常用于报告数据校验错误、文件缺失等情况。它们位于 `fmt` 函数组中：

| 函数 | 签名 | 行为 |
| --- | --- | --- |
| [`warnf`](/functions/fmt/warnf/) | `fmt.Warnf FORMAT [INPUT]` | 记录一条 WARNING；相同消息只打印一次 |
| [`warnidf`](/functions/fmt/warnidf/) | `fmt.Warnidf ID FORMAT [INPUT]` | 记录一条带 ID 的 WARNING，可被 `ignoreLogs` 屏蔽 |
| [`errorf`](/functions/fmt/errorf/) | `fmt.Errorf FORMAT [INPUT]` | 记录一条 ERROR，**并使构建失败** |
| [`erroridf`](/functions/fmt/erroridf/) | `fmt.Erroridf ID FORMAT [INPUT]` | 记录一条带 ID 的 ERROR，并使构建失败，可被 `ignoreLogs` 屏蔽 |

`warnidf` 与 `erroridf` 记录的日志带有消息 ID，把该 ID 加入项目配置的 `ignoreLogs` 数组即可屏蔽对应的提示，`warnf` 与 `errorf` 则不能这样屏蔽。

**你应当看到什么**：`warnidf` 会在控制台打印提示，并顺带告诉你怎么屏蔽它：

```text
WARN You should consider fixing this.
You can suppress this warning by adding the following to your project configuration:
ignoreLogs = ['warning-42']
```

按提示把 ID 加进配置即可：

```toml
ignoreLogs = ["warning-42"]
```

**什么时候用**：数据校验（例如某个前置元数据字段必须存在）、引用了不存在的文件、短代码参数缺失。**什么时候别用**：把 `errorf` 当成断言随手加在循环里——它会让构建失败，一旦触发，站点就发布不出去；想让构建继续、只留提示，用 `warnf`。

## LiveReload

要在浏览器中记录 Hugo 的 LiveReload 请求，在运行开发服务器时给 URL 加上这个查询字符串：

```text
debug=LR-verbose
```

例如：

```text
http://localhost:1313/?debug=LR-verbose
```

然后在浏览器的开发者工具控制台中观察重载请求，并确认已启用开发者工具的「保留日志」（preserve log）选项，否则页面刷新时日志会被清空。

**你应当看到什么**：每次保存文件后，控制台里出现一条 LiveReload 相关的请求记录。看不到时先检查「保留日志」是否勾选，再确认地址栏里确实带了 `?debug=LR-verbose`。

## 常见坑

**命令找不到**

- `grep: command not found`（Windows）：用 `Select-String`，例如 `hugo build --logLevel info | Select-String deprecate`；
- `hugo: command not found`：见[故障排查](/troubleshooting/)的「症状 A：命令找不到」；
- `hugo build` 在旧版本上不被识别：旧版可能只支持不带子命令的 `hugo`，用 `hugo --help` 确认。

**没有报错但结果不对**

- **调高级别却没变化**：标志位置写错（要跟在 `hugo build` 之后），或站点本身确实没有该级别的日志；
- **重定向后文件是空的**：日志可能全部走了标准错误。用 `> build.log 2>&1`（Bash）或 `*> build.log`（PowerShell）把两路都收进去；
- **`warnf` 只打印了一次**：这是去重行为，不是循环没执行。调试循环时加 `math.Counter` 制造唯一消息，做法见[检查与调试](/troubleshooting/inspection/)；
- **`ignoreLogs` 写了却不生效**：只有带 ID 的 `warnidf` / `erroridf` 能被屏蔽，`warnf` / `errorf` 不行；另外 ID 必须与代码里写的完全一致。

**报错看不懂**

- 终端里突然出现 `ERROR …` 且构建失败：可能来自模板里的 `errorf` / `erroridf`，按消息里给出的文件与位置回查；
- 日志出现乱码：多半是重定向编码问题，见上文「编码提示」；
- 日志里出现 `deprecated`：属于弃用提示，处理方式见[弃用说明](/troubleshooting/deprecation/)；
- 提示信息不足以定位：先把级别提到 `info`，再用[检查与调试](/troubleshooting/inspection/)把中间值打出来。
