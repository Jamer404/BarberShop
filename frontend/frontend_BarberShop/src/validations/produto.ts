import { z } from "zod"

export const ProdutoSchema = z.object({
    nome: z.string().nonempty(),
    unidade: z.string().nonempty(),
    precoVenda: z.coerce.number().nonnegative(),
    ativo: z.boolean(),
    modeloId: z.coerce.number().nonnegative(),
    modeloNome: z.string().nonempty(),
    marca: z.string().nonempty(),
    fornecedorId: z.number().nonnegative(),
    fornecedorNome: z.string().nonempty(),
    saldo: z.coerce.number().nonnegative(),
    custoMedio: z.coerce.number().nonnegative(),
    precoUltCompra: z.number().optional(),
    dataUltCompra: z.string().optional(),
    observacao: z.string().optional()
})