import { ActiveQuery } from "./types";

export const validateQuery = (query: string) => {
  if (!query.trim()) {
    throw new Error("Query cannot be empty");
  }

  const validStartKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "SHOW",
  ];
  const startsWithValidKeyword = validStartKeywords.some((keyword) =>
    query.trim().toUpperCase().startsWith(keyword)
  );

  if (!startsWithValidKeyword) {
    throw new Error(
      "Query must start with a valid SQL keyword (SELECT, INSERT, etc.)"
    );
  }

  return true;
};
const createDownloadLink = (
  data: string,
  fileName: string,
  mimeType: string
) => {
  const dataStr = `data:${mimeType};charset=utf-8,` + encodeURIComponent(data);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportResultsToJson = (activeQuery: ActiveQuery) => {
  try {
    const jsonData = JSON.stringify(activeQuery.results || []);
    createDownloadLink(jsonData, "JSONResults.json", "application/json");
    return true;
  } catch (error) {
    return false;
  }
};

export const exportResultsToCSV = (activeQuery: ActiveQuery) => {
  try {
    if (!activeQuery.results || activeQuery.results.length === 0) {
      throw new Error("No results to export");
    }

    const headers = Object.keys(activeQuery.results[0]);
    const csvHeader = headers.join(",");

    const csvRows = activeQuery.results.map((row) =>
      headers
        .map((header) => {
          const value = row[header] == null ? "" : row[header];
          const escaped = String(value).replace(/"/g, '""').replace(/\n/g, " ");
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",")
    );

    const csvContent = [csvHeader, ...csvRows].join("\n");
    createDownloadLink(csvContent, "csvResults.csv", "text/csv");
    return true;
  } catch (error) {
    return false;
  }
};
