# 回填函数/方法签名（机械操作，不重译）

上游每个函数/方法页的前置元数据里有：

```yaml
params:
  functions_and_methods:
    aliases: [chomp]
    returnType: any
    signatures: [strings.Chomp STRING]
```

译文页必须保留这三项（渲染见 `themes/hugo-docs-theme/layouts/partials/function-meta.html`），
否则「签名 + 返回类型」这类参考页最核心的信息会丢失。

本脚本把上游 YAML 的该块转成 TOML 表，插入到译文页结束的 `+++` 之前：

```toml
[params.functions_and_methods]
signatures = ["strings.Chomp STRING"]
returnType = "any"
aliases = ["chomp"]
```

幂等：已含 `[params.functions_and_methods]` 的页面会跳过。可反复运行（每波翻译后跑一次）。

运行：

```powershell
pwsh -File .translation/backfill-signatures.ps1
```
