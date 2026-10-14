ALTER TABLE IF EXISTS service_order_tasks
    ADD COLUMN IF NOT EXISTS task_position INTEGER;

WITH ordered_tasks AS (
    SELECT
        ctid,
        ROW_NUMBER() OVER (
            PARTITION BY service_order_id
            ORDER BY ctid
        ) - 1 AS position
    FROM service_order_tasks
    WHERE task_position IS NULL
)
UPDATE service_order_tasks AS tasks
SET task_position = ordered_tasks.position
FROM ordered_tasks
WHERE tasks.ctid = ordered_tasks.ctid;
