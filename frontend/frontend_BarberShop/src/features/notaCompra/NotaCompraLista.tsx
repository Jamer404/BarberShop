import { useEffect, useState } from "react";
import NotaCompraForm from "./NotaCompraForm";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export interface NotaCompra {
  id: number;
  numero: string;
  fornecedor: string;
  dataEmissao: string;
  total: number;
}

export default function NotaCompraLista() {
  const [notas, setNotas] = useState<NotaCompra[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  function handleNovaNota(nota: NotaCompra) {
    setNotas(prev => [...prev, { ...nota, id: prev.length + 1 }]);
    setModalOpen(false);
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notas de Compra</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota de Compra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Notas de Compra</CardTitle>
          <CardDescription>Cadastre e gerencie suas notas de compra.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>CARREGANDO...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notas.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.numero}</TableCell>
                    <TableCell>{n.fornecedor}</TableCell>
                    <TableCell>{n.dataEmissao}</TableCell>
                    <TableCell>{n.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
  <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Nova Nota de Compra</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-2 pt-2 min-h-[400px]">

            <NotaCompraForm onSave={(nota) => handleNovaNota({ ...nota, id: notas.length + 1 })} />
          </div>
          <DialogFooter className="px-6 pb-6 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
