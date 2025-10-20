Rol global: Somos varios agentes trabajando en QuickTracker. Usamos ramas por tarea, PRs pequeños y reversibles, con flags y migraciones seguras.

Reglas:
- Rama por agente/tarea: feat/<area>-<corto>
- Nada directo a main. PRs con checks verdes.
- Compatibilidad: no romper endpoints/contratos actuales; usar feature flags y migraciones aditivas.
- “Do not touch” (a menos que sea tu ámbito o haya consenso): next.config.mjs, lib/stripe.ts, app/api/auth/session, _app/_document, infra/vercel.json (si existe).
- Comunicación: abrir Issue antes de PR con “Scope, Out of Scope, Rollback”.
- Tests mínimos por PR: unit + 1 integración. Si el PR toca API, añadir contract test.
- Flags/env: introducir claves nuevas como opcionales y fallback al comportamiento actual.
- Seguridad: nada de keys sensibles en código. No usar Service Role en middleware.
- Merge order (si hay conflictos): CI/Lint → CORS/Security → Pagination → Schema → Indexes → RLS → Tests → Webhooks/Admin.

Checklist de PR:
- [ ] Scope claro + archivos tocados
- [ ] Backward compatible
- [ ] Pruebas pasan (lint, typecheck, unit/integration)
- [ ] Plan de rollback


Archivo/Área	AG-SEC	AG-PAG	AG-RES	AG-CI	AG-IDX	AG-RLS	AG-TEST
middleware.ts	✔️						
app/api/services/route.ts		✔️					✔️(solo tests)
app/api/map-data/tenerife/route.ts		✔️					✔️
app/api/reservations/age-based/route.ts			✔️				✔️
supabase/migrations/**			✔️(add col)		✔️(indexes)		
supabase/policies/**						✔️	
package.json / CI				✔️			
tests/**							✔️


Orden sugerido de merge

AG-CI → asegura puertas de calidad.

AG-SEC → elimina Service Role y CORS abierto.

AG-PAG → evita payloads pesados.

AG-RES → introduce total_amount (compat).

AG-IDX → acelera consultas.

AG-RLS → asegura datos por usuario.

AG-TEST → eleva cobertura y evita regresiones.

AG-HOOKS (opcional) → cimientos de cobros.