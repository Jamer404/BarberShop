import { z } from "zod"

export const buildClienteSchema = (isBrasil: boolean) => {
  const schema = z.object({
    nomeRazaoSocial: z.string().min(3, { message: "O nome/razão social deve ter no mínimo 3 caracteres." }),
    apelidoNomeFantasia: z.string().optional(),
    cpfCnpj: z.string().nonempty({ message: "O CPF/CNPJ é obrigatório." }),
    rgInscricaoEstadual: z.string().optional(),
    tipoPessoa: z.string().optional(),
    classificacao: z.string().optional(),
    pf: z.boolean(),
    sexo: z.enum(["M", "F"]),
    dataNascimentoCriacao: z.string().nullable(), // <-- Corrigido
    email: z.string().email({ message: "Formato de e-mail inválido." }).optional().or(z.literal('')),
    telefone: z.string().optional(),
    rua: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cep: z.string().optional(),
    idCidade: z.number().min(1, { message: "A cidade é obrigatória." }),
    idCondicaoPagamento: z.number().min(1, { message: "A condição de pagamento é obrigatória." }),
    limiteCredito: z.coerce.number().min(0, { message: "O limite de crédito não pode ser negativo." }),
    ativo: z.boolean(),
  });

  return schema.superRefine((data, ctx) => {
    if (isBrasil) {
      const doc = data.cpfCnpj.replace(/\D/g, '');
      if (data.pf) {
        if (doc.length !== 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O CPF deve conter 11 dígitos.",
            path: ["cpfCnpj"],
          });
        }
      } else {
        if (doc.length !== 14) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O CNPJ deve conter 14 dígitos.",
            path: ["cpfCnpj"],
          });
        }
      }
    }
  });
}

export type ClienteSchema = z.infer<ReturnType<typeof buildClienteSchema>>;