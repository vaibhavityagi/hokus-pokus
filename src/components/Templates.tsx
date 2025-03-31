import { BookmarkIcon } from "lucide-react";

interface TemplatesProps {
  queries: any[];
  onSelect: (query: any) => void;
}

export function Templates({ queries, onSelect }: TemplatesProps) {
  if (!queries.length) {
    return <div className="saved-queries-no-data">No saved queries</div>;
  }

  return (
    <div className="scroll-area">
      <div className="saved-queries-list">
        {queries.map((query, index) => (
          <div
            key={index}
            className="saved-query-item"
            onClick={() => onSelect(query)}
          >
            <div className="saved-query-item-header">
              <BookmarkIcon className="icon-bookmark" />
              <span className="saved-query-title">{query.name}</span>
            </div>
            <p className="saved-query-description">
              {query.query.substring(0, 60)}
              {query.query.length > 60 ? "..." : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
