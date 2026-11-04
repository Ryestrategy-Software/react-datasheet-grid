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
- This repository and its compiled GitHub Releases are public. Keep private
  consumer code, credentials, customer data, and internal operational details out.
- Keep `private: true` in package.json to prevent accidental npm publishing.
  Consumers install a versioned release asset URL and commit their lockfile;
  never embed credentials or require a checked-in release archive.
