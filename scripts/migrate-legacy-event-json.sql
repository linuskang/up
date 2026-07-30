-- Migrate legacy Event JSON shapes to the new schema.
-- Run this against your Postgres database after the content/contextId migrations have been applied.
--
-- psql command example:
--   psql -d your_database -f apps/upstream/prisma/migrate-legacy-event-json.sql

-- 1. Fields: old shape { name, value } -> new shape { title, value }
UPDATE "Event"
SET "fields" = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'title', item->>'name',
            'value', item->>'value'
        )
    )
    FROM jsonb_array_elements("fields") AS item
)
WHERE "fields" IS NOT NULL
  AND jsonb_typeof("fields") = 'array'
  AND EXISTS (
      SELECT 1 FROM jsonb_array_elements("fields") item WHERE item ? 'name'
  );

-- 2. Timeline events: old shape { icon, time, content } -> new shape { title, icon, createdAt }
UPDATE "Event"
SET "events" = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'title', item->>'content',
            'icon', COALESCE(item->>'icon', '~'),
            'createdAt', to_jsonb("createdAt")
        )
    )
    FROM jsonb_array_elements("events") AS item
)
WHERE "events" IS NOT NULL
  AND jsonb_typeof("events") = 'array'
  AND EXISTS (
      SELECT 1 FROM jsonb_array_elements("events") item WHERE item ? 'content'
  );

-- 3. Actions: old shape { title, type, url } -> new shape { title, variant, url }
--    Also renames the legacy "default" variant to "primary".
UPDATE "Event"
SET "actions" = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'title', item->>'title',
            'variant', CASE
                WHEN item->>'type' = 'default' THEN 'primary'
                ELSE item->>'type'
            END,
            'url', item->>'url'
        )
    )
    FROM jsonb_array_elements("actions") AS item
)
WHERE "actions" IS NOT NULL
  AND jsonb_typeof("actions") = 'array'
  AND EXISTS (
      SELECT 1 FROM jsonb_array_elements("actions") item WHERE item ? 'type'
  );
