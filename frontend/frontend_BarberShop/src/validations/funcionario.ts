import { z } from "zod"

export const FuncionarioSchema = z.object({
    nomeRazaoSocial: z.string().nonempty(),
    cargo: z.string().nonempty(),
    telefone: z.string().optional(),
    email: z.string().optional(),
    salario: z.coerce.number().nonnegative(),
    dataAdmissao: z.string().nonempty(),
    turno: z.string().optional(),
    idCidade: z.coerce.number().nonnegative(),
})