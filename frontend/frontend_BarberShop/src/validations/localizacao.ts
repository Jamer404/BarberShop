import { z } from "zod"

export const Paischema = z.object({
    nome: z.string().nonempty(),
    sigla: z.string().nonempty(),
    ddi: z.string().nonempty(),
})

export const CidadeSchema = z.object({
    nome: z.string().nonempty(),
    ddd: z.string().nonempty(),
    idEstado: z.number().nonnegative(),
})

export const EstadoSchema = z.object({
    nome: z.string().nonempty(),
    uf: z.string().nonempty(),
    idPais: z.coerce.number()
})