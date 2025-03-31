export interface ActiveQuery {
  name: string;
  query: string;
  results: any[];
}

export interface QueryHistoryItem {
  name: string;
  query: string;
}
