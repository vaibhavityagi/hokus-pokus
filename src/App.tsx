import { useEffect, useState } from "react";
import { Download, Terminal, Copy } from "lucide-react";
import { QueryEditor } from "./components/editor";
import { ResultsTable } from "./components/table";
import { QueryHistory } from "./components/history";
import { Templates } from "./components/templates";
import { dummyQueries } from "./lib/dummy-queries";
import "./App.css";

export default function App() {
  // const [darkMode, setDarkMode] = useState(false);
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
  const [templates, setTemplates] = useState([
    dummyQueries[1],
    dummyQueries[2],
    dummyQueries[3],
  ]);
  const [viewType, setViewType] = useState("table");
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("history");
  const [query, setQuery] = useState("");

  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode);
  //   document.documentElement.classList.toggle("dark");
  // };

  useEffect(() => {
    // Load query history from local storage
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

  // const saveQuery = () => {
  //   if (
  //     activeQuery &&
  //     !templates.some((q) => q.query.trim() === activeQuery.query.trim())
  //   ) {
  //     setTemplates([activeQuery, ...templates]);
  //   }
  // };

  // !! TODO: Implement this function
  const exportResults = () => {
    // Simulate export functionality
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeQuery?.results || []));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "query_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    // <div className={`app-container ${darkMode ? "dark" : ""}`}>
    <div>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <Terminal className="icon" />
            <h1 className="header-title">Query searcher</h1>
          </div>
          <div className="header-controls">
            {/* <button
              className="btn btn-outline icon-btn tooltip"
              onClick={toggleDarkMode}
              title="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="icon-small" />
              ) : (
                <Moon className="icon-small" />
              )}
            </button> */}
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
                <QueryHistory
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
            <QueryEditor
              value={query}
              handleQuery={(value) => setQuery(value)}
            />
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
              {/* <button
                className="btn btn-outline icon-btn tooltip"
                onClick={saveQuery}
                title="Save query"
              >
                <Save className="icon-small" />
              </button> */}
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  className="select-control"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                  <option value="table">Table</option>
                  <option value="json">JSON</option>
                  <option value="chart">Chart</option>
                </select>
                <button
                  onClick={() => navigator.clipboard.writeText(query)}
                  className="copy-button"
                >
                  <Copy size={20} color="#2026d2" />
                </button>
                <button onClick={exportResults} title="Export results">
                  <Download size={20} color="#2026d2" />
                </button>
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
                  <ResultsTable
                    results={activeQuery.results}
                    viewType={viewType}
                    // currentPage={currentPage}
                    // pageSize={pageSize}
                    // setCurrentPage={setCurrentPage}
                    // setPageSize={setPageSize}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
