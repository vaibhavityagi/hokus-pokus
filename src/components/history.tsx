import { Clock } from "lucide-react";

interface QueryHistoryProps {
  queries: any[];
  handleClick: (query: any) => void;
}

export function QueryHistory({ queries, handleClick }: QueryHistoryProps) {
  if (!queries.length) {
    return <div className="query-history-no-data">No query history</div>;
  }

  return (
    <div className="scroll-area">
      <div className="query-history-list">
        {queries.map((query, index) => (
          <div
            key={index}
            className="query-history-item"
            onClick={() => handleClick(query)}
          >
            <div className="query-history-item-header">
              <Clock className="icon-clock" />
              <span className="query-history-title">
                {query.name || "Unnamed Query"}
              </span>
            </div>
            <p className="query-history-description">
              {query.query.substring(0, 60)}
              {query.query.length > 60 ? "..." : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
