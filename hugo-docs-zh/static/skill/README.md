# hugo-static-site

A skill for building, updating, and verifying Hugo static sites — theming and multi-theme
layering, SEO head output and structured data, content in bulk, localized teaching-oriented
documentation — and for diagnosing the build failures that Hugo attributes to the wrong file.

It is written for agents in general, not for one product: the files are plain Markdown with no
scripts, no dependencies and no absolute paths, and the install contract below is the same
whatever loader you use.

It exists because a 200-page Hugo site was built the hard way: the traps in
[`references/gotchas.md`](references/gotchas.md) each cost a real debugging cycle, and one of them
(`HAHAHUGOSHORTCODE`) had silently prevented a page from rendering since the day it was written.

## Contents

```text
hugo-static-site/
├── SKILL.md                        # workflow + iron rules (loaded as the skill)
├── README.md                       # this file
└── references/
    ├── commands.md                 # command notes: what the workflow uses (reference: `hugo gen doc`)
    ├── dates.md                    # date fields, time zones, localized formats, relative time
    ├── gotchas.md                  # G1…G26: symptom → cause → fix
    ├── i18n.md                     # optional multilingual setup, switcher, i18n strings
    ├── seo.md                      # head tags, JSON-LD pitfall, sitemap/robots, performance
    ├── shortcodes.md               # authoring custom shortcodes: notation, methods, nesting
    ├── site-structure.md           # theme layers, front matter, navigation, i18n
    ├── teaching-layer.md           # human/machine doc parity: front-matter contract, shared partials
    ├── versioning.md               # what to track, gitInfo, commit-backed "last updated"
    └── versions.md                 # version-keyed renames and defaults
```

Twelve files in total. A published mirror of this folder, with a machine-readable manifest
(`path`, `bytes`, `sha256`, `url`, `rawUrl` per file), lives at <https://hugozh.cn/skill/> —
`https://hugozh.cn/skill/skill-manifest.json`.

**No scripts, and nothing transcribed that Hugo can generate.** Verification uses Hugo's own
documented commands (`--printPathWarnings`, `--printUnusedTemplates`, `--printI18nWarnings`,
`--panicOnWarning`, `--templateMetrics`, `hugo config`, `hugo list all`) plus two plain `grep`
commands for the two source-level traps no flag reports. The CLI reference, the settings table and
the highlight stylesheet all have generating commands — `hugo gen doc`, `hugo config`,
`hugo gen chromastyles` — so the reference files only say where those live and which flags this
workflow prescribes; what cannot be generated (the trap catalogue, the workflow) is written down.

## Install

The install contract is deliberately loader-agnostic. **Fixed, whatever loads the skill:**

1. the directory is named `hugo-static-site`;
2. the internal relative paths are preserved — `references/gotchas.md` stays at
   `<skill-dir>/references/gotchas.md`, never flattened to the root;
3. after copying, every file's SHA-256 matches the manifest, and the loader can actually read
   `SKILL.md` (ask it to restate the first iron rule: an unescaped shortcode delimiter anywhere in
   content fails the **entire** build).

**Where** those files go is a property of your loader, not of this skill. Two mechanical options
that need no loader support at all:

- **Copy into the project** — `<your project>/.dsh/skills/hugo-static-site/` (or any directory your
  loader is configured to scan). Travels with the repository, so collaborators get the same manual;
- **Copy into a user-level skills directory** — the conventional fallback when a loader has no
  documented location of its own: `~/.dsh/skills/hugo-static-site/`.

**If your loader is DSH specifically:** put the folder in a `skills` directory beside the profile
data (`~/.dsh/skills/hugo-static-site/`, or `<project>/.dsh/skills/hugo-static-site/`), or point it
at wherever you keep it by adding a patch entry to
`~/.dsh/profiles/<profile>/cordis.patch.yml`:

```yaml
- id: skill-filesystem
  name: "@deepseek-ai/dsh-skill-filesystem"
  config:
    customSkillDirs:
      - <absolute path of the directory that contains hugo-static-site>
```

The skill catalog is built when a session starts, so restart DSH or open a new session — a freshly
installed skill does not appear mid-session. Other loaders have their own reload rules; check
theirs rather than assuming this one.

**Fetching the files.** Either `git clone` the repository and copy the folder, or — when a loader
has no filesystem access — fetch each file listed in the manifest from its `url` and write it to
its `path`. Prefer the manifest route when hashes must match: `git` rewrites line endings on some
platforms (notably Windows), so a clone can hash differently while the content is identical.

**No installation at all.** Read `SKILL.md` and follow it as plain documentation. Nothing here
requires being loaded as a skill.

## Use

- Ask for a Hugo task ("add a section to the site", "translate these pages", "the build fails
  with …") and the skill's rules apply once loaded.
- Verify with the commands in `SKILL.md` → *Build and verify*; `references/commands.md` lists the
  commands the workflow uses and the flags it prescribes, and `hugo gen doc --dir <dir>` produces
  the full CLI reference for your version.

## Scope and limits

- The reference files record documentation plus observed behaviour; each claim is labelled
  *documented*, *observed*, or *not documented* (see `SKILL.md` → *Sources and the citation rule*).
- Version claims in `references/versions.md` were observed against a **0.167.0** documentation
  snapshot. Verify against the installed binary (`hugo version`, `hugo config`) before relying on
  them.
- Only Hugo's own exit status proves a build. Everything in this skill is preparation for reading
  that output correctly.
