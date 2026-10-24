import { z } from "zod";

/**
 * La solicitud de diagnóstico.
 *
 * Seis campos y un consentimiento: lo justo para poder preparar la primera
 * conversación. Lo demás se pregunta en esa conversación, no en el formulario.
 *
 * El esquema es el mismo en el navegador y en el servidor, de modo que los
 * mensajes amables y la validación de verdad no pueden separarse.
 */

export const diagnosisGoals = [
  { value: "vender-mas", label: "Vender más" },
  { value: "mejorar-atencion", label: "Mejorar la atención al cliente" },
  { value: "ahorrar-tiempo", label: "Ahorrar tiempo de mi equipo" },
  { value: "reducir-costes", label: "Reducir costes" },
  { value: "descubrir", label: "Descubrir oportunidades que no veo" },
] as const;

export type DiagnosisGoal = (typeof diagnosisGoals)[number]["value"];

export const diagnosisSectors = [
  { value: "hoteles", label: "Hotel o alojamiento" },
  { value: "restauracion", label: "Restauración" },
  { value: "clinicas", label: "Clínica o centro de servicios" },
  { value: "transporte", label: "Transporte" },
  { value: "comercio", label: "Comercio" },
  { value: "servicios-profesionales", label: "Servicios profesionales" },
  { value: "industria", label: "Industria o taller" },
  { value: "construccion", label: "Construcción o reformas" },
  { value: "otro", label: "Otro" },
] as const;

export const diagnosisSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80, "Ese nombre es demasiado largo."),

  company: z
    .string()
    .trim()
    .min(2, "Dinos el nombre de tu empresa.")
    .max(120, "Ese nombre es demasiado largo."),

  sector: z.enum(
    diagnosisSectors.map((sector) => sector.value) as [string, ...string[]],
    { message: "Elige el sector que más se parezca al tuyo." },
  ),

  email: z
    .string()
    .trim()
    .min(1, "Necesitamos un email para contestarte.")
    .max(160, "Ese email es demasiado largo.")
    .email("Revisa el email, parece que falta algo."),

  phone: z.string().trim().max(30, "Ese teléfono es demasiado largo.").optional().or(z.literal("")),

  goal: z.enum(
    diagnosisGoals.map((goal) => goal.value) as [string, ...string[]],
    { message: "Elige por dónde quieres empezar." },
  ),

  context: z
    .string()
    .trim()
    .max(2000, "Con menos de 2.000 caracteres nos hacemos una idea.")
    .optional()
    .or(z.literal("")),

  consent: z.literal(true, {
    message: "Necesitamos tu consentimiento para poder contestarte.",
  }),

  /** Señuelo invisible para bots. Relleno = descartado sin explicar por qué. */
  website: z.literal("").optional(),
});

export type DiagnosisInput = z.infer<typeof diagnosisSchema>;

export type DiagnosisFieldErrors = Partial<Record<keyof DiagnosisInput, string>>;

export const goalLabel = (value: string): string =>
  diagnosisGoals.find((goal) => goal.value === value)?.label ?? value;

export const sectorLabel = (value: string): string =>
  diagnosisSectors.find((sector) => sector.value === value)?.label ?? value;
