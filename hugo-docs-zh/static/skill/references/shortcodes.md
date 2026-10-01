# Shortcodes

A shortcode is a template invoked from content. The author writes `{{</* name */>}}`, Hugo extracts
it before Markdown runs, and the template's output is merged into the page.

## When someone asks for a shortcode

Work these in order; the notation decision shapes everything else.

1. **What is the output, and does it still need Markdown?** Markup that the Markdown renderer must
   process (headings, lists, links inside the block) → Markdown notation. Finished HTML → standard
   notation.
2. **Which arguments?** Named (`{{</* note type="tip" */>}}`) reads better in content; positional
   (`{{</* figure src alt width */>}}`) is shorter. `.IsNamedParams` tells the template which it got;
   `.Get` handles both.
3. **Does it wrap content?** Paired form needs `.Inner`; the self-closing form `/*/>` does not.
4. **Where does it live?** The site's own `layouts/_shortcodes/` for one site; a theme's copy for
   reuse. Subdirectories namespace the name (`media/audio.html` → `{{</* media/audio */>}}`).
5. **Write the template, call it from one page, build, and read the generated HTML.** Then document
   the call syntax next to the content that uses it.

## Location, naming, lookup

```text
layouts/_shortcodes/
├── note.html              →  {{</* note */>}}
└── media/audio.html       →  {{</* media/audio src=… */>}}
```

`layouts/_shortcodes/` is the current template system (0.146+); `layouts/shortcodes/` is legacy. A
theme's `_shortcodes` directory takes part in the same lookup, which is how a site overrides a single
shortcode from a theme. Hugo selects by name, output format and language, most specific first:
`foo.en.html` → `foo.html.html` → `foo.html` → `foo.html.en.html`
(<https://gohugo.io/templates/shortcode/#lookup-order>).

## Notation decides rendering order

Documented at <https://gohugo.io/templates/shortcode/#rendering-order>:

1. Markdown-notation shortcodes (`{{% … %}}`) execute **before** the Markdown renderer, in document
   order.
2. The Markdown renderer runs.
3. Standard-notation shortcodes (`{{< … >}}`) execute **after** it.

Consequences worth saying out loud:

- Markdown notation: `.Inner` is raw Markdown and its headings reach `.TableOfContents`.
- Standard notation: `.Inner` is unrendered text — pipe it through `markdownify` — and its headings
  never reach the table of contents.
- A standard-notation call earlier in the document still runs *after* a Markdown-notation call later
  in it.

## Methods

`Get`, `Params`, `IsNamedParams`, `Inner`, `InnerDeindent`, `Parent`, `Name`, `Ordinal`, `Position`,
`Page`, `Site`, `Scratch`, `Store`, `Ref`, `RelRef`
(<https://gohugo.io/templates/shortcode/#methods>). Reach the current page with `.Page`, and page
resources through it: `{{ with .Page.Resources.Get (.Get "path") }}`.

## Nesting

Nested shortcodes render inside-out: each child runs first, and the parent receives the rendered
output of its children as `.Inner`. A child reaches its parent's parameters with `.Parent`. Inline
shortcodes cannot be nested.

## Verified example: a callout

`layouts/_shortcodes/note.html`:

```go-html-template
{{- $type := .Get "type" | default "note" -}}
{{- $title := .Get "title" -}}
<aside class="callout callout-{{ $type }}">
  {{- with $title }}<p class="callout-title">{{ . }}</p>{{ end -}}
  <div class="callout-body">{{ .Inner | markdownify }}</div>
</aside>
```

Content (standard notation):

```md
{{</* note type="warning" title="未转义不是单页问题" */}}
Hugo 在 Markdown 解析**之前**就提取短代码……
{{</* /note */>}}
```

Renders to `<aside class="callout callout-warning"><p class="callout-title">…</p><div
class="callout-body">…<strong>…</strong>…<code>…</code>…</div></aside>` — the inner Markdown is
rendered because the template calls `markdownify` itself.

**Observed:** verified on Hugo 0.167.0 in a project whose other templates use the classic paths
(`layouts/_default/`, `layouts/partials/`): `layouts/_shortcodes/` still resolves, so the two
conventions can coexist. Mixing them remains a smell — put shortcodes in `_shortcodes/` and be
consistent about the rest.

## Shortcodes versus render hooks

Use a **render hook** (`layouts/_markup/render-*.html`) to change how existing Markdown constructs —
headings, links, images, code blocks, tables, blockquotes — render everywhere on the site. Use a
**shortcode** when the content author opts in, block by block. A hook cannot be called from content;
a shortcode cannot intercept a Markdown construct. If the request is "every image in every page
should…", it is a hook.

## Security

Inline shortcodes (defined inside content) are off by default: Hugo's model trusts template and
configuration authors but not content authors. Turning on `security.enableInlineShortcodes` extends
that trust to anyone who can write content — recommend it only when the user owns that risk.

## Verification

```bash
hugo --ignoreCache --printUnusedTemplates    # a template nothing calls is listed here
```

Then read the generated page. A missing close, a wrong argument name, or a `warnf` from the template
shows up in the HTML, and an unmatched call is a build error, not a silent no-op. Examples of
shortcode syntax *inside content* must be escaped — see the iron rules in `SKILL.md`.
