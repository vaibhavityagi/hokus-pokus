import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Editor } from "./components/Editor";
import { Table } from "./components/Table";
import { History } from "./components/History";
import { Templates } from "./components/Templates";
import { dummyQueries } from "./lib/dummy-queries";
import { ToastContainer, toast } from "react-toastify";
import {
  validateQuery,
  exportResultsToCSV,
  exportResultsToJson,
} from "./lib/utils";
import "./App.css";
import { ActiveQuery, QueryHistoryItem } from "./lib/types";

export default function App() {
  const [activeQuery, setActiveQuery] = useState<ActiveQuery>();
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
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
    try {
      validateQuery(query);

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

      toast.success("Query executed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Query execution failed"
      );
      console.error("Query execution failed:", error);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    if (!activeQuery?.results || activeQuery.results.length === 0) {
      toast.error("No results to export");
      return;
    }
    try {
      const res =
        format === "json"
          ? exportResultsToJson(activeQuery)
          : exportResultsToCSV(activeQuery);

      if (res) {
        toast.success("File exported successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export");
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

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
                    disabled={!activeQuery?.results?.length}
                  >
                    Export
                  </button>
                  <div className="export-dropdown-content">
                    <button onClick={() => handleExport("json")}>
                      Export as JSON
                    </button>
                    <button onClick={() => handleExport("csv")}>
                      Export as CSV
                    </button>
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
