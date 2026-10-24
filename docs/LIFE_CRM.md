# Life CRM (`/panel`)

El centro de control personal. Vive dentro de la misma app que la web pública,
pero no comparte nada visible con ella: ni cabecera, ni navegación, ni sitemap.

Cada pantalla responde una pregunta:

| Ruta                     | Pregunta                                  |
| ------------------------ | ----------------------------------------- |
| `/panel`                 | ¿Qué tengo que saber ahora?               |
| `/panel/calendario`      | ¿Qué tengo próximamente? (día, semana, mes) |
| `/panel/tareas`          | ¿Qué tengo que hacer? (hoy, próximas, atrasadas, todas y un tablero que se arrastra) |
| `/panel/proyectos`       | ¿En qué estoy trabajando?                 |
| `/panel/proyectos/[id]`  | Tareas y costes de un proyecto            |
| `/panel/universidad`     | ¿Qué tengo que entregar?                  |
| `/panel/dinero`          | ¿Qué pago, cuánto, desde qué cuenta y cuándo? |
| `/panel/suscripciones`   | ¿Qué me van a cobrar? (por meses o en lista) |
| `/panel/suscripciones/[id]` | La ficha de un servicio, con su historial |
| `/panel/dominios`        | ¿Qué renueva pronto? (30, 15 y 7 días)    |
| `/panel/contactos`       | ¿Qué tengo pendiente con quién?           |
| `/panel/documentos`      | ¿Dónde guardé eso?                        |
| `/panel/ia`              | Pregúntale al panel                       |
| `/panel/fechas`          | Hoy, esta semana, este mes, 90 días       |
| `/panel/inbox`           | Capturar ahora, decidir después           |
| `/panel/ajustes`         | Nombre y apariencia                       |
| `/panel/acceso`          | Entrar (y crear la cuenta la primera vez) |

La barra lateral tiene diez entradas y no más. IA, Inbox y Fechas cuelgan
debajo, separadas; en móvil van en «Más».

---

## Arquitectura

```
supabase/migrations/   tablas, relaciones, RLS
src/proxy.ts           refresca la sesión y echa a quien no tiene acceso
src/lib/supabase/      clientes (solo servidor) y la lista de correos permitidos
src/lib/life/          dominio puro: modelo, fechas, recurrencias, agenda,
                       recordatorios, dinero, registro de entidades
src/app/panel/         rutas y server actions
src/components/panel/  la interfaz
```

- **Todo se lee en el servidor.** `loadLifeData()` trae las diez tablas del
  usuario en paralelo, una vez por petición (`React.cache`). Una vida cabe en
  unos miles de filas; leerla entera mantiene coherentes el inicio, el
  calendario y las fechas, que comparten la misma agenda.
- **Todo se escribe con server actions** (`app/panel/actions.ts`). Cada una
  empieza con `requirePanelSession()`: son endpoints POST públicos y no pueden
  fiarse de que el layout ya comprobó la sesión.
- **Un único formulario.** `lib/life/entities.ts` describe cada tipo de
  registro (campos, etiquetas, opciones). De ahí salen la validación (zod),
  el diálogo de edición y la búsqueda. Añadir un campo es una línea ahí y una
  columna en una migración.
- **Los diálogos los abre la URL**: `?nuevo=task&v_due_date=2026-10-12`,
  `?editar=task:<uuid>`. Un resultado de búsqueda, una celda del calendario y
  una fila de una lista abren el mismo editor con un enlace normal, y el botón
  atrás lo cierra.
- **Agenda única.** `buildAgenda()` junta eventos (con sus repeticiones),
  tareas, entregas, cobros de suscripciones, pagos previstos, renovaciones de
  dominios, vencimientos del vault, cumpleaños y seguimientos de contactos. Nada
  se duplica como evento.
- **Recordatorios derivados.** `deriveReminders()` y `topPriorities()` calculan
  en cada petición qué avisar y qué es lo más importante (máximo tres). No hay
  cron ni servicio externo. Cuando haya notificaciones (correo, push) leerán
  esta misma lista.
- **Recurrencias sin deriva.** La ocurrencia n se calcula desde la fecha base,
  nunca sumando a la anterior: una suscripción del 31 cobra el 28 de febrero y
  vuelve al 31 en marzo. Un cobro con fecha pasada avanza solo. «Cada 4
  semanas» son 28 días exactos, que no es lo mismo que mensual.

## Finanzas personales

