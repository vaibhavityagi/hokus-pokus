import { useState, useRef, useEffect, useMemo } from "react";
import { FixedSizeList as List } from "react-window";

interface TableProps {
  results: any[];
  viewType: string;
}

export function Table({ results, viewType }: TableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // For view
  if (viewType === "json") {
    return (
      <div className="json-view">
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    );
  }

  // table view with virtualization
  const ROW_HEIGHT = 40;

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
            height={containerHeight - ROW_HEIGHT}
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
