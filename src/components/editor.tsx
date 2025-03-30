

interface QueryEditorProps {
  value: string;
  handleQuery: (value: string) => void;
}

export function QueryEditor({ value, handleQuery }: QueryEditorProps) {
  return (
    <div className="query-editor-container">
      <textarea
        value={value}
        onChange={(e) => handleQuery(e.target.value)}
        className="query-textarea"
        placeholder="Write your query here"
      />
    </div>
  );
}
