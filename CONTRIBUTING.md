# Maintaining the RyeStrategy fork

RyeStrategy maintains this private repository and its private releases. Keep changes generic and
small. Product-specific menus, labels, permissions, and saved preferences belong
in the consuming app. New features must be opt-in with existing defaults preserved;
bug fixes must retain coverage for consumers that do not enable those features.

## Source and provenance

The initial base is `wasback/react-datasheet-grid` commit
`b84f362436baed9b85688e93d79e53ad19690225`. Its package manifest says 4.15.1,
but its compiled JavaScript and CSS match the published 4.15.2 package. The
published package names gitHead `f5e133019c3eb811e9fb0c7367311292cf179ab8`,
which was not available from the upstream remote when this fork was prepared.
Rebuilding with current React types changes two equivalent JSX return-type
spellings. Preserve the MIT license and upstream history.

The repository is maintained independently of GitHub's public fork network so
its source and releases can remain private. Git history and the MIT license are
preserved. `origin/main` is our default branch and PR base; `upstream/master`
remains the original author's branch. The initial `master` name was inherited
when creating the fork and was renamed to `main` to match our convention.

For an existing clone that still has a local `master` branch:

```sh
git branch -m master main
git fetch origin --prune
git branch --set-upstream-to=origin/main main
git remote set-head origin -a
```

Change `src/`, never generated `dist/` or installed `node_modules/`. Run the build
to generate JavaScript, declarations, source maps, and CSS. This fork carries:

- Optional `stickyFirstColumn` support across layout, hit testing, selection,
  navigation, and virtualization.
- Deferred editors remain mounted until their edit is committed or cancelled.
- Strict Mode mounts do not commit untouched deferred editors.
- Native scrollbar presses and slight pointer movement do not end editing.

Positioning uses native CSS sticky behavior so the first column and its active
outline stay fixed before a scroll event reaches React. Selection geometry still
uses scroll state; do not replace native positioning with per-scroll React offsets.
Test real browser scrolling before changing this interaction.

## Develop and verify

Use Node.js 24 and the committed npm lockfile:

```sh
npm ci
npm test -- --runInBand
npm run build
npm pack --dry-run
```

CI runs `npm test -- --coverage --runInBand`, then builds and checks the package.
Coverage uses Jest's native V8 provider because the inherited Babel instrumentation
exhausts the heap on Node 24. Keep the locked `source-map` 0.7.6 patch: the older
0.7.3 dependency misidentifies Node's global `fetch` as a browser environment and
fails to load its coverage source maps. These are development-tool changes only.

The Jest suite covers behavior that jsdom can observe, including frozen-width
limits and untouched deferred editors. It cannot prove browser layout or clipboard
behavior. Before releasing grid changes, install the packed artifact in a consumer
and run its browser regression tests. Cover frozen and unfrozen grids, horizontal
and vertical virtualization while editing, commit/Escape, selection across the
frozen boundary, copy/paste, narrow widths, and custom context-menu actions.
Portal's integration checks are documented in its `docs/datasheet-grid-fork.md`.

Do not add a new test framework to duplicate existing consumer browser coverage.
Add the smallest behavioral test in the owning layer for each regression.

## Releases

We distribute compiled tarballs through **private** GitHub Releases. A maintainer
with repository access downloads the release into the consumer's private `vendor/`
directory, verifies its SHA-256, and commits it together with the dependency path
and lockfile. Normal development and CI install this checked-in artifact; they do
not need a GitHub package token or network access to this private repository.
Only maintainers downloading or publishing releases need GitHub authentication.

The package name is `@ryestrategy/react-datasheet-grid`; an existing dependency name
may be retained as an alias in the consumer. `private: true` prevents accidental
npm publishing and still permits `npm pack`. Keep this flag and do not restore
the inherited public publishing configuration.

Use `4.15.2-rye.N` for releases based on upstream 4.15.2, incrementing N for each
release. When adopting another upstream version, update the base and restart the
Rye suffix. Never replace an existing tag, release asset, or versioned consumer
archive. Review changes, test the consumer, and merge into `main` before a stable
release. A pre-merge validation release must be marked `--prerelease --latest=false`.
For example (substitute the next version):

```sh
npm version 4.15.2-rye.3 --no-git-tag-version
# Commit package.json and package-lock.json through review before packing.
npm ci
npm test -- --runInBand
npm pack --pack-destination /tmp
shasum -a 256 /tmp/ryestrategy-react-datasheet-grid-4.15.2-rye.3.tgz
gh release create v4.15.2-rye.3 \
  /tmp/ryestrategy-react-datasheet-grid-4.15.2-rye.3.tgz \
  --repo Ryestrategy-Software/react-datasheet-grid \
  --target "$(git rev-parse HEAD)" \
  --title '4.15.2-rye.3' --notes-file /tmp/grid-release-notes.md
```

`npm pack` builds through `prepack`. Review the archive: it must contain `dist/`,
the manifest, README, and license, with no application code or credentials. Record
the full source commit and artifact SHA-256 in release notes, together with the
upstream base, changes, checks, and compatibility limits. Upload exactly the
archive tested in the consumer. Generated archives must never be hand-edited.

For Portal, download the release into its root `vendor/`, set SMB's existing
`@wasback/react-datasheet-grid` dependency to
`file:../../vendor/ryestrategy-react-datasheet-grid-<version>.tgz`, update the version,
commit, and checksum in `docs/datasheet-grid-fork.md`, and regenerate `bun.lock` with
`bun install`. Verify a frozen install and the documented consumer tests before
committing those files together. Other private consumers follow the same process
with paths relative to their manifest. Do not point dependencies at private release
URLs, absolute local paths, or moving branches. Rollback restores the previous
archive, dependency path, provenance record, and lockfile together.

## Upstream updates

Before a new library feature or release, check the wasback fork and original
repository for relevant fixes. Do not auto-merge or automatically upgrade consumers.

```sh
git remote add upstream https://github.com/wasback/react-datasheet-grid.git
git fetch upstream
git log --oneline HEAD..upstream/master
```

Add the remote only once. Review proposed upstream changes on a branch, preserving
our optional API and editing fixes. Compare the source and published package when
their versions diverge. Run the library suite/build and consumer browser checks
before release. Remove a local fix only when upstream supplies equivalent behavior
and its regression test still passes. Offer generic improvements upstream when
practical; an upstream merge is not required to maintain this fork.

The original [example app](example) and [website](website) remain upstream resources;
their setup is independent from the fork's package and release checks above.
