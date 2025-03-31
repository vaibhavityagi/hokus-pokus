import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Editor } from "./components/Editor";
import { Table } from "./components/Table";
import { History } from "./components/History";
import { Templates } from "./components/Templates";
import { dummyQueries } from "./lib/dummy-queries";
import "./App.css";

export default function App() {
  const [activeQuery, setActiveQuery] = useState<{
    name: string;
    query: string;
    results: any[];
  }>();
  const [queryHistory, setQueryHistory] = useState<
    {
      name: string;
      query: string;
    }[]
  >([]);
  const [templates] = useState([
    dummyQueries[1],
    dummyQueries[2],
    dummyQueries[3],
  ]);
  const [viewType, setViewType] = useState("table");
  const [activeTab, setActiveTab] = useState("history");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const storedHistory = localStorage.getItem("queryHistory");
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      setQueryHistory(parsedHistory);
    }
  }, []);

  const runQuery = (query: string) => {
    // Find matching query or use the first one
    const matchingQuery = dummyQueries.find(
      (q) => q.query.trim() === query.trim()
    ) || {
      ...dummyQueries[0],
      query: query,
    };

    setActiveQuery(matchingQuery);
    setQuery(query);

    // Add to history
    const isQueryInHistory = queryHistory.some(
      (q) => q.query.trim() === matchingQuery.query.trim()
    );

    if (!isQueryInHistory) {
      const queryMetadata = {
        id: `query_${Date.now()}`,
        name: matchingQuery.name,
        query: matchingQuery.query,
        timestamp: Date.now(),
      };
      const updatedHistory = [queryMetadata, ...queryHistory].slice(0, 10);
      setQueryHistory(updatedHistory);
      localStorage.setItem("queryHistory", JSON.stringify(updatedHistory));
    }
  };

  const exportResultsToJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeQuery?.results || []));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "JSONResults.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportResultsToCSV = () => {
    if (!activeQuery?.results || activeQuery.results.length === 0) {
      console.warn("No results to export");
      return;
    }

    const headers = Object.keys(activeQuery.results[0]);
    const csvHeader = headers.join(",");

    const csvRows = activeQuery.results.map((row) => {
      return headers
        .map((header) => {
          const value = row[header] == null ? "" : row[header];

          const escaped = String(value).replace(/"/g, '""').replace(/\n/g, " ");
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",");
    });

    const csvContent = [csvHeader, ...csvRows].join("\n");

    const dataStr =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `csvResults.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="header-title">Query searcher</h1>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <div className="tabs">
            <div className="tabs-list">
              <button
                className={`tabs-trigger ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
              <button
                className={`tabs-trigger ${
                  activeTab === "template" ? "active" : ""
                }`}
                onClick={() => setActiveTab("template")}
              >
                Templates
              </button>
            </div>
            <div className="tabs-content">
              {activeTab === "history" && (
                <History
                  queries={queryHistory}
                  handleClick={(query) => {
                    console.log("Query clicked:", query);
                    runQuery(query.query);
                  }}
                />
              )}
              {activeTab === "template" && (
                <Templates
                  queries={templates}
                  onSelect={(query) => {
                    setActiveQuery(query);
                    setQuery(query.query);
                  }}
                />
              )}
            </div>
          </div>
        </aside>

        <main className="content">
          <div className="editor-section">
            <Editor value={query} handleQuery={(value) => setQuery(value)} />
            <div
              className="editor-controls"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <button
                className="btn btn-primary"
                onClick={() => query && runQuery(query)}
              >
                Run Query
              </button>
              `
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => navigator.clipboard.writeText(query)}
                  className="copy-button"
                >
                  <Copy size={20} color="#2026d2" />
                </button>
                <select
                  className="select-control"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                  <option value="table">Table</option>
                  <option value="json">JSON</option>
                </select>

                <div className="export-dropdown">
                  <button
                    className="btn btn-primary export-button"
                    title="Export results"
                  >
                    Export
                  </button>
                  <div className="export-dropdown-content">
                    <button onClick={exportResultsToJson}>
                      Export as JSON
                    </button>
                    <button onClick={exportResultsToCSV}>Export as CSV</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {activeQuery && (
            <div className="results-section">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Query Results</h3>
                  <span className="card-subtitle">
                    {activeQuery.results.length} rows
                  </span>
                </div>
                <div className="card-body">
                  <Table results={activeQuery.results} viewType={viewType} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
