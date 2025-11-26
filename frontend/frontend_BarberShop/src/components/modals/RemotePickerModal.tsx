import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type RemoteItem = Record<string, any> & { id: number | string }

type Column = { key: string; header: string; width?: string | number; render?: (row: RemoteItem)=>React.ReactNode }

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  columns: Column[]
  fetchPage: (query: string) => Promise<RemoteItem[]>  
  onSelect: (item: RemoteItem) => void
}

export function RemotePickerModal({ isOpen, onOpenChange, title, columns, fetchPage, onSelect }: Props) {
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<RemoteItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setError(null)

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true)
        const data = await fetchPage(q.trim())
        setItems(data)
      } catch (e) {
        setError("Erro ao carregar dados.")
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [isOpen, q, fetchPage])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-4xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        <div className="flex gap-2">
          <Input placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button variant="outline" onClick={()=>setQ("")}>Limpar</Button>
        </div>

        <div className="mt-3 border rounded overflow-auto max-h-[460px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {columns.map(c=>(
                  <th key={c.key} className="text-left p-2" style={{width:c.width}}>{c.header}</th>
                ))}
                <th className="p-2 w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="p-3 text-center text-muted-foreground" colSpan={columns.length+1}>Carregando…</td></tr>
              )}
              {error && !loading && (
                <tr><td className="p-3 text-center text-destructive" colSpan={columns.length+1}>{error}</td></tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr><td className="p-3 text-center text-muted-foreground" colSpan={columns.length+1}>Sem resultados</td></tr>
              )}
              {!loading && !error && items.map((row)=>(
                <tr key={row.id} className="border-t">
                  {columns.map(c=>(
                    <td key={c.key} className="p-2">
                      {c.render ? c.render(row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <Button size="sm" onClick={()=>onSelect(row)}>Selecionar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
