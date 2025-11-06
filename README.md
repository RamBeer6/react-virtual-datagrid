# Virtualized DataGrid Demo (React + TypeScript)

A high-performance data grid demo built for large datasets (10k+ rows).  
Includes virtualization, debounced search, sorting, computed columns, CSV export, and UI empty/error states.

---

## 🚀 Features

- ⚡ **Virtualized rows** — smooth scrolling, constant DOM size
- 🔍 **Debounced search**
- 🔁 **Column sorting**
- 🧮 **Computed column** (Margin %)
- 📤 **CSV export** of the filtered view
- 🧯 **Error & Recover** UI flows
- 🙈 **Empty state** handling
- 🧹 **Clean console** (zero warnings)
- 🎯 Lightweight and highly performant

---

## 🧱 Tech Stack

- React 18
- TypeScript
- @tanstack/react-table
- @tanstack/react-virtual
- Vite
- Custom utility hooks

---

## 🧠 Why Virtualization?

Rendering thousands of `<tr>` elements blocks the browser.  
Virtualization keeps **only the visible rows** in the DOM and simulates scroll height with a spacer.

Benefits:
- Constant memory usage
- Smooth FPS
- No layout jank
- Great UX on large datasets

---

## 🔍 Debounced Search

User input is wrapped in a `useDebounce()` hook (300ms).  
Prevents:
- Wasteful recalculation
- Input jitter
- Excess component renders

Search uses pre-lowercased fields (`customerLC`, `categoryLC`) to avoid per-render string operations.

---

## 🧮 Computed Column (Margin %)

Margin is derived at render time:

```ts
const pct = price > 0 ? ((price - cost) / price) * 100 : 0
