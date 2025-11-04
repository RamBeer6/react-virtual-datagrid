import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table' 
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SaleRow } from '../types'

interface Props { data: SaleRow[] }

const columns: ColumnDef<SaleRow, any>[] = [
  { accessorKey: 'id', header: 'ID', size: 70 },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'category', header: 'Category', size: 120 },
  { accessorKey: 'quantity', header: 'Qty', size: 70 },
  { accessorKey: 'price', header: 'Price', cell: ({ getValue }) => getValue<number>().toFixed(2), size: 100 },
  { accessorKey: 'cost', header: 'Cost', cell: ({ getValue }) => getValue<number>().toFixed(2), size: 100 },
  { id: 'marginPct', header: 'Margin %', cell: ({ row }) => {
      const price = row.original.price
      const cost = row.original.cost
      const pct = price > 0 ? ((price - cost) / price) * 100 : 0
      return pct.toFixed(1)
    }, size: 100 },
  { accessorKey: 'status', header: 'Status', size: 120 },
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(), size: 140 },
]

export function DataTable({ data }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
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
      <div className="caption">Step 1: Virtualized 10k rows • basic sorting (click headers)</div>

      <div className="tableHeader">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort()
                  const sortDir = h.column.getIsSorted()
                  const sortIcon = sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '⇵' // פירקנו את ה-ternary
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

      <div ref={parentRef} className="tableContainer">
        <div style={{ height: totalSize, position: 'relative' }}>
          <table className="table" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <tbody>
              {virtualRows.map((vr) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
