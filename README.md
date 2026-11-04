# @ryestrategy/react-datasheet-grid

RyeStrategy's maintained fork of
[@wasback/react-datasheet-grid](https://github.com/wasback/react-datasheet-grid),
which adds React 19 support to
[react-datasheet-grid](https://github.com/nick-keller/react-datasheet-grid).
It preserves that API and adds optional first-column freezing and fixes for
deferred editing during scrolling and Strict Mode.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for source ownership, regression checks,
release instructions, and the policy for incorporating upstream changes.

## Install

Install the compiled package from a versioned public GitHub Release. No GitHub
credentials or registry configuration are required:

```bash
npm install https://github.com/Ryestrategy-Software/react-datasheet-grid/releases/download/v4.15.2-rye.2/ryestrategy-react-datasheet-grid-4.15.2-rye.2.tgz
```

Bun also accepts this URL. Commit the dependency URL and generated lockfile;
use a frozen install in CI. Existing consumers can retain their dependency name
as an alias. Use the attached compiled `.tgz`, not GitHub's automatic source
archive: the source tree does not include `dist/`.

This version is a validation prerelease pending review. See the release notes
for its source commit and SHA-256, and [CONTRIBUTING.md](CONTRIBUTING.md) for
maintenance and update instructions. The package's `private: true` flag prevents
accidental npm publishing; it does not restrict public release downloads.

## Usage

```tsx
import {
  DataSheetGrid,
  checkboxColumn,
  textColumn,
  keyColumn,
} from '@ryestrategy/react-datasheet-grid'

// Import the style only once in your app!
import '@ryestrategy/react-datasheet-grid/dist/style.css'

const Example = () => {
  const [data, setData] = useState([
    { active: true, firstName: 'Elon', lastName: 'Musk' },
    { active: false, firstName: 'Jeff', lastName: 'Bezos' },
  ])

  const columns = [
    {
      ...keyColumn('active', checkboxColumn),
      title: 'Active',
    },
    {
      ...keyColumn('firstName', textColumn),
      title: 'First name',
    },
    {
      ...keyColumn('lastName', textColumn),
      title: 'Last name',
    },
  ]

  return <DataSheetGrid value={data} onChange={setData} columns={columns} />
}
```

## Optional first-column freezing

Pass `stickyFirstColumn={true}` to keep the first data column and its header
visible during horizontal scrolling. The default is `false`; the row-number
gutter is separate. This works with both the default and dynamic grid exports.
The consumer owns any toggle, context-menu label, or persistence of this setting.
The library does not interpret application-specific field names.

The first column is capped at half the viewport remaining after the gutter, so
other columns remain usable in a narrow container. Selection, editing, clipboard,
and virtualization continue to use the same grid. Only the first data column is
supported; arbitrary pinned columns are outside this API.
