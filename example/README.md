# Example

A small Vite app that filters a day of meal orders with three `ExcelFilterSelect` fields:
cuisine, the city the order went to, and where it got to.

```bash
cd example
npm install
npm run dev
```

The screen shows a filter toolbar, the table it narrows, and the request the three values
would make, so the rule that an all-ticked field emits `[]` is visible as a parameter that
disappears from the query string.

Things worth trying once it is open:

- Open **Cuisine**, untick **Thai**, press OK. Filtering is subtractive, so a field opens
  with everything ticked and you filter by unticking.
- Type `jap` into the same field. Japanese becomes the selection and everything else is
  dropped. Press Enter to apply without reaching for OK.
- Open **City**, type `syd`, tick **Add current selection to filter**, then type `tok`. The
  list narrows, Sydney stays ticked while it is off screen, and OK applies both.
- Tick everything back and the parameter leaves the query string again.

`src/App.tsx` is the whole demo, and `src/data.ts` is the orders and their option lists.

## How it resolves the component

The example reads `../src` through a Vite alias and a `paths` entry in its tsconfig, so
editing the component shows up here on save with no build step in between. Your own app
needs none of that:

```bash
npm install apsw-mui-excel-filter
```

```tsx
import { ExcelFilterSelect } from 'apsw-mui-excel-filter';
```

The example keeps its own `node_modules`, which is where its copy of React and MUI comes
from. Those are peer dependencies of the package, so an installed copy uses whichever one
your app already has.
