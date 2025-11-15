import { z } from "zod";

export const PaisSchema = z.object({
	nome: z
		.string()
		.min(2, { message: "O nome deve ter pelo menos 2 letras" })
		.regex(/^[A-Za-zÀ-ÿ\s]+$/, {
			message: "O nome deve conter apenas letras e espaços",
		}),
	sigla: z
		.string()
		.length(2, { message: "A sigla deve ter exatamente 2 letras" })
		.regex(/^[A-Za-z]{2}$/, {
			message: "A sigla deve conter apenas letras (sem números)",
		}),
	ddi: z
		.string()
		.regex(/^\+\d{1,3}$/, {
			message: "O DDI deve começar com '+' seguido de até 3 números",
		}),
});
