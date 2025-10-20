# service_translations

Propósito: almacenar traducciones por `locale` para `services` con estados `pending | auto | verified | outdated` y unicidad por `(service_id, locale)`.

Índices:
- `service_id, locale` único
- `slug` para resolución de rutas locales
- `status` para colas/admin

Triggers:
- Normaliza `locale` a minúsculas y parte corta antes de insertar/actualizar
- Actualiza `updated_at`

