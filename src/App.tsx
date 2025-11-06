import React from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchSales } from './lib/api'
import { DataTable } from './components/DataTable'
import { Spinner } from './components/Spinner'


export default function App() {
  // שליטת סימולציית שגיאה מה-UI
  const [shouldFail, setShouldFail] = React.useState(false)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['sales', { count: 10_000 }],       // מפתח קאש
    queryFn: () => fetchSales({ count: 10_000, fail: shouldFail }),
    placeholderData: keepPreviousData,            // שומר את הישנים בזמן refetch
  })

  return (
    <div style={{ padding: 16 }}>
      <h1>Virtual DataGrid Demo</h1>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => { setShouldFail(false); refetch() }}>Refetch</button>
        <button onClick={() => { setShouldFail(true); refetch() }}>Refetch (Fail once)</button>
        {isFetching && <span style={{ opacity: 0.7 }}>Loading…</span>}
      </div>

      {/* מצב טעינה ראשוני */}
      {isLoading && <Spinner />}

      {/* מצב שגיאה */}
      {isError && (
        <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>
          {(error as Error).message}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { setShouldFail(false); refetch() }}>Retry</button>
          </div>
        </div>
      )}

      {/* מצב תקין — מעבירים ל-DataTable את הדאטה */}
      {data && !isLoading && !isError && (
        <DataTable data={data} />
      )}
    </div>
  )
}
