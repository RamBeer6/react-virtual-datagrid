import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table' // type-only imports
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SaleRow } from '../types'

// NEW (Step 2.1 + 2.2):
import { useDebounce } from '../hooks/useDebounce'
import { Toolbar } from './Toolbar'

interface Props { data: SaleRow[] }

const columns: ColumnDef<SaleRow, any>[] = [
  { accessorKey: 'id', header: 'ID', size: 70 },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'category', header: 'Category', size: 120 },
  { accessorKey: 'quantity', header: 'Qty', size: 70 },
  { accessorKey: 'price', header: 'Price', cell: ({ getValue }) => getValue<number>().toFixed(2), size: 100 },
  { accessorKey: 'cost', header: 'Cost', cell: ({ getValue }) => getValue<number>().toFixed(2), size: 100 },
  {
    id: 'marginPct',
    header: 'Margin %',
    cell: ({ row }) => {
      const price = row.original.price
      const cost = row.original.cost
      const pct = price > 0 ? ((price - cost) / price) * 100 : 0
      return pct.toFixed(1)
    },
    size: 100,
  },
  { accessorKey: 'status', header: 'Status', size: 120 },
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(), size: 140 },
]

export function DataTable({ data }: Props) {
  // Table sorting (from Step 1)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [error, setError] = React.useState(false);

  // NEW: Search state + debounced value (Step 2.3)
  const [search, setSearch] = React.useState('')
  const debounced = useDebounce(search, 300) // עדיין לא מסנן איתו — רק מציגים
  // Step 2.4 — filtering by debounced search
  const filtered = React.useMemo(() => {
    // אם אין חיפוש, החזר את כל הרשומות
    if (!debounced) return data;

    const s = debounced.toLowerCase();

    return data.filter((row) =>
      row.customer.toLowerCase().includes(s) ||
      row.category.toLowerCase().includes(s)
    );
  }, [data, debounced]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
    columnResizeMode: 'onChange',
    debugTable: false,
  })

  const parentRef = React.useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div className="tableShell">
      <div className="caption">
        Step 2.6: Debounced search + Empty + Error states
      </div>

      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => setError(true)}>Simulate Error</button>
        <button onClick={() => setError(false)}>Recover</button>
      </div>


      {/* NEW: Toolbar UI */}
      <div style={{ padding: '0 12px' }}>
        <Toolbar
          search={search}
          onChange={setSearch}
          onReset={() => setSearch('')}
        />
        {/* מציגים את הערך המדובאנס כדי למנוע unused-warning ולהדגים UX */}
        <div className="caption">Debounced value: “{debounced || '—'}”</div>
      </div>

      {/* Header */}
      <div className="tableHeader">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort()
                  const sortDir = h.column.getIsSorted()
                  const sortIcon = sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '⇵'
                  return (
                    <th
                      key={h.id}
                      className="th"
                      style={{ width: h.getSize() }}
                      onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {canSort && <span style={{ marginLeft: 6, opacity: 0.7 }}>{sortIcon}</span>}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
        </table>
      </div>

      {/* Virtualized body */}
      <div ref={parentRef} className="tableContainer">
        <div style={{ height: totalSize, position: 'relative' }}>
          <table className="table" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <tbody>
              {error ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ padding: 20, textAlign: 'center', color: 'red' }}
                  >
                    Failed to load data… (simulated)
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ padding: 20, textAlign: 'center', opacity: 0.7 }}
                  >
                    No results found…
                  </td>
                </tr>
              ) : (
                virtualRows.map((vr) => {
                  const row = table.getRowModel().rows[vr.index];
                  return (
                    <tr
                      key={row.id}
                      className={`tr ${vr.index % 2 === 0 ? 'even' : 'odd'}`}
                      style={{ transform: `translateY(${vr.start}px)` }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="td" style={{ width: cell.column.getSize() }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>


          </table>
        </div>
      </div>
    </div>
  )
}
