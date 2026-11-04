# @ryestrategy/react-datasheet-grid

RyeStrategy's privately maintained fork of
[@wasback/react-datasheet-grid](https://github.com/wasback/react-datasheet-grid),
which adds React 19 support to
[react-datasheet-grid](https://github.com/nick-keller/react-datasheet-grid).
It preserves that API and adds optional first-column freezing and fixes for
deferred editing during scrolling and Strict Mode.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for source ownership, regression checks,
release instructions, and the policy for incorporating upstream changes.

## Install

The repository and release assets are private. A maintainer with repository access
downloads the compiled package; application builds install a versioned copy from
their own private repository, without an additional GitHub token:

```bash
mkdir -p vendor
gh release download v4.15.2-rye.2 \
  --repo Ryestrategy-Software/react-datasheet-grid \
  --pattern ryestrategy-react-datasheet-grid-4.15.2-rye.2.tgz --dir vendor
npm install ./vendor/ryestrategy-react-datasheet-grid-4.15.2-rye.2.tgz
```

Portal already includes the archive; run its normal `bun install --frozen-lockfile`.
Do not use a private release URL directly as a dependency or publish this package
to a public registry. See the maintenance guide for checksums and update steps.

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
The library does not know about Employees or a column named Name.

The first column is capped at half the viewport remaining after the gutter, so
other columns remain usable in a narrow container. Selection, editing, clipboard,
and virtualization continue to use the same grid. Only the first data column is
supported; arbitrary pinned columns are outside this API.
