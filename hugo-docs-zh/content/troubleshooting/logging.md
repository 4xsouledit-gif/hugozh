+++
title = "日志"
linkTitle = "日志"
description = "打开日志以观察构建过程中的事件，并说明输出级别与重定向。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/troubleshooting/logging/"
+++

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

> **说明**
> 如果没有用 `--logLevel` 指定日志级别，警告与错误始终会显示。

因此日常构建只会看到警告与错误；需要观察细节时，再从 `info` 或 `debug` 开始逐级放宽。弃用提示属于 INFO 级别，升级后想看到它们就必须显式指定 `--logLevel info`，详见[弃用说明](/troubleshooting/deprecation/)。

### 把输出写入文件

构建输出较长时，可以重定向到文件后再慢慢查看。下面的写法把标准输出与标准错误一并写入 `build.log`：

```bash
hugo build --logLevel info > build.log 2>&1
```

重定向只影响输出去向，不改变日志级别；要调整显示的内容，仍然通过 `--logLevel` 控制。

## 模板函数

也可以用模板函数把警告或错误打印到控制台。这类函数通常用于报告数据校验错误、文件缺失等情况。它们位于 `fmt` 函数组中：

| 函数 | 说明 |
| --- | --- |
| `warnf` | 记录一条 WARNING |
| `warnidf` | 记录一条可以屏蔽的 WARNING，消息带有 ID |
| `errorf` | 记录一条 ERROR |
| `erroridf` | 记录一条可以屏蔽的 ERROR，消息带有 ID |

`warnidf` 与 `erroridf` 记录的日志带有消息 ID，把该 ID 加入项目配置的 `ignoreLogs` 数组即可屏蔽对应的提示，`warnf` 与 `errorf` 则不能这样屏蔽。

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
