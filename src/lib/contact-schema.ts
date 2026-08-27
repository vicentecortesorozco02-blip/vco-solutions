import { z } from "zod";

/**
 * Contact payload, shared by the form and the API route.
 *
 * Validation runs in both places on purpose: the client copy exists to give
 * fast, kind error messages, the server copy exists because the client can be
 * bypassed. They cannot drift because they are the same schema.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre.")
    .max(80, "Ese nombre es demasiado largo."),

  company: z
    .string()
    .trim()
    .min(2, "Dinos el nombre de tu empresa.")
    .max(120, "Ese nombre es demasiado largo."),

  email: z
    .string()
    .trim()
    .min(1, "Necesitamos un email para contestarte.")
    .max(160, "Ese email es demasiado largo.")
    .email("Revisa el email, parece que falta algo."),

  phone: z
    .string()
    .trim()
    .max(30, "Ese teléfono es demasiado largo.")
    .optional()
    .or(z.literal("")),

  process: z
    .string()
    .trim()
    .min(15, "Cuéntanos un poco más: con dos líneas nos vale.")
    .max(2000, "Con menos de 2.000 caracteres nos hacemos una idea."),

  consent: z.literal(true, {
    message: "Necesitamos tu consentimiento para poder contestarte.",
  }),

  /**
   * Honeypot. Hidden from people, irresistible to naive bots. A filled value
   * is rejected as spam without telling the sender why.
   */
  website: z.literal("").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<
  Record<keyof ContactInput, string>
>;
