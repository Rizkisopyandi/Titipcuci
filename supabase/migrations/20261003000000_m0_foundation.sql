begin;

-- M0 intentionally establishes the migration chain without creating business
-- tables. Domain schema, grants, and RLS policies start in their owning vertical
-- slice so no unprotected table is shared ahead of its tests.

commit;
