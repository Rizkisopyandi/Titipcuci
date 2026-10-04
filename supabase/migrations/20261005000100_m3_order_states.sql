-- Enum additions are isolated because PostgreSQL requires newly added enum values
-- to be committed before they are referenced by later schema/function changes.
alter type public.order_status add value if not exists 'CONFIRMED';
alter type public.order_status add value if not exists 'PICKUP_SCHEDULED';
alter type public.order_status add value if not exists 'PICKUP_ON_THE_WAY';
alter type public.order_status add value if not exists 'PICKED_UP';
alter type public.order_status add value if not exists 'RECEIVED';
alter type public.order_status add value if not exists 'REJECTED';
alter type public.order_status add value if not exists 'CANCELLED';
