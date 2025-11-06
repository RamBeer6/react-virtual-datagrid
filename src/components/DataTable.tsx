import React from 'react'
import { downloadCSV } from '../lib/csv'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SaleRow } from '../types'
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

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [error, setError] = React.useState(false);
  const [search, setSearch] = React.useState('')
  const debounced = useDebounce(search, 300)

  const filtered = React.useMemo(() => {
    if (!debounced) return data;
    const s = debounced.toLowerCase();
    return data.filter((row) =>
      row.customerLC.includes(s) || row.categoryLC.includes(s)
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


  const buildCsvRows = React.useCallback(() => {
    const cols = table.getVisibleLeafColumns();
    const rows = table.getRowModel().rows.map(r => {
      const out: Record<string, unknown> = {};

      cols.forEach(col => {
        const id = col.id;
        const header = typeof col.columnDef.header === 'string'
          ? col.columnDef.header
          : id;

        let value: unknown;

        if (id === 'marginPct') {
          const price = r.original.price;
          const cost = r.original.cost;
          const pct = price > 0 ? ((price - cost) / price) * 100 : 0;
          value = pct.toFixed(1);
        } else if (id === 'date') {
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


      {/* Toolbar UI */}
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
              <tr>
                <td colSpan={columns.length} style={{ padding: 20, textAlign: 'center', color: 'red' }}>
                  Failed to load data… (simulated)
                </td>
              </tr>
            ) : !hasRows ? (
              <tr>
                <td colSpan={columns.length} className="tableEmpty">
                  No results found…
                </td>
              </tr>
            ) : (
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
