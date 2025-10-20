# Auto-translation fields and triggers

## Propósito
Añadir campos para auto-traducción a `service_translations` y triggers para marcar como `outdated` cuando cambie el contenido fuente.

## Campos añadidos
- `content_hash`: Hash SHA256 del contenido fuente (title + description)
- `auto_translated_at`: Timestamp de traducción automática
- `verified_at`: Timestamp de verificación manual por admin
- `translation_provider`: Proveedor usado (deepl/google/azure)
- `translation_job_id`: ID del job de traducción

## Índices
- `content_hash` para búsquedas rápidas
- `translation_job_id` para tracking de colas

## Funciones
- `calculate_content_hash()`: Calcula hash del contenido
- `mark_translations_outdated()`: Marca traducciones como outdated
- `create_translation_job()`: Crea job de traducción
- `update_translation_completed()`: Actualiza traducción completada
- `verify_translation()`: Marca como verificada por admin

## Triggers
- `trg_mark_translations_outdated`: Se ejecuta en UPDATE de services
