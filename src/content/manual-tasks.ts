/**
 * The recognition list.
 *
 * The problem section works by recognition, not by argument. The reader should
 * find three or four items here that describe their own week. Phrasing is
 * deliberately concrete and mundane: no "ineficiencias operativas", just the
 * task as the person doing it would name it.
 */

export interface ManualTask {
  id: string;
  label: string;
  /** Where the task actually happens today. Two or three words. */
  where: string;
}

export const manualTasks: ManualTask[] = [
  { id: "leer-correos", label: "Leer correos para decidir a quién le tocan", where: "Buzón compartido" },
  { id: "copiar-datos", label: "Copiar datos de un programa a otro", where: "ERP y Excel" },
  { id: "presupuestos", label: "Preparar presupuestos uno por uno", where: "Excel y Word" },
  { id: "facturas", label: "Comprobar facturas contra el pedido", where: "Correo y ERP" },
  { id: "documentos", label: "Montar documentos partiendo del último parecido", where: "Carpetas compartidas" },
  { id: "excel", label: "Actualizar la hoja de cálculo de la que depende todo", where: "Unidad compartida" },
  { id: "conciliar", label: "Cuadrar cifras que deberían coincidir y no coinciden", where: "Contabilidad y banco" },
  { id: "introducir", label: "Introducir a mano lo que ya está escrito en un PDF", where: "Programa de gestión" },
  { id: "responder", label: "Responder por vigésima vez la misma pregunta", where: "Correo y teléfono" },
  { id: "informes", label: "Recopilar datos de cuatro sitios para un informe", where: "Todos a la vez" },
  { id: "seguimiento", label: "Acordarse de hacer el seguimiento a tiempo", where: "Memoria y notas" },
  { id: "avisar", label: "Avisar a alguien de que ya puede empezar lo suyo", where: "Mensajería" },
];

export const problemStatement = {
  eyebrow: "El problema",
  /** Two lines: the first states it, the second lands it. */
  heading: ["Nadie las eligió.", "Alguien las hace cada semana."],
  body: "No son tareas difíciles. Son tareas que consisten en mover información de un sitio a otro, comprobar que coincide y avisar a alguien. Cada una cuesta pocos minutos, y ese es exactamente el motivo por el que nadie las cuenta.",
  kicker: "¿Te suena alguna? Calcula lo que te cuesta",
};
