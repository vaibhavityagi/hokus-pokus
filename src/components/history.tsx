"use client"

import { Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QueryHistoryProps {
  queries: any[]
  onSelect: (query: any) => void
}

export function QueryHistory({ queries, onSelect }: QueryHistoryProps) {
  if (!queries.length) {
    return <div className="text-center p-4 text-muted-foreground">No query history</div>
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2">
        {queries.map((query, index) => (
          <div key={index} className="p-2 rounded-md hover:bg-muted cursor-pointer" onClick={() => onSelect(query)}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-3 w-3" />
              <span className="truncate">{query.name || "Unnamed Query"}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {query.query.substring(0, 60)}
              {query.query.length > 60 ? "..." : ""}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

