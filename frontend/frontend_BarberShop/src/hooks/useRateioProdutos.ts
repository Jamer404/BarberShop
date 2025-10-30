import { useMemo } from "react";
import type { Produto } from "@/services/produtoService";

function parseCurrency(value: string | number | undefined): number {
  if (typeof value === "string") return parseFloat(value.replace(",", "."));
  return Number(value) || 0;
}

export function useRateioProdutos(
  produtos: Produto[],
  valorFrete: number | string,
  valorSeguro: number | string,
  outrasDespesas: number | string
): Produto[] {
  return useMemo(() => {
    const totalDespesas = parseCurrency(valorFrete) + parseCurrency(valorSeguro) + parseCurrency(outrasDespesas);
    const valorTotalProdutos = produtos.reduce((acc: number, p: Produto) => acc + (p.precoTotal || 0), 0);
  
    if (totalDespesas === 0 || valorTotalProdutos === 0) {
      return produtos.map((p: Produto) => ({
        ...p,
        rateio: 0,
        custoFinal: p.precoTotal,
      }));
    }

    return produtos.map((p: Produto) => {
      const proporcao = (p.precoTotal || 0) / valorTotalProdutos;
      const rateio = totalDespesas * proporcao;
      const custoFinal = (p.precoTotal || 0) + rateio;
      const quantidade = parseFloat(String(p.quantidade)) || 1;
      const custoFinalUN = custoFinal / quantidade;
      return { ...p, rateio, custoFinal, custoFinalUN };
    });
  }, [produtos, valorFrete, valorSeguro, outrasDespesas]);
}
