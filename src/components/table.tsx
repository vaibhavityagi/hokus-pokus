import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ResultsTableProps {
  results: any[]
  viewType: string
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
}

export function ResultsTable({
  results,
  viewType,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
}: ResultsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  if (!results || results.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No results to display</div>
  }

  const columns = Object.keys(results[0])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    if (!sortColumn) return 0

    const valueA = a[sortColumn]
    const valueB = b[sortColumn]

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA
    }

    const strA = String(valueA).toLowerCase()
    const strB = String(valueB).toLowerCase()

    if (sortDirection === "asc") {
      return strA.localeCompare(strB)
    } else {
      return strB.localeCompare(strA)
    }
  })

  // Calculate pagination
  const totalItems = sortedResults.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedResults = sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  if (viewType === "json") {
    return (
      <div className="p-4 overflow-auto">
        <pre className="text-sm font-mono">{JSON.stringify(results, null, 2)}</pre>
      </div>
    )
  }

  if (viewType === "chart") {
    // Find numeric columns for chart
    const numericColumns = columns.filter((col) => typeof results[0][col] === "number")

    if (numericColumns.length === 0) {
      return <div className="p-8 text-center text-muted-foreground">No numeric data to chart</div>
    }

    const chartData = results.slice(0, 10).map((row) => ({
      name: row[columns[0]],
      value: row[numericColumns[0]],
    }))

    const colors = [
      "#8884d8",
      "#83a6ed",
      "#8dd1e1",
      "#82ca9d",
      "#a4de6c",
      "#d0ed57",
      "#ffc658",
      "#ff8042",
      "#ff6361",
      "#bc5090",
    ]

    return (
      <div className="h-full w-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(column)}>
                <div className="flex items-center">
                  {column}
                  {sortColumn === column && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedResults.map((row, rowIndex) => (
            <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/20" : ""}>
              {columns.map((column) => (
                <TableCell key={column}>{row[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center space-x-1">
            <button
              className="h-8 w-8 rounded-md border border-input flex items-center justify-center disabled:opacity-50"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">First page</span>
              <span>«</span>
            </button>
            <button
              className="h-8 w-8 rounded-md border border-input flex items-center justify-center disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Previous page</span>
              <span>‹</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum = currentPage
              if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              // Ensure page numbers are within valid range
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    className={`h-8 w-8 rounded-md flex items-center justify-center ${
                      currentPage === pageNum ? "bg-primary text-primary-foreground" : "border border-input"
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              }
              return null
            })}
            <button
              className="h-8 w-8 rounded-md border border-input flex items-center justify-center disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Next page</span>
              <span>›</span>
            </button>
            <button
              className="h-8 w-8 rounded-md border border-input flex items-center justify-center disabled:opacity-50"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Last page</span>
              <span>»</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

