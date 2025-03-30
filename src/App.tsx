import { useState } from "react";
import { Download, Moon, Save, Sun, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryEditor } from "./components/editor";
import { ResultsTable } from "./components/table";
import { QueryHistory } from "./components/history";
import { SavedQueries } from "./components/saved-queries";
import { dummyQueries } from "./lib/dummy-queries";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeQuery, setActiveQuery] = useState(dummyQueries[0]);
  const [queryHistory, setQueryHistory] = useState([dummyQueries[0]]);
  const [savedQueries, setSavedQueries] = useState([
    dummyQueries[1],
    dummyQueries[2],
  ]);
  const [executionTime, setExecutionTime] = useState("0.24");
  const [viewType, setViewType] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const runQuery = (query: string) => {
    // Simulate query execution time
    const randomTime = (Math.random() * 0.5 + 0.1).toFixed(2);
    setExecutionTime(randomTime);

    // Find matching query or use the first one
    const matchingQuery = dummyQueries.find(
      (q) => q.query.trim() === query.trim()
    ) || {
      ...dummyQueries[0],
      query: query,
    };

    setActiveQuery(matchingQuery);

    // Add to history if not already there
    if (!queryHistory.some((q) => q.query.trim() === query.trim())) {
      setQueryHistory([matchingQuery, ...queryHistory].slice(0, 10));
    }
  };

  const saveQuery = () => {
    if (
      !savedQueries.some((q) => q.query.trim() === activeQuery.query.trim())
    ) {
      setSavedQueries([activeQuery, ...savedQueries]);
    }
  };

  const exportResults = () => {
    // Simulate export functionality
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeQuery.results));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "query_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      <header className="border-b bg-background">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            <h1 className="text-xl font-bold">Query searcher</h1>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleDarkMode}
                  >
                    {darkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle dark mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r bg-muted/40 p-4 hidden md:block">
          <Tabs defaultValue="history">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-2">
              <QueryHistory
                queries={queryHistory}
                onSelect={(query) => setActiveQuery(query)}
              />
            </TabsContent>
            <TabsContent value="saved" className="mt-2">
              <SavedQueries
                queries={savedQueries}
                onSelect={(query) => setActiveQuery(query)}
              />
            </TabsContent>
          </Tabs>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <QueryEditor
              value={activeQuery.query}
              onChange={(value) =>
                setActiveQuery({ ...activeQuery, query: value })
              }
              onRun={runQuery}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => runQuery(activeQuery.query)}
                  className="bg-primary"
                >
                  Run Query
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={saveQuery}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save query</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-sm text-muted-foreground">
                  Execution time: {executionTime}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={exportResults}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export results</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <Card className="h-full overflow-hidden">
              <div className="p-4 border-b bg-muted/40 flex justify-between items-center">
                <h3 className="font-medium">Query Results</h3>
                <span className="text-sm text-muted-foreground">
                  {activeQuery.results.length} rows
                </span>
              </div>
              <div className="p-0 overflow-auto h-[calc(100%-3rem)]">
                <ResultsTable
                  results={activeQuery.results}
                  viewType={viewType}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  setCurrentPage={setCurrentPage}
                  setPageSize={setPageSize}
                />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