Lo que una lista de suscripciones no puede contar está en `lib/life/finance.ts`
y en cuatro tablas más: `accounts`, `charges`, `subscription_prices` y los
campos de confianza de `subscriptions` y `domains`.

Tres reglas sostienen el resto:

1. **Un cargo es historia; una previsión es aritmética.** Nunca se suman. Una
   previsión que ya pasó sin cargo que la respalde es «pendiente de comprobar»:
   ni pagada ni impagada.
2. **Lo que no se sabe es nulo, nunca 0 €.** Los totales suman lo que pueden y
   dicen cuántos datos han tenido que dejar fuera. En la base de datos, un
   importe vacío obliga a `amount_status = 'unknown'` y al revés.
3. **Lo confirmado y lo estimado se suman por separado**, para que un
   «aproximadamente 5 €» no parezca tan firme como un 32 € confirmado.

Además:

- **Solo `paid` es dinero gastado.** Una autorización, un intento rechazado o
  un pago devuelto se guardan con su estado y no suman.
- **El mismo pago visto en PayPal y en el banco** se enlaza con `mirror_of_id`
  y se cuenta una vez.
- **Fecha de operación, fecha valor y contabilización** se guardan aparte,
  igual que la cuota que paga un cargo (`due_date`): Grover paga el día 15 la
  cuota fechada el 30, y la serie no se desplaza por ello.
- **`variable` y `unknown`** son frecuencias que no generan previsiones: un
  coste por consumo no tiene serie.
- **Cuenta observada y cuenta destino** son cosas distintas. Centralizar los
  cobros es un objetivo: cada suscripción lleva su `account_change` hasta que
  se confirma.
- **Clasificación por proyecto solo cuando está acreditada**; el resto queda en
  «sin clasificar» a propósito.

### Importar sin duplicar

`import_life_data(payload jsonb)` (security invoker: corre como el usuario, con
RLS) mezcla un lote de datos de forma idempotente:

- cada fila lleva una `key` estable que se guarda en `import_key`, con índice
  único por usuario; las referencias entre filas usan esas claves;
- si la fila ya existe, **solo rellena huecos**: nunca sobrescribe un valor
  que ya estaba;
- si un dato contradice al que hay, **crea una tarea de revisión** con los dos
  valores y deja decidir;
- el precio más reciente pasa a ser el vigente, y los anteriores se conservan
  en `subscription_prices`.

Volver a ejecutarla no duplica nada. El lote con los datos reales vive fuera
del repositorio: son registros privados.

## Seguridad

1. **RLS en las doce tablas**, con políticas separadas de SELECT, INSERT,
   UPDATE y DELETE para `authenticated`, todas `user_id = auth.uid()`. El rol
   `anon` no tiene ningún permiso.
2. **Claves foráneas compuestas** `(id, user_id)`: una tarea solo puede apuntar
   a un proyecto del mismo usuario, aunque alguien adivine un id ajeno.
3. **Lista de correos permitidos** (`PANEL_ALLOWED_EMAILS`). Cualquiera puede
   crear una cuenta de Supabase con la clave pública; RLS la deja vacía y esta
   lista la deja fuera. Una lista vacía cierra el panel, no lo abre.
4. **Sin clave de servicio.** La app solo conoce la clave publicable. Todas las
   consultas corren como el usuario.
5. **Sin indexar.** `X-Robots-Tag: noindex` desde el proxy, `robots` en los
   metadatos, `Disallow: /panel` en robots.txt y fuera del sitemap.

Verificado el 2026-10-10 contra la base real, actuando como dos usuarios: A no
ve, no edita, no borra ni suplanta filas de B, no puede enlazar a un proyecto
de B (23503) y `anon` no lee nada (42501). Supabase Advisors: sin avisos.

## Configuración

