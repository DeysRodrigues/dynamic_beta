# Conventions

How this repository is worked on. Short on purpose.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), in English, **imperative mood**,
subject only.

```
<type>: <subject>
```

**Imperative, not past tense.** Write the subject as an instruction to the codebase: it should
complete the sentence "if applied, this commit will ...". This is the convention Git itself
uses and the one Conventional Commits assumes.

| Write | Not |
|---|---|
| `fix: resolve primary color recognition in Tailwind` | `fix: resolved primary color recognition in Tailwind` |
| `feat: add workspace task isolation` | `feat: implemented workspace-specific task isolation` |
| `perf: split vendor code into its own chunk` | `perf: optimized UI rendering` |

Commits up to and including `0.12.0` are in past tense, which was the earlier convention.
History is not rewritten; the rule applies from here on.

**Types:** `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`.

**One file per commit.** A commit touches a single file whenever that leaves a commit that
still builds. The exceptions are changes that are atomic by nature: removing an exported
constant along with its only consumer, or `package.json` together with `package-lock.json`.
Splitting those would push a commit that does not compile.

**Subject only, no body.** If the subject cannot say it, the change is too big and should be
two commits.

## Branches

`main` is what Vercel publishes. Nothing is pushed to it directly.

```
main  ←  develop  ←  <type>/<nn>-<slug>
```

Work happens on a branch named with the same type vocabulary as the commits, plus a sequence
number so the order stays visible:

```
fix/01-stray-bugs
refactor/04-persistence-registry
test/03-safety-net
```

A number means a planned step. A small correction that was not planned drops the number:
`docs/changelog-structure`.

Each branch merges into `develop` with `--no-ff`, so one branch is one identifiable merge
commit and `git revert -m 1 <merge>` undoes the whole unit. `develop` merges into `main` only
at a release.

## Changelog

[`CHANGELOG.md`](CHANGELOG.md) follows [Keep a Changelog](https://keepachangelog.com/) and
[Semantic Versioning](https://semver.org/).

- Work in progress goes under `## [Unreleased]`, which carries no version and no date. A
  version number is assigned only when the release ships.
- Sections appear in this order, always, and one of each at most:

  **`Added`** · **`Changed`** · **`Performance`** · **`Fixed`** · **`Removed`**

  That is Keep a Changelog's set with `Performance` added, which this project has used since
  `0.4.0`. A refactor with no visible effect goes under `Changed`; entries up to `0.10.0` use a
  `Refactor` heading, which stays as history and is not used again.
- **Grouped by theme, not by the order the work happened.** Two fixes to the same area sit
  next to each other even if they were written weeks apart.
- **It never mentions a branch or a work phase.** Branches are for whoever is building; the
  changelog is for whoever is using.
- **Churn inside one unreleased window collapses.** If something is added and then removed
  before the release ships, both lines come out: nobody using the release ever saw it. Only
  the net change against the last released version is listed.
- At a release, `## [Unreleased]` becomes `## [x.y.z] - YYYY-MM-DD`, `package.json` is bumped
  to match, and the release is tagged.
