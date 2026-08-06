# Virtualized DataGrid

A React and TypeScript data grid designed for datasets of 10,000+ rows.

The project focuses on frontend performance and predictable UI behavior through row virtualization, debounced filtering, sortable columns, computed values, CSV export, and explicit loading, empty, error, and recovery states.

## Features

- virtualized row rendering with a constant-size DOM footprint
- debounced search
- sortable columns
- computed margin percentage
- CSV export for the filtered dataset
- loading, empty, error, and recovery flows
- clean console output with no runtime warnings

## Technology Stack

- React 19
- TypeScript
- Vite
- TanStack Table
- TanStack Virtual
- TanStack Query
- custom utility hooks

## Quick Start

### Requirements

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Performance Approach

### Row Virtualization

Rendering thousands of table rows at once creates unnecessary DOM nodes and can block the browser during layout and paint work.

The grid uses TanStack Virtual to render only the rows currently visible in the viewport while simulating the full scroll height. This keeps the DOM size stable even when the underlying dataset grows.

### Debounced Filtering

Search input is wrapped in a custom `useDebounce()` hook with a 300 ms delay. This reduces repeated filtering work and avoids recalculating the full dataset on every keystroke.

Searchable fields are normalized in advance, including lower-cased customer and category values, to avoid repeating string transformations during filtering.

### Computed Columns

Margin percentage is derived at render time from the current price and cost values:

```ts
const pct = price > 0 ? ((price - cost) / price) * 100 : 0
```

The calculation also handles a zero-price edge case explicitly.

## User Experience States

The grid includes explicit handling for:

- initial loading
- empty datasets
- filtered results with no matches
- recoverable errors
- successful reloads after an error

These states keep the interface predictable instead of relying on a blank table or console-only failure reporting.

## Engineering Focus

This project demonstrates:

- performance-aware component design
- typed table configuration
- controlled filtering and sorting
- separation of reusable UI behavior into hooks
- handling of non-happy-path UI states
- production build and lint validation
