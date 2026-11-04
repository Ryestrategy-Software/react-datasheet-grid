# Agent guidance

Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing this fork. It is the canonical
maintenance, verification, release, and upstream-update policy.

- Trace every affected caller. Keep the smallest change in `src/`.
- Features are generic and opt-in; preserve default behavior and existing exports.
- Keep application labels, menus, permissions, and persistence in the consumer.
- Do not hand-edit `dist/`, `node_modules/`, or package-lock.json. Build or use npm.
- Extend existing tests. Use real browser checks for layout, clipboard, focus, and
  virtualization; a passing jsdom test does not establish these behaviors.
- Run `npm test -- --runInBand`, `npm run build`, and `git diff --check`. Report
  checks not run and inherited failures separately. Verify the packed artifact in
  the consumer before release; never overwrite release tags/assets.
- Retain upstream history and the MIT license. Avoid dependency upgrades unrelated
  to the change, and keep runtime dependencies unchanged when possible.

- Use `main` for our PR base; `upstream/master` belongs to the original author.
- Keep the source and releases private. Keep `private: true` in package.json.
  Consumers commit verified release archives in their own private repository;
  never embed credentials or make the package public to simplify installation.
