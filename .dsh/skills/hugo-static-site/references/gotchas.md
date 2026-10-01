# Hugo trap catalogue

Each entry: what you see → what actually happened → what to do. Entries are referenced from
`SKILL.md` as G1, G2, …

## How to read this catalogue

- **documented** — reproduces stated behaviour and names the page or command involved: G1,
  G3–G10, G14, G18–G20.
- **observed** — reproduced on a working site, not stated in the docs: G11–G13, G15–G17.
- **not documented** — real but unstated; G2 says so in its own Status line.

Where an entry disagrees with what your own build shows, trust the build: these are behaviours,
not promises.

## G1 — `failed to extract shortcode: template for shortcode "x" not found`

**Symptom.** Build aborts during content assembly; the message names a shortcode nobody wrote.

**Cause.** Content contains a bare `{{<` or `{{%`. Hugo scans for shortcodes **before** Markdown,
and the documentation never exempts code blocks: its escaping rule is demonstrated *inside* a
fenced example, and every shortcode call in the docs is escaped
(<https://gohugo.io/content-management/syntax-highlighting/#escaping>,
<https://gohugo.io/contribute/documentation/#escaping-shortcode-syntax>). Never rely on a fence or
an inline code span to protect the syntax. The page that reports the error is usually the first
offender by line order, not the only one.

**Fix.** Rewrite each occurrence as an escape (`{{</* name */>}}`, `{{%/* name */%}}`,
`{{</* /name */>}}`), then re-scan the whole content tree rather than just the reported page.

## G2 — `illegal state in content; shortcode token missing end delim`

**Symptom.** A page that contains **no braces at all** fails to render; the error is attributed to
that page; rewriting the page does not help; moving the page out of `content/` makes the build pass.

**Cause.** Content contains the literal string `HAHAHUGOSHORTCODE`. That is the prefix Hugo uses
for its internal shortcode placeholders; content containing it drives the lexer into an illegal
state. The upstream Hugo documentation dodges this by writing `H&#xfeff;AHAHUGOSHORTCODE` — a
zero-width U+FEFF splitting the literal.

**Fix.** Replace the literal with `H&#xfeff;AHAHUGOSHORTCODE`, or restructure the sentence so the
full string never appears. The `&#xfeff;` entity must sit **outside** a code span: inside
backticks it is not decoded and the reader sees the entity.

**Status.** This one is **not documented** anywhere except the workaround in the official audit
page (<https://gohugo.io/troubleshooting/audit/>); it is a Hugo implementation detail. It is also
the only failure in this catalogue that Hugo attributes to the wrong cause, so it is worth knowing
even though the mechanism is inferred rather than specified.

**Why it hides.** The string looks like ordinary prose, and `grep` for `{{` finds nothing.

## G3 — deprecation warning: `languageCode` → `locale`

**Symptom.** `WARN deprecated: project config key languageCode was deprecated in Hugo v0.158.0 …
Use locale instead.`

**Fix.** Rename the key (`locale = "zh-cn"`). Keep `defaultContentLanguage` — it is a different
key and still current. If the site must also build on pre-0.158 Hugo, pick one key and document
the version requirement instead of shipping both.

## G4 — `hugo new site` no longer scaffolds content

**Symptom.** Scripts copied from older tutorials produce an unexpected skeleton.

**Cause.** Current Hugo scaffolds with `hugo new project <path>`; `hugo new site` is legacy.
Likewise `hugo` (build) is documented as `hugo build`, with `hugo` kept as the alias.
Check `hugo <cmd> --help` for the installed version instead of trusting a tutorial.

## G5 — front matter `_target` and `_build`

- `cascade` uses `target` (page matcher) with the alias `_target` deprecated; `lang` inside the
  matcher was deprecated in 0.153.0 in favour of the `sites` matrix.
- Page build options use `build`; `_build` is the old spelling. `list` = `always|local|never`,
  `render` = `always|link|never` (strings), `publishResources` = bool.

## G6 — render hook templates not found

**Symptom.** Hook files exist but Hugo ignores them.

**Cause.** Directory moved. Current: `layouts/_markup/render-*.html` (plus `layouts/_partials/`,
`layouts/_shortcodes/`). Legacy: `layouts/_default/_markup/`. `_default` is no longer used by the
current template system.

## G7 — image resource methods

`.Exif` was deprecated in 0.155.0 in favour of `.Meta` (0.155.3), and converting an image does
not carry metadata forward. `[imaging.exif]` keys (`disableDate`, `disableLatLong`,
`excludeFields`, `includeFields`) still configure what gets read.

## G8 — syntax-highlighting keys

- Fence options: `lineNos`, `lineNoStart`, `hl_lines`, `style` — not `linenos`/`linenostart`.
- `[markup.highlight]`: key names and defaults matter (`noClasses`, `style`, `wrapperClass`,
  `lineNumbersInTable`, `anchorLineNos`, `guessSyntax`, `codeFences`, `tabWidth`). Verify against
  the installed version; several defaults changed. `hugo gen chromastyles` emits a stylesheet
  when you switch to class-based highlighting.

## G9 — menu templates: `IsMenuCurrent` takes a Menu object

`PAGE.IsMenuCurrent MENU MENUENTRY` — the first argument is the entry's `.Menu` object, **not**
the menu name string (that was the old API). Entries must come from front matter or a config
entry with `pageRef` for menu/page association to work.

## G10 — Go template `and`/`or` do not short-circuit

`{{ if and $p $p.Title }}` still evaluates `$p.Title` and panics when `$p` is nil, because
`and` is a function. Precompute with `with`, or compute a safe value first.

## G11 — unguarded resource pipeline kills the build

`resources.Get "css/x.css" | minify | fingerprint` panics once the file is missing or renamed.
Wrap it in `with` and fail with `errorf` so the message names the missing asset.

## G12 — `with .Date` is always true

`time.Time` is a struct, so truthiness never fails. Use `{{ if not .Date.IsZero }}` before
formatting, or a page without a date prints `0001-01-01`.

## G13 — the build log is from a half-written file

**Symptom.** A failure that disappears on the next build without any edit, or an error against a
file whose content cannot produce it.

**Cause.** A watcher (`hugo server`) rebuilt while files were still being written. Editing while
a watcher runs guarantees these ghosts.

**Fix.** Stop the watcher (or serialize the work), then rebuild with `--ignoreCache`. Treat any
log captured during writes as unverified.

## G14 — duplicate or missing section weights

Section order comes from `_index.md` weight. Two sections sharing a weight order unpredictably;
a moved page keeps its old weight and can collide with a sibling. Re-check weights after any
file move.

## G15 — pages that moved but links did not

Moving or renaming a page changes its URL; every inbound root-relative link is now dead. Hugo
does not warn. Grep for the old path (`/old/section/page/`) across content and rewrite all hits
in one pass, then re-run the checker.

## G16 — `public/` lies in both directions

- Stale files remain after a page is deleted or renamed; prune with `--cleanDestinationDir`.
- Conversely, a page missing from `public/` means it never rendered — the fastest way to prove a
  long-standing failure that the console only hints at.

## G17 — CJK headings and anchors

Hugo keeps CJK characters in ids and drops punctuation, so `## 草稿、将来与过期内容` yields
`#草稿将来与过期内容`. An anchor copied from a GitHub-style renderer (`#cascade-1`) will not
match. Confirm ids from the rendered HTML.

## G18 — empty taxonomy pages

Default `tags`/`categories` taxonomies produce `/tags/` and `/categories/` even with no terms.
Either accept them or `disableKinds = ["taxonomy", "term"]`.

## G19 — `baseURL` and subpath deployment

Root-relative links (`/a/b/`) assume the site is served from the domain root. Deploying under a
subpath requires `baseURL` to include it, otherwise every internal link 404s. `hugo server`
usually masks the problem because it serves from `/`.

## G20 — `resources.Get` vs page resources

`resources.Get` reads `assets/`; files inside a leaf bundle are page resources reachable via
`.Resources`. A file in `static/` is copied verbatim and cannot be processed by the asset
pipeline.
