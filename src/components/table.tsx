import { useState, useRef, useEffect, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ResultsTableProps {
  results: any[];
  viewType: string;
  // currentPage: number;
  // pageSize: number;
  // setCurrentPage: (page: number) => void;
  // setPageSize: (size: number) => void;
}

export function ResultsTable({
  results,
  viewType,
  // currentPage,
  // pageSize,
  // setCurrentPage,
  // setPageSize,
}: ResultsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container height for virtualization
  useEffect(() => {
    if (containerRef.current) {
      const updateHeight = () => {
        if (containerRef.current) {
          setContainerHeight(containerRef.current.clientHeight);
        }
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);

  if (!results || results.length === 0) {
    return <div className="no-results">No results to display</div>;
  }

  const columns = Object.keys(results[0]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!sortColumn) return results;

    return [...results].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      return sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [results, sortColumn, sortDirection]);

  // For JSON view
  if (viewType === "json") {
    return (
      <div className="json-view">
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    );
  }

  // For chart view
  if (viewType === "chart") {
    // Find numeric columns for chart
    const numericColumns = columns.filter(
      (col) => typeof results[0][col] === "number"
    );

    if (numericColumns.length === 0) {
      return <div className="no-results">No numeric data to chart</div>;
    }

    const chartData = results.slice(0, 10).map((row) => ({
      name: row[columns[0]],
      value: row[numericColumns[0]],
    }));

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
    ];

    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // For table view with virtualization
  const ROW_HEIGHT = 40; // Adjust based on your row height

  // Row renderer for virtualized list
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const row = sortedResults[index];
    return (
      <div
        className={`virtual-row ${index % 2 === 0 ? "zebra-row" : ""}`}
        style={style}
      >
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className="virtual-cell"
            style={{ width: `${100 / columns.length}%` }}
          >
            {row[column]}
          </div>
        ))}
      </div>
    );
  };

  // Header renderer
  const TableHeader = () => (
    <div className="virtual-header">
      {columns.map((column, index) => (
        <div
          key={index}
          className="virtual-header-cell"
          style={{ width: `${100 / columns.length}%` }}
          onClick={() => handleSort(column)}
        >
          <div className="header-content">
            {column}
            {sortColumn === column && (
              <span className="sort-arrow">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="results-table">
      <div className="virtualized-table-container" ref={containerRef}>
        <TableHeader />
        <div className="virtual-table-body">
          <List
            height={containerHeight - ROW_HEIGHT} // Subtract header height
            itemCount={sortedResults.length}
            itemSize={ROW_HEIGHT}
            width="100%"
          >
            {Row}
          </List>
        </div>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          <span className="pagination-text">
            Total rows: {sortedResults.length}
          </span>
        </div>
      </div>
    </div>
  );
}
