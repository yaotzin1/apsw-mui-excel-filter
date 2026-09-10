# apsw-mui-excel-filter

An Excel-style filter dropdown for [Material UI](https://mui.com). Type to narrow the list,
untick what you want gone, confirm with OK.

Most React multiselects are a checkbox list with a search box bolted on. This one copies the
behaviour of Excel's AutoFilter dropdown, which behaves differently in three ways that people
who live in spreadsheets already expect.

[![npm](https://img.shields.io/npm/v/apsw-mui-excel-filter)](https://www.npmjs.com/package/apsw-mui-excel-filter)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![CI](https://github.com/yaotzin1/apsw-mui-excel-filter/actions/workflows/ci.yml/badge.svg)](https://github.com/yaotzin1/apsw-mui-excel-filter/actions/workflows/ci.yml)

![Building a filter out of two search terms](https://raw.githubusercontent.com/yaotzin1/apsw-mui-excel-filter/main/docs/usage.gif)

Typing `syd` selects Sydney and drops every other city. Ticking *Add current selection to
filter* hands the selection back, so typing `tok` narrows the list without losing Sydney,
and OK applies both. Recorded from [`example/`](./example).

## Install

```bash
npm install apsw-mui-excel-filter
```

Material UI and React are peer dependencies, so the package uses whichever copy your app
already has:

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled react react-dom
```

Works with MUI 5, 6 and 7, and React 17, 18 and 19.

## Use

```tsx
import { useState } from 'react';
import { ExcelFilterSelect } from 'apsw-mui-excel-filter';

const OPTIONS = [
    { value: 'pump', label: 'Pump' },
    { value: 'motor', label: 'Motor' },
    { value: 'drill', label: 'Drill' },
];

export function Filters() {
    const [kinds, setKinds] = useState<string[]>([]);

    return (
        <ExcelFilterSelect
            label="Kind"
            options={OPTIONS}
            value={kinds}
            onChange={setKinds}
        />
    );
}
```

`onChange` fires on OK only, never while the popup is being edited, so a half-built
selection never triggers a request.

## Try it

[`example/`](./example) is a Vite app that filters a day of meal orders by cuisine, city and
status with three of these fields, and shows the request the three values would make so you
can watch a parameter leave the query string as a field goes back to unfiltered.

```bash
cd example
npm install
npm run dev
```

## What makes it Excel

**Filtering is subtractive.** A field with no filter opens with every option ticked, exactly
as an AutoFilter dropdown does. You filter by unticking. Tick everything back and the field
is unfiltered again.

**An unfiltered field emits an empty array.** The value still speaks in "these ones", so
`['pump', 'motor']` means those two. But when everything ends up ticked, `onChange` gets `[]`
rather than every id in the list. That saves you comparing a full id list against your
options to notice that no filter is set, and it keeps the parameter out of your query string.
The consequence worth knowing: `value={[]}` means *all*, not *none*. There is no way to
express "match nothing", which is why OK is disabled while nothing is ticked.

**Typing selects, it does not merely hide.** Type `pum` and the matches are ticked and
everything else is dropped, so OK filters to what you typed. Press Enter to apply without
reaching for the button. Clear the box and the selection you had before the search comes
back, so a mistyped search costs nothing.

That last rule means a second search replaces the first. To build a selection out of two
terms, tick **Add current selection to filter**, which appears while you are searching. It
hands the selection back to you: the search then only narrows what is on screen, and nothing
you have ticked disappears because you typed.

1. Type `pum`, and untick any match you did not want.
2. Tick *Add current selection to filter*.
3. Type `mot`. The list narrows, and your pumps stay ticked while they are off screen.
4. Tick the motors you want. OK applies both sets.

Ticking it also puts back the selection the search had just replaced, since by the time you
can reach the option the search has already been and gone. The exception is a field where
everything was ticked, which says "no filter" rather than a selection worth restoring, so
the term you typed survives.

The option stays on until you turn it off, across openings of the same field, and it stays
visible while it is on so you can see that searching will not pick for you. Turning it off
puts the search back in charge, and the term on screen becomes the whole selection again.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `FilterOption[]` | required | `{ value: string \| number; label: string }` |
| `value` | `Array<string \| number>` | required | Empty means no filter, so everything opens ticked |
| `onChange` | `(value: string[]) => void` | required | Fires on OK only. Always string keys |
| `label` | `string` | | Floating label of the closed field |
| `helperText` | `string` | | |
| `labels` | `Partial<ExcelFilterLabels>` | `enUS` | Merged over the English defaults |
| `locale` | `string` | runtime locale | BCP 47 tag used for case folding while searching |
| `disabled` | `boolean` | `false` | |
| `allowAddToSelection` | `boolean` | `true` | Offer the "add current selection" option at all |
| `pinSelectedToTop` | `boolean` | `true` | Float the selected options to the top on open |
| `maxListHeight` | `number` | `280` | Height of the scrolling list, in px |
| `width` | `number \| string` | `300` | Width of the closed field |
| `height` | `number \| string` | `32` | Height of the closed field |
| `id`, `name`, `sx` | | | Passed to the closed field |

## Translating it

Every string is replaceable. Polish ships with the package; anything else is an object
literal:

```tsx
import { ExcelFilterSelect, plPL } from 'apsw-mui-excel-filter';

<ExcelFilterSelect labels={plPL} locale="pl" {...props} />
```

Override one string and the rest stay English:

```tsx
<ExcelFilterSelect labels={{ ok: 'Apply' }} {...props} />
```

`selectedCount` is a function, because languages disagree about how to count:

```tsx
<ExcelFilterSelect labels={{ selectedCount: (n) => `${n} ausgewählt` }} {...props} />
```

## Where it comes from

This is not a component written to be a package. It was built for a production
line-of-business app, where people filter long equipment lists all day and had been asking
for the dropdown to behave the way the spreadsheets on the next monitor do. The rules here
are what those users asked for, argued about, and settled on in use.

[Claude Code](https://claude.com/claude-code) extracted it from that codebase: lifting the
component out, replacing the hardcoded Polish strings and app-specific wiring with props,
dropping the branches the surrounding screen made unreachable, and covering the behaviour
with the test suite below before any of it was published.

Built and maintained by [APSW](https://apsw.pl).

## Development

```bash
npm install
npm test          # 47 tests, 100% coverage of src
npm run coverage
npm run typecheck
npm run build
```

## License

MIT, © [APSW](https://apsw.pl).
