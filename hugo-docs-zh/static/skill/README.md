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

**Fixed: it installs into the current project, not a user-level directory.**

```text
<current project>/.dsh/skills/hugo-static-site/
```

Project scope is deliberate. The skill then travels with the repository — everyone who clones the
project gets the same manual, and an agent working there cannot end up in the "I have it, you don't"
state that a per-machine install produces. One project, one copy; nothing else on the machine is
touched.

**How** the files get there, and how the project is made to load them, is the agent's call. Loaders
differ (scanning a skills directory, declaring a directory in project config, a per-project profile
patch), and the agent working in the project knows its own convention better than this document
does. Use whatever convention the project already has; do not introduce a mechanism it does not.

**Fixed contract, whatever the mechanism:**

1. the directory is `<current project>/.dsh/skills/hugo-static-site/` and holds all twelve files;
2. internal relative paths are preserved — `references/gotchas.md` stays at
   `<skill-dir>/references/gotchas.md`, never flattened to the root;
3. every file's SHA-256 matches the manifest, and the loader can actually read `SKILL.md` (ask it to
   restate the first iron rule: an unescaped shortcode delimiter anywhere in content fails the
   **entire** build).

**Materials.** The manifest at <https://hugozh.cn/skill/skill-manifest.json> lists each file's
`path`, `bytes`, `sha256` plus two download locations (`url` site mirror, `rawUrl` repository).
The source is `.dsh/skills/hugo-static-site/` in <https://github.com/hencter/hugozh>.

**Manual route** (for a human, not a loader): clone the repository and copy the folder into
`.dsh/skills/`. Note that `git` rewrites line endings on some platforms (notably Windows), so a
clone can hash differently from the manifest while the content is identical; fetch per-file from
the manifest `url` when an exact hash match is required.

**Loader timing.** DSH builds its skill catalog when a session starts, so a freshly installed skill
appears only in a new session. Other loaders have their own reload rules — follow the project's,
not this one's.

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
