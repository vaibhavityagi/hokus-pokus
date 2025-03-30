import { useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

interface QueryEditorProps {
  value: string
  onChange: (value: string) => void
  onRun: (query: string) => void
}

export function QueryEditor({ value, onChange, onRun }: QueryEditorProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run query
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        onRun(value)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [value, onRun])

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] font-mono text-sm resize-y p-4"
        placeholder="Enter SQL query..."
      />
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">Press Ctrl+Enter to run</div>
    </div>
  )
}

