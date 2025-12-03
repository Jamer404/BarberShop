import { z } from "zod";

export const EstadoSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 letras" })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, {
      message: "O nome deve conter apenas letras e espaços",
    }),
  uf: z
    .string()
    .length(2, { message: "UF deve ter exatamente 2 letras" })
    .regex(/^[A-Za-z]{2}$/, {
      message: "UF deve conter apenas letras (sem números)",
    }),
});
