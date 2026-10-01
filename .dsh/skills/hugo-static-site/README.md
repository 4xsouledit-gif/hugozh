# hugo-static-site

A DSH skill for building, updating, and verifying Hugo static sites — theming and multi-theme
layering, SEO head output and structured data, content in bulk — and for diagnosing the build
failures that Hugo attributes to the wrong file.

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
    ├── gotchas.md                  # G1…G22: symptom → cause → fix
    ├── i18n.md                     # optional multilingual setup, switcher, i18n strings
    ├── seo.md                      # head tags, JSON-LD pitfall, sitemap/robots, performance
    ├── shortcodes.md               # authoring custom shortcodes: notation, methods, nesting
    ├── site-structure.md           # theme layers, front matter, navigation, i18n
    ├── versioning.md               # what to track, gitInfo, commit-backed "last updated"
    └── versions.md                 # version-keyed renames and defaults
```

**No scripts, and nothing transcribed that Hugo can generate.** Verification uses Hugo's own
documented commands (`--printPathWarnings`, `--printUnusedTemplates`, `--printI18nWarnings`,
`--panicOnWarning`, `--templateMetrics`, `hugo config`, `hugo list all`) plus two plain `grep`
commands for the two source-level traps no flag reports. The CLI reference, the settings table and
the highlight stylesheet all have generating commands — `hugo gen doc`, `hugo config`,
`hugo gen chromastyles` — so the reference files only say where those live and which flags this
workflow prescribes; what cannot be generated (the trap catalogue, the workflow) is written down.

## Install

Nothing is machine-specific: no scripts, no dependencies, no absolute paths.

**A. Put the folder where DSH already looks.** The natural place is a `skills` directory beside
the profile data, e.g. `~/.dsh/skills/hugo-static-site/`.

**B. Or point DSH at wherever you keep it.** Add a patch entry to
`~/.dsh/profiles/<profile>/cordis.patch.yml`:

```yaml
- id: skill-filesystem
  name: "@deepseek-ai/dsh-skill-filesystem"
  config:
    customSkillDirs:
      - <absolute path of the directory that contains hugo-static-site>
```

The skill catalog is built when a session starts, so restart DSH or open a new session — a
freshly installed skill does not appear mid-session.

**C. No installation.** Read `SKILL.md` and follow it as plain documentation.

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