| Variable                               | Dónde            |
| -------------------------------------- | ---------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Vercel y `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel y `.env.local` |
| `PANEL_ALLOWED_EMAILS`                 | Vercel y `.env.local`, separados por comas |

Proyecto de Supabase: `life-crm` (`blbgumrukvdnaxgnoycu`, París). Es solo para
este panel: no mezclar con los proyectos de otros negocios.

Después de crear tu cuenta, en el panel de Supabase conviene:

- **Authentication → Sign In / Providers → desactivar «Allow new users to
  sign up».** La lista de correos ya bloquea a los demás; esto lo cierra
  también en origen.
- **Authentication → URL Configuration → Site URL**: la URL de producción, para
  que los enlaces de confirmación y recuperación vuelvan a la web.

## Datos iniciales

No hay datos inventados. Lo único precargable son los proyectos que la propia
web ya conoce (WAT, WAT Sales, YourHotelWeb y esta web), con un botón y sin
fechas, progreso ni costes. Las suscripciones habituales (Supabase, Vercel,
Claude, GitHub…) se rellenan de un toque, pero el importe y la fecha los
pones tú.

## Verificación

- `npm test`: fechas en la zona de Madrid, recurrencias (31 de enero, años
  bisiestos, viajes de varios días), dinero, recordatorios a 30/15/7 días,
  prioridades y validación de formularios. En finanzas: la serie de 28 días
  cuadra con las fechas calculadas a mano, un retraso bancario no desplaza la
  serie, una previsión pasada no se convierte en impago, las autorizaciones y
  los intentos fallidos no suman, un pago espejo se cuenta una vez, una cuota
  pagada tarde se asigna a su cuota y lo desconocido nunca vale 0 €.
- `e2e/panel.spec.ts`: el panel no es accesible ni indexable sin sesión.
- El flujo con sesión (crear, editar, completar, buscar, convertir desde el
  inbox, borrar, persistir tras recargar, tema oscuro, 14 páginas a 390, 768,
  1366 y 1920 sin desbordes) se probó contra la base real con un usuario de
  prueba que después se eliminó.

## Socios y gastos compartidos

Tres tablas: `partners`, `project_partners` (con el porcentaje acordado) y
`charge_shares` (el reparto de un cargo concreto). En los cargos,
`paid_by_partner_id` dice quién pagó y `shared` si se reparte.

«Quién lo pagó» y «a quién le toca» son preguntas distintas y se guardan
aparte: el saldo de cada socio es la resta de las dos. Un reparto que nadie ha
acordado se queda sin repartir y se avisa, en vez de dividir a partes iguales
por tu cuenta. Un intento fallido no mueve ningún saldo.

## Gastos de un proyecto

Un proyecto gasta de dos maneras y la ficha las enseña juntas, en una lista:

- **De uno solo**: el gasto es entero de quien lo pagó. Es lo que sale por
  defecto, y vale tanto para lo tuyo como para lo que puso un socio por su
  cuenta. No mueve ningún saldo.
- **Compartido**: se reparte por los porcentajes acordados del proyecto, y lo
  que no está acordado se dice en vez de dividirse a ciegas.

Debajo de la lista va el total del proyecto y lo que ha puesto cada uno.

## Colores

Cada proyecto elige un color de una paleta de ocho (`projects.color`), con
tokens `--color-tag-*` en claro y en oscuro. El calendario usa el color del
proyecto cuando lo hay y, si no, el del tipo de cosa (dinero ámbar, estudios
violeta, personas rosa). El color nunca va solo: el nombre viaja siempre con
él, y al pasar el ratón o al enfocar con el teclado sale la información
completa.

## El tablero de tareas

Es la vista con la que abre Tareas: lo que hay y en qué va cada cosa antes de
cualquier filtro.

`/panel/tareas` reparte las tareas en cuatro columnas por
estado. Se arrastra con el ratón y, para el móvil y el teclado, cada tarjeta
lleva un desplegable con las mismas cuatro opciones. El orden dentro de una
columna vive en `tasks.position`: una tarjeta aterriza en el punto medio entre
sus vecinas, así que mover una escribe una fila.

## La IA

`/panel/ia` es un chat que recibe en cada mensaje un resumen escrito del panel
(`lib/life/ai.ts`): tareas, agenda de 14 días, suscripciones, próximos pagos,
cargos sin identificar, dominios y asignaturas. No tiene acceso a la base de
datos; solo ve lo que el resumen cuenta, y responde con las mismas reglas de
honestidad que las pantallas.

Puede crear tres cosas —tarea, evento y nota del inbox— y lo hace con el
cliente del propio usuario, así que RLS sigue mandando. La conversación no se
guarda: vive en la pantalla.

Necesita `GEMINI_API_KEY` en el entorno. Sin ella, el chat lo dice y el resto
del panel funciona igual.

## Fase 2 (no hecho, a propósito)

- Conciliación automática con el banco (hoy los cargos se apuntan a mano o se
  importan en lote).

- Notificaciones fuera del panel (correo diario con `deriveReminders`, push).
- Importar el calendario de Google o iCal, y exportar a .ics.
- Subida de archivos al vault (hoy guarda enlaces).
- Movimientos bancarios automáticos.
- Arrastrar eventos en el calendario.
