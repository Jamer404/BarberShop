import { z } from "zod"

export const buildClienteSchema = (isBrasil: boolean) =>
  z
    .object({
      nome: z.string().min(1, "Nome é obrigatório"),
      pf: z.boolean(),
      sexo: z.enum(["M", "F"], { required_error: "Sexo é obrigatório" }),
      dataNascimento: z
        .string()
        .refine((d) => d === "" || !Number.isNaN(Date.parse(d)), {
          message: "Data inválida",
        }),
      cpfCnpj: z
        .string()
        .transform((s) => s.replace(/\D/g, ""))
        .refine(
          (v) => v === "" || /^[0-9]{11}$/.test(v) || /^[0-9]{14}$/.test(v),
          "CPF/CNPJ inválido"
        ),
      email: z.string().email("E-mail inválido").or(z.literal("")),
      telefone: z
        .string()
        .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, "Telefone inválido")
        .or(z.literal("")),
      rua: z.string().or(z.literal("")),
      numero: z.string().or(z.literal("")),
      complemento: z.string().or(z.literal("")),
      bairro: z.string().or(z.literal("")),
      cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido").or(z.literal("")),
      idCidade: z.number().min(1, "Cidade obrigatória"),
      idCondicaoPagamento: z.number().min(1, "Condição obrigatória"),
      limiteCredito: z.number().min(0, "Limite não pode ser negativo"),
      ativo: z.boolean(),
    })
    .refine((d) => !(isBrasil && d.cpfCnpj === ""), {
      path: ["cpfCnpj"],
      message: "CPF/CNPJ obrigatório para clientes brasileiros",
    })
