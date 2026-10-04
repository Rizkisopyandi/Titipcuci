-- Enum additions are isolated because PostgreSQL requires newly added enum values
-- to be committed before they are referenced by later schema/function changes.
alter type public.order_status add value if not exists 'WEIGHED';
alter type public.order_status add value if not exists 'WAITING_PAYMENT';
