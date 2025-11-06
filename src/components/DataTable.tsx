import React from 'react'
import { downloadCSV } from '../lib/csv'
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
  {
    accessorKey: 'price', header: 'Price',
    cell: ({ getValue }) => (getValue<number>()).toFixed(2), size: 100
  },
  {
    accessorKey: 'cost', header: 'Cost',
    cell: ({ getValue }) => (getValue<number>()).toFixed(2), size: 100
  },

  {
    accessorKey: 'marginPct', header: 'Margin %',
    cell: ({ getValue }) => (getValue<number>()).toFixed(1), size: 100
  },

  { accessorKey: 'status', header: 'Status', size: 120 },
  { accessorKey: 'dateISO', header: 'Date', size: 140 },
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
    debugHeaders: false,
    debugColumns: false,
  })

  // יוצר dataset ל-CSV מהמודל של הטבלה (אחרי סינון ומיון)
  const buildCsvRows = React.useCallback(() => {
    // עמודות שיוצאות ל-CSV: משתמשים בעמודות הנראות (visible leaf columns)
    const cols = table.getVisibleLeafColumns();

    // ממפים את כל השורות במודל (כבר אחרי filter+sort)
    const rows = table.getRowModel().rows.map(r => {
      const out: Record<string, unknown> = {};

      cols.forEach(col => {
        const id = col.id; // לדוגמה: 'customer', 'price', 'marginPct'...

        // כותרת קריאה: אם header הוא מחרוזת – נשתמש בה; אחרת id
        const header = typeof col.columnDef.header === 'string'
          ? col.columnDef.header
          : id;

        // ערך התא:
        // עבור עמודות accessor (accessorKey) – row.getValue(id) עובד.
        // עבור עמודה מחושבת 'marginPct' – נחשב ידנית מה-raw.
        let value: unknown;

        if (id === 'marginPct') {
          const price = r.original.price;
          const cost = r.original.cost;
          const pct = price > 0 ? ((price - cost) / price) * 100 : 0;
          value = pct.toFixed(1);
        } else if (id === 'date') {
          // ל-CSV נעדיף ISO כדי שיישמר ערך חד-משמעי
          value = new Date(r.original.date).toISOString().slice(0, 10);
        } else {
          value = r.getValue(id as any);
        }

        out[header] = value;
      });

      return out;
    });

    return rows;
  }, [table]);

  const handleExport = React.useCallback(() => {
    const rows = buildCsvRows();
    const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);

    downloadCSV(`datagrid-export-${ts}`, rows);
  }, [buildCsvRows]);

  const parentRef = React.useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 5,
  })


  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
  const hasRows = filtered.length > 0 && !error;

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
          onExport={handleExport}
          canExport={filtered.length > 0 && !error}
          onSimError={() => setError(true)}
          onRecover={() => setError(false)}
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
        <table className="table" style={hasRows ? { position: 'absolute', top: 0, left: 0, right: 0 } : undefined}>
          <tbody>
            {error ? (
              // מצב שגיאה – הודעת שגיאה אחת
              <tr>
                <td colSpan={columns.length} style={{ padding: 20, textAlign: 'center', color: 'red' }}>
                  Failed to load data… (simulated)
                </td>
              </tr>
            ) : !hasRows ? (
              // מצב ריק – הודעה אחת
              <tr>
                <td colSpan={columns.length} className="tableEmpty">
                  No results found…
                </td>
              </tr>
            ) : (
              // מצב רגיל – מציירים רק את השורות הוירטואליות
              virtualRows.map((vr) => {
                const row = table.getRowModel().rows[vr.index]
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
                )
              })
            )}
          </tbody>
        </table>

        {/* את הרפידה (spacer) מציירים רק כשבאמת יש שורות */}
        {hasRows && (
          <div style={{ height: totalSize, position: 'relative' }} />
        )}
      </div>
    </div>
  )
}
