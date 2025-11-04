import React from 'react'
import { DataTable } from './components/DataTable'
import { generateSales } from './lib/seed'

export default function App() {
  const [data] = React.useState(() => generateSales(10_000, 1337))
  return (
    <div className="app">
      <h1>Virtual DataGrid Demo</h1>
      <DataTable data={data} />
    </div>
  )
}
