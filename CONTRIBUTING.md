# Maintaining the RyeStrategy fork

RyeStrategy maintains this repository and its releases. Keep changes generic and
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

We distribute compiled tarballs through GitHub Releases. Consumers pin a release
URL and lockfile integrity; they must not depend on a moving Git branch. This does
not require an npm publishing token. The package name is
`@ryestrategy/react-datasheet-grid`; an existing dependency name may be retained as
an alias in the consumer.

Use `4.15.2-rye.N` for releases based on upstream 4.15.2, incrementing N for each
release. When adopting another upstream version, update the base and restart the
Rye suffix. Never replace an existing tag or release asset. Review changes, test
the consumer, and merge before making a release. For example, from a clean checkout
of the commit to release (substitute the next version):

```sh
npm version 4.15.2-rye.2 --no-git-tag-version
# Commit the updated package.json and package-lock.json through review first.
npm ci
npm test -- --runInBand
npm pack --pack-destination /tmp
gh release create v4.15.2-rye.2 \
  /tmp/ryestrategy-react-datasheet-grid-4.15.2-rye.2.tgz \
  --target "$(git rev-parse HEAD)" \
  --title '4.15.2-rye.2' --notes-file /tmp/grid-release-notes.md
```

`npm pack` builds through `prepack`. Review the archive: it must contain `dist/`,
the manifest, README, and license, with no application code or credentials. Release
notes record the upstream base, changes, checks, and compatibility limits. Then
update the consumer URL and regenerate its lockfile with its package manager.
Rollback means restoring the previous dependency URL and lockfile, not moving tags.

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
