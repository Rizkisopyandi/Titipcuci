# TITIPCUCI — DATA DICTIONARY DATABASE AKTUAL

> **WBS 2.5 (Database Schema).** Sumber: PostgreSQL di Supabase project `titipcuci-dev`, `uydhmkhgpeynswxkaxod`; dibaca melalui katalog metadata saja, tanpa mengambil baris data user dan tanpa perubahan DDL/DML.
> **Snapshot dokumentasi:** 8 Oktober 2026. `version` migration bukan timestamp pembuktian waktu penerapan.

## Informasi Dasar
- **Jumlah tabel `public`:** 28
- **Jumlah kolom:** 323
- **Relasi foreign key:** 47 (termasuk `profiles.id → auth.users.id`).
- **RLS enabled:** 28/28 tabel.
- **RLS policies di schema public:** 47 policy pada 24 tabel; RLS enabled tidak selalu berarti ada policy akses user.
- **Enum domain:** 13.
- **Migration tercatat:** 22 versi. GitHub `main` saat pemeriksaan hanya memiliki berkas migration M0–M4, sehingga perlu sinkronisasi kode-vs-database sebelum release.

## Notasi
- **PK**: primary key; **FK**: foreign key; **UQ**: constraint UNIQUE (jika pada constraint daftar di bawah); **NOT NULL**: kolom wajib; **NULL**: dapat kosong.
- `jsonb` menunjukkan data terstruktur; `timestamptz` menyimpan timestamp dengan zona waktu; tipe enum domain terdefinisi pada bagian tersendiri.
- Struktur di bawah adalah **implementasi yang ada di database**, bukan seluruh tabel yang tercantum dalam blueprint.

## Ringkasan Tabel
| Kelompok | Tabel |
|---|---|
| Pengguna & Akses | `profiles` |
| Layanan, Tarif, Area dan Slot | `services`, `service_price_versions`, `service_areas`, `pickup_slots`, `customer_addresses` |
| Pesanan & History | `orders`, `order_items`, `order_status_history`, `notifications`, `domain_outbox` |
| Operasional, Bukti & Audit | `pickup_delivery_tasks`, `bag_records`, `condition_records`, `order_evidence`, `audit_logs`, `order_command_receipts` |
| Invoice & Pembayaran | `invoices`, `invoice_items`, `payments`, `payment_events` |
| Laundry & QC | `laundry_processes`, `quality_checks` |
| Tracking | `location_sessions` |
| Ulasan, Keluhan dan Support | `reviews`, `complaints`, `complaint_events`, `support_command_receipts` |

## Kamus Atribut per Tabel

### Pengguna & Akses

#### `public.profiles`

**Kolom:** 7 • **PK:** `id` • **RLS:** ON • **RLS policies:** 4

Deskripsi dari database: Application profile linked one-to-one to Supabase Auth. Role is never accepted from public registration.

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK, FK | — |
| 2 | `role` | `user_role` | NO | — | `'CUSTOMER'::user_role` |
| 3 | `full_name` | `text` | YES | — | — |
| 4 | `phone` | `text` | YES | — | — |
| 5 | `status` | `profile_status` | NO | — | `'ACTIVE'::profile_status` |
| 6 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 7 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `id` → `auth.users(id)` (`profiles_id_fkey`).

**Constraint validasi & keunikan:**
- `profiles_full_name_check` (CHECK): `CHECK (((full_name IS NULL) OR ((char_length(TRIM(BOTH FROM full_name)) >= 2) AND (char_length(TRIM(BOTH FROM full_name)) <= 100))))`.
- `profiles_phone_check` (CHECK): `CHECK (((phone IS NULL) OR ((char_length(TRIM(BOTH FROM phone)) >= 8) AND (char_length(TRIM(BOTH FROM phone)) <= 20))))`.

**Nama RLS policies:** `profiles_admin_read_operational_customer` (SELECT), `profiles_owner_read` (SELECT), `profiles_select_own` (SELECT), `profiles_update_own` (UPDATE).


### Layanan, Tarif, Area dan Slot

#### `public.services`

**Kolom:** 8 • **PK:** `id` • **RLS:** ON • **RLS policies:** 1

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `code` | `text` | NO | — | — |
| 3 | `name` | `text` | NO | — | — |
| 4 | `unit` | `service_unit` | NO | — | — |
| 5 | `duration_hours` | `integer` | NO | — | — |
| 6 | `active` | `boolean` | NO | — | `true` |
| 7 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 8 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Constraint validasi & keunikan:**
- `services_code_check` (CHECK): `CHECK ((code ~ '^[A-Z0-9_]{2,40}$'::text))`.
- `services_duration_hours_check` (CHECK): `CHECK ((duration_hours > 0))`.
- `services_name_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM name)) >= 2) AND (char_length(TRIM(BOTH FROM name)) <= 100)))`.
- `services_code_key` (UNIQUE): `UNIQUE (code)`.

**Nama RLS policies:** `services_read_active` (SELECT).

#### `public.service_price_versions`

**Kolom:** 8 • **PK:** `id` • **RLS:** ON • **RLS policies:** 1

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `service_id` | `uuid` | NO | FK | — |
| 3 | `unit_price` | `numeric(14,2)` | NO | — | — |
| 4 | `minimum_charge` | `numeric(14,2)` | NO | — | — |
| 5 | `effective_from` | `timestamp with time zone` | NO | — | — |
| 6 | `effective_to` | `timestamp with time zone` | YES | — | — |
| 7 | `created_by` | `uuid` | YES | FK | — |
| 8 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `created_by` → `public.profiles(id)` (`service_price_versions_created_by_fkey`).
- `service_id` → `public.services(id)` (`service_price_versions_service_id_fkey`).

**Constraint validasi & keunikan:**
- `service_price_versions_check` (CHECK): `CHECK (((effective_to IS NULL) OR (effective_to > effective_from)))`.
- `service_price_versions_minimum_charge_check` (CHECK): `CHECK ((minimum_charge >= (0)::numeric))`.
- `service_price_versions_unit_price_check` (CHECK): `CHECK ((unit_price >= (0)::numeric))`.
- `service_price_versions_service_id_effective_from_key` (UNIQUE): `UNIQUE (service_id, effective_from)`.

**Nama RLS policies:** `service_prices_read_current` (SELECT).

#### `public.service_areas`

**Kolom:** 6 • **PK:** `id` • **RLS:** ON • **RLS policies:** 1

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `name` | `text` | NO | — | — |
| 3 | `geojson` | `jsonb` | NO | — | — |
| 4 | `active` | `boolean` | NO | — | `true` |
| 5 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 6 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Constraint validasi & keunikan:**
- `service_areas_geojson_check` (CHECK): `CHECK (((geojson ->> 'type'::text) = ANY (ARRAY['Polygon'::text, 'MultiPolygon'::text])))`.
- `service_areas_name_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM name)) >= 2) AND (char_length(TRIM(BOTH FROM name)) <= 100)))`.

**Nama RLS policies:** `service_areas_read_active` (SELECT).

#### `public.pickup_slots`

**Kolom:** 9 • **PK:** `id` • **RLS:** ON • **RLS policies:** 3

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `service_area_id` | `uuid` | NO | FK | — |
| 3 | `starts_at` | `timestamp with time zone` | NO | — | — |
| 4 | `ends_at` | `timestamp with time zone` | NO | — | — |
| 5 | `capacity` | `integer` | NO | — | — |
| 6 | `reserved_count` | `integer` | NO | — | `0` |
| 7 | `active` | `boolean` | NO | — | `true` |
| 8 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 9 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `service_area_id` → `public.service_areas(id)` (`pickup_slots_service_area_id_fkey`).

**Constraint validasi & keunikan:**
- `pickup_slots_capacity_check` (CHECK): `CHECK ((capacity > 0))`.
- `pickup_slots_check` (CHECK): `CHECK (((reserved_count >= 0) AND (reserved_count <= capacity)))`.
- `pickup_slots_check1` (CHECK): `CHECK ((ends_at > starts_at))`.
- `pickup_slots_service_area_id_starts_at_ends_at_key` (UNIQUE): `UNIQUE (service_area_id, starts_at, ends_at)`.

**Nama RLS policies:** `pickup_slots_admin_owner_read` (SELECT), `pickup_slots_customer_order_read` (SELECT), `pickup_slots_read_available` (SELECT).

#### `public.customer_addresses`

**Kolom:** 11 • **PK:** `id` • **RLS:** ON • **RLS policies:** 1

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `customer_id` | `uuid` | NO | FK | — |
| 3 | `label` | `text` | NO | — | — |
| 4 | `address_text` | `text` | NO | — | — |
| 5 | `latitude` | `numeric(9,6)` | NO | — | — |
| 6 | `longitude` | `numeric(9,6)` | NO | — | — |
| 7 | `service_area_id` | `uuid` | NO | FK | — |
| 8 | `notes` | `text` | YES | — | — |
| 9 | `is_default` | `boolean` | NO | — | `false` |
| 10 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 11 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `service_area_id` → `public.service_areas(id)` (`customer_addresses_service_area_id_fkey`).
- `customer_id` → `public.profiles(id)` (`customer_addresses_customer_id_fkey`).

**Constraint validasi & keunikan:**
- `customer_addresses_address_text_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM address_text)) >= 8) AND (char_length(TRIM(BOTH FROM address_text)) <= 500)))`.
- `customer_addresses_label_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM label)) >= 2) AND (char_length(TRIM(BOTH FROM label)) <= 50)))`.
- `customer_addresses_latitude_check` (CHECK): `CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)))`.
- `customer_addresses_longitude_check` (CHECK): `CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))`.
- `customer_addresses_notes_check` (CHECK): `CHECK (((notes IS NULL) OR (char_length(TRIM(BOTH FROM notes)) <= 500)))`.

**Nama RLS policies:** `customer_addresses_select_own` (SELECT).


### Pesanan & History

#### `public.orders`

**Kolom:** 39 • **PK:** `id` • **RLS:** ON • **RLS policies:** 3

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_no` | `text` | NO | — | — |
| 3 | `customer_id` | `uuid` | NO | FK | — |
| 4 | `address_snapshot` | `jsonb` | NO | — | — |
| 5 | `pickup_slot_id` | `uuid` | NO | FK | — |
| 6 | `status` | `order_status` | NO | — | `'PENDING_CONFIRMATION'::order_status` |
| 7 | `version` | `integer` | NO | — | `1` |
| 8 | `estimate_amount` | `numeric(14,2)` | NO | — | — |
| 9 | `currency` | `text` | NO | — | `'IDR'::text` |
| 10 | `notes` | `text` | YES | — | — |
| 11 | `idempotency_key` | `text` | NO | — | — |
| 12 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 13 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 14 | `confirmed_at` | `timestamp with time zone` | YES | — | — |
| 15 | `pickup_scheduled_at` | `timestamp with time zone` | YES | — | — |
| 16 | `pickup_started_at` | `timestamp with time zone` | YES | — | — |
| 17 | `picked_up_at` | `timestamp with time zone` | YES | — | — |
| 18 | `received_at` | `timestamp with time zone` | YES | — | — |
| 19 | `rejected_at` | `timestamp with time zone` | YES | — | — |
| 20 | `cancelled_at` | `timestamp with time zone` | YES | — | — |
| 21 | `rejection_reason` | `text` | YES | — | — |
| 22 | `cancellation_reason` | `text` | YES | — | — |
| 23 | `weighed_at` | `timestamp with time zone` | YES | — | — |
| 24 | `invoice_issued_at` | `timestamp with time zone` | YES | — | — |
| 25 | `payment_expired_at` | `timestamp with time zone` | YES | — | — |
| 26 | `paid_at` | `timestamp with time zone` | YES | — | — |
| 27 | `processing_started_at` | `timestamp with time zone` | YES | — | — |
| 28 | `processing_completed_at` | `timestamp with time zone` | YES | — | — |
| 29 | `qc_started_at` | `timestamp with time zone` | YES | — | — |
| 30 | `qc_completed_at` | `timestamp with time zone` | YES | — | — |
| 31 | `ready_at` | `timestamp with time zone` | YES | — | — |
| 32 | `delayed_at` | `timestamp with time zone` | YES | — | — |
| 33 | `held_at` | `timestamp with time zone` | YES | — | — |
| 34 | `delay_reason` | `text` | YES | — | — |
| 35 | `hold_reason` | `text` | YES | — | — |
| 36 | `resume_state` | `order_status` | YES | — | — |
| 37 | `delivery_started_at` | `timestamp with time zone` | YES | — | — |
| 38 | `delivered_at` | `timestamp with time zone` | YES | — | — |
| 39 | `completed_at` | `timestamp with time zone` | YES | — | — |

**Foreign key keluar:**
- `customer_id` → `public.profiles(id)` (`orders_customer_id_fkey`).
- `pickup_slot_id` → `public.pickup_slots(id)` (`orders_pickup_slot_id_fkey`).

**Constraint validasi & keunikan:**
- `orders_currency_check` (CHECK): `CHECK ((currency = 'IDR'::text))`.
- `orders_estimate_amount_check` (CHECK): `CHECK ((estimate_amount >= (0)::numeric))`.
- `orders_idempotency_key_check` (CHECK): `CHECK (((char_length(idempotency_key) >= 16) AND (char_length(idempotency_key) <= 128)))`.
- `orders_notes_check` (CHECK): `CHECK (((notes IS NULL) OR (char_length(TRIM(BOTH FROM notes)) <= 1000)))`.
- `orders_version_check` (CHECK): `CHECK ((version > 0))`.
- `orders_customer_id_idempotency_key_key` (UNIQUE): `UNIQUE (customer_id, idempotency_key)`.
- `orders_order_no_key` (UNIQUE): `UNIQUE (order_no)`.

**Nama RLS policies:** `orders_admin_read` (SELECT), `orders_owner_read` (SELECT), `orders_select_own` (SELECT).

#### `public.order_items`

**Kolom:** 8 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `service_id` | `uuid` | NO | FK | — |
| 4 | `service_snapshot` | `jsonb` | NO | — | — |
| 5 | `estimated_qty` | `numeric(10,2)` | NO | — | — |
| 6 | `preference_snapshot` | `jsonb` | NO | — | `'{}'::jsonb` |
| 7 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 8 | `actual_qty` | `numeric(10,2)` | YES | — | — |

**Foreign key keluar:**
- `service_id` → `public.services(id)` (`order_items_service_id_fkey`).
- `order_id` → `public.orders(id)` (`order_items_order_id_fkey`).

**Constraint validasi & keunikan:**
- `order_items_actual_qty_check` (CHECK): `CHECK (((actual_qty IS NULL) OR (actual_qty > (0)::numeric)))`.
- `order_items_estimated_qty_check` (CHECK): `CHECK ((estimated_qty > (0)::numeric))`.
- `order_items_order_id_service_id_key` (UNIQUE): `UNIQUE (order_id, service_id)`.

**Nama RLS policies:** `order_items_admin_owner_read` (SELECT), `order_items_select_own` (SELECT).

#### `public.order_status_history`

**Kolom:** 12 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `from_status` | `order_status` | YES | — | — |
| 4 | `to_status` | `order_status` | NO | — | — |
| 5 | `actor_id` | `uuid` | YES | FK | — |
| 6 | `reason_code` | `text` | YES | — | — |
| 7 | `note` | `text` | YES | — | — |
| 8 | `occurred_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 9 | `correlation_id` | `uuid` | NO | — | — |
| 10 | `metadata` | `jsonb` | NO | — | `'{}'::jsonb` |
| 11 | `actor_role` | `user_role` | YES | — | — |
| 12 | `actor_type` | `text` | NO | — | `'USER'::text` |

**Foreign key keluar:**
- `actor_id` → `public.profiles(id)` (`order_status_history_actor_id_fkey`).
- `order_id` → `public.orders(id)` (`order_status_history_order_id_fkey`).

**Constraint validasi & keunikan:**
- `order_status_history_actor_consistency` (CHECK): `CHECK ((((actor_type = 'USER'::text) AND (actor_id IS NOT NULL) AND (actor_role IS NOT NULL)) OR ((actor_type = 'SYSTEM'::text) AND (actor_id IS NULL) AND (actor_role IS NULL))))`.
- `order_status_history_actor_type_check` (CHECK): `CHECK ((actor_type = ANY (ARRAY['USER'::text, 'SYSTEM'::text])))`.

**Nama RLS policies:** `order_history_admin_owner_read` (SELECT), `order_history_select_own` (SELECT).

#### `public.notifications`

**Kolom:** 10 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `user_id` | `uuid` | NO | FK | — |
| 3 | `type` | `text` | NO | — | — |
| 4 | `title` | `text` | NO | — | — |
| 5 | `body` | `text` | NO | — | — |
| 6 | `entity_type` | `text` | NO | — | — |
| 7 | `entity_id` | `uuid` | NO | — | — |
| 8 | `dedupe_key` | `text` | NO | — | — |
| 9 | `read_at` | `timestamp with time zone` | YES | — | — |
| 10 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `user_id` → `public.profiles(id)` (`notifications_user_id_fkey`).

**Constraint validasi & keunikan:**
- `notifications_dedupe_key_key` (UNIQUE): `UNIQUE (dedupe_key)`.

**Nama RLS policies:** `notifications_select_own` (SELECT), `notifications_update_own` (UPDATE).

#### `public.domain_outbox`

**Kolom:** 8 • **PK:** `id` • **RLS:** ON • **RLS policies:** 0

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `event_type` | `text` | NO | — | — |
| 3 | `aggregate_type` | `text` | NO | — | — |
| 4 | `aggregate_id` | `uuid` | NO | — | — |
| 5 | `payload` | `jsonb` | NO | — | — |
| 6 | `dedupe_key` | `text` | NO | — | — |
| 7 | `occurred_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 8 | `published_at` | `timestamp with time zone` | YES | — | — |

**Constraint validasi & keunikan:**
- `domain_outbox_dedupe_key_key` (UNIQUE): `UNIQUE (dedupe_key)`.


### Operasional, Bukti & Audit

#### `public.pickup_delivery_tasks`

**Kolom:** 17 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `type` | `text` | NO | — | `'PICKUP'::text` |
| 4 | `status` | `order_status` | NO | — | — |
| 5 | `assigned_admin_id` | `uuid` | NO | FK | — |
| 6 | `scheduled_at` | `timestamp with time zone` | YES | — | — |
| 7 | `started_at` | `timestamp with time zone` | YES | — | — |
| 8 | `arrived_at` | `timestamp with time zone` | YES | — | — |
| 9 | `completed_at` | `timestamp with time zone` | YES | — | — |
| 10 | `location_session_id` | `uuid` | YES | FK | — |
| 11 | `attempt_no` | `integer` | NO | — | `1` |
| 12 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 13 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 14 | `recipient_name` | `text` | YES | — | — |
| 15 | `delivery_method` | `text` | YES | — | — |
| 16 | `failure_reason` | `text` | YES | — | — |
| 17 | `failure_note` | `text` | YES | — | — |

**Foreign key keluar:**
- `order_id` → `public.orders(id)` (`pickup_delivery_tasks_order_id_fkey`).
- `assigned_admin_id` → `public.profiles(id)` (`pickup_delivery_tasks_assigned_admin_id_fkey`).
- `location_session_id` → `public.location_sessions(id)` (`pickup_delivery_tasks_location_session_fk`).

**Constraint validasi & keunikan:**
- `pickup_delivery_tasks_attempt_no_check` (CHECK): `CHECK ((attempt_no > 0))`.
- `pickup_delivery_tasks_delivery_method_check` (CHECK): `CHECK (((delivery_method IS NULL) OR (delivery_method = ANY (ARRAY['HANDOVER'::text, 'CONTACTLESS'::text]))))`.
- `pickup_delivery_tasks_failure_note_check` (CHECK): `CHECK (((failure_note IS NULL) OR (char_length(TRIM(BOTH FROM failure_note)) <= 1000)))`.
- `pickup_delivery_tasks_failure_reason_check` (CHECK): `CHECK (((failure_reason IS NULL) OR ((char_length(TRIM(BOTH FROM failure_reason)) >= 3) AND (char_length(TRIM(BOTH FROM failure_reason)) <= 200))))`.
- `pickup_delivery_tasks_recipient_name_check` (CHECK): `CHECK (((recipient_name IS NULL) OR ((char_length(TRIM(BOTH FROM recipient_name)) >= 2) AND (char_length(TRIM(BOTH FROM recipient_name)) <= 100))))`.
- `pickup_delivery_tasks_type_check` (CHECK): `CHECK ((type = ANY (ARRAY['PICKUP'::text, 'DELIVERY'::text])))`.
- `pickup_delivery_tasks_order_id_type_attempt_no_key` (UNIQUE): `UNIQUE (order_id, type, attempt_no)`.

**Nama RLS policies:** `pickup_tasks_admin_owner_read` (SELECT), `pickup_tasks_customer_read_own` (SELECT).

#### `public.bag_records`

**Kolom:** 8 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `bag_code` | `text` | NO | — | — |
| 4 | `expected_count` | `integer` | NO | — | — |
| 5 | `received_count` | `integer` | YES | — | — |
| 6 | `verified_by` | `uuid` | YES | FK | — |
| 7 | `verified_at` | `timestamp with time zone` | YES | — | — |
| 8 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `order_id` → `public.orders(id)` (`bag_records_order_id_fkey`).
- `verified_by` → `public.profiles(id)` (`bag_records_verified_by_fkey`).

**Constraint validasi & keunikan:**
- `bag_records_bag_code_check` (CHECK): `CHECK ((bag_code ~ '^[A-Z0-9-]{4,50}$'::text))`.
- `bag_records_expected_count_check` (CHECK): `CHECK (((expected_count >= 1) AND (expected_count <= 20)))`.
- `bag_records_received_count_check` (CHECK): `CHECK (((received_count IS NULL) OR ((received_count >= 1) AND (received_count <= 20))))`.
- `bag_records_bag_code_key` (UNIQUE): `UNIQUE (bag_code)`.
- `bag_records_order_id_bag_code_key` (UNIQUE): `UNIQUE (order_id, bag_code)`.

**Nama RLS policies:** `bag_records_admin_owner_read` (SELECT), `bag_records_customer_read_own` (SELECT).

#### `public.condition_records`

**Kolom:** 7 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `condition_code` | `text` | NO | — | — |
| 4 | `description` | `text` | YES | — | — |
| 5 | `needs_approval` | `boolean` | NO | — | `false` |
| 6 | `created_by` | `uuid` | NO | FK | — |
| 7 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `created_by` → `public.profiles(id)` (`condition_records_created_by_fkey`).
- `order_id` → `public.orders(id)` (`condition_records_order_id_fkey`).

**Constraint validasi & keunikan:**
- `condition_records_condition_code_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM condition_code)) >= 2) AND (char_length(TRIM(BOTH FROM condition_code)) <= 50)))`.
- `condition_records_description_check` (CHECK): `CHECK (((description IS NULL) OR (char_length(TRIM(BOTH FROM description)) <= 1000)))`.
- `condition_records_needs_approval_check` (CHECK): `CHECK ((NOT needs_approval))`.

**Nama RLS policies:** `condition_records_admin_owner_read` (SELECT), `condition_records_customer_read_own` (SELECT).

#### `public.order_evidence`

**Kolom:** 11 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `task_id` | `uuid` | YES | FK | — |
| 4 | `kind` | `text` | NO | — | — |
| 5 | `storage_path` | `text` | NO | — | — |
| 6 | `mime_type` | `text` | NO | — | — |
| 7 | `size_bytes` | `bigint` | NO | — | — |
| 8 | `sha256` | `text` | NO | — | — |
| 9 | `uploaded_by` | `uuid` | NO | FK | — |
| 10 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 11 | `complaint_id` | `uuid` | YES | FK | — |

**Foreign key keluar:**
- `task_id` → `public.pickup_delivery_tasks(id)` (`order_evidence_task_id_fkey`).
- `order_id` → `public.orders(id)` (`order_evidence_order_id_fkey`).
- `uploaded_by` → `public.profiles(id)` (`order_evidence_uploaded_by_fkey`).
- `complaint_id` → `public.complaints(id)` (`order_evidence_complaint_id_fkey`).

**Constraint validasi & keunikan:**
- `order_evidence_context_check` (CHECK): `CHECK ((((kind = ANY (ARRAY['PICKUP_PROOF'::text, 'DELIVERY_PROOF'::text])) AND (task_id IS NOT NULL) AND (complaint_id IS NULL)) OR ((kind = 'COMPLAINT_EVIDENCE'::text) AND (task_id IS NULL) AND (complaint_id IS NOT NULL))))`.
- `order_evidence_kind_check` (CHECK): `CHECK ((kind = ANY (ARRAY['PICKUP_PROOF'::text, 'DELIVERY_PROOF'::text, 'COMPLAINT_EVIDENCE'::text])))`.
- `order_evidence_mime_type_check` (CHECK): `CHECK ((mime_type = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text])))`.
- `order_evidence_sha256_check` (CHECK): `CHECK ((sha256 ~ '^[a-f0-9]{64}$'::text))`.
- `order_evidence_size_bytes_check` (CHECK): `CHECK (((size_bytes >= 1) AND (size_bytes <= 10485760)))`.
- `order_evidence_storage_path_key` (UNIQUE): `UNIQUE (storage_path)`.

**Nama RLS policies:** `order_evidence_admin_owner_read` (SELECT), `order_evidence_customer_read_own` (SELECT).

#### `public.audit_logs`

**Kolom:** 13 • **PK:** `id` • **RLS:** ON • **RLS policies:** 1

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `actor_id` | `uuid` | YES | FK | — |
| 3 | `actor_role` | `user_role` | YES | — | — |
| 4 | `event_type` | `text` | NO | — | — |
| 5 | `entity_type` | `text` | NO | — | — |
| 6 | `entity_id` | `uuid` | NO | — | — |
| 7 | `old_value` | `jsonb` | YES | — | — |
| 8 | `new_value` | `jsonb` | YES | — | — |
| 9 | `reason` | `text` | YES | — | — |
| 10 | `ip_hash` | `text` | YES | — | — |
| 11 | `correlation_id` | `uuid` | NO | — | — |
| 12 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 13 | `actor_type` | `text` | NO | — | `'USER'::text` |

**Foreign key keluar:**
- `actor_id` → `public.profiles(id)` (`audit_logs_actor_id_fkey`).

**Constraint validasi & keunikan:**
- `audit_logs_actor_consistency` (CHECK): `CHECK ((((actor_type = 'USER'::text) AND (actor_id IS NOT NULL) AND (actor_role IS NOT NULL)) OR ((actor_type = 'SYSTEM'::text) AND (actor_id IS NULL) AND (actor_role IS NULL))))`.
- `audit_logs_actor_type_check` (CHECK): `CHECK ((actor_type = ANY (ARRAY['USER'::text, 'SYSTEM'::text])))`.

**Nama RLS policies:** `audit_logs_owner_read` (SELECT).

#### `public.order_command_receipts`

**Kolom:** 9 • **PK:** `id` • **RLS:** ON • **RLS policies:** 0

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `actor_id` | `uuid` | NO | FK | — |
| 3 | `order_id` | `uuid` | NO | FK | — |
| 4 | `command` | `text` | NO | — | — |
| 5 | `idempotency_key` | `text` | NO | — | — |
| 6 | `result_status` | `order_status` | NO | — | — |
| 7 | `result_version` | `integer` | NO | — | — |
| 8 | `result_updated_at` | `timestamp with time zone` | NO | — | — |
| 9 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `order_id` → `public.orders(id)` (`order_command_receipts_order_id_fkey`).
- `actor_id` → `public.profiles(id)` (`order_command_receipts_actor_id_fkey`).

**Constraint validasi & keunikan:**
- `order_command_receipts_idempotency_key_check` (CHECK): `CHECK (((char_length(idempotency_key) >= 16) AND (char_length(idempotency_key) <= 128)))`.
- `order_command_receipts_actor_id_idempotency_key_key` (UNIQUE): `UNIQUE (actor_id, idempotency_key)`.


### Invoice & Pembayaran

#### `public.invoices`

**Kolom:** 14 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `invoice_no` | `text` | NO | — | — |
| 4 | `status` | `text` | NO | — | `'ISSUED'::text` |
| 5 | `subtotal` | `numeric(14,2)` | NO | — | — |
| 6 | `discount` | `numeric(14,2)` | NO | — | `0` |
| 7 | `surcharge` | `numeric(14,2)` | NO | — | `0` |
| 8 | `tax` | `numeric(14,2)` | NO | — | `0` |
| 9 | `total` | `numeric(14,2)` | NO | — | — |
| 10 | `currency` | `text` | NO | — | `'IDR'::text` |
| 11 | `pricing_snapshot` | `jsonb` | NO | — | — |
| 12 | `issued_at` | `timestamp with time zone` | NO | — | — |
| 13 | `paid_at` | `timestamp with time zone` | YES | — | — |
| 14 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `order_id` → `public.orders(id)` (`invoices_order_id_fkey`).

**Constraint validasi & keunikan:**
- `invoices_check` (CHECK): `CHECK ((total = (((subtotal - discount) + surcharge) + tax)))`.
- `invoices_currency_check` (CHECK): `CHECK ((currency = 'IDR'::text))`.
- `invoices_discount_check` (CHECK): `CHECK ((discount >= (0)::numeric))`.
- `invoices_status_check` (CHECK): `CHECK ((status = ANY (ARRAY['ISSUED'::text, 'PAID'::text])))`.
- `invoices_subtotal_check` (CHECK): `CHECK ((subtotal >= (0)::numeric))`.
- `invoices_surcharge_check` (CHECK): `CHECK ((surcharge >= (0)::numeric))`.
- `invoices_tax_check` (CHECK): `CHECK ((tax >= (0)::numeric))`.
- `invoices_total_check` (CHECK): `CHECK ((total >= (0)::numeric))`.
- `invoices_invoice_no_key` (UNIQUE): `UNIQUE (invoice_no)`.
- `invoices_order_id_key` (UNIQUE): `UNIQUE (order_id)`.

**Nama RLS policies:** `invoices_admin_owner_read` (SELECT), `invoices_customer_read_own` (SELECT).

#### `public.invoice_items`

**Kolom:** 9 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `invoice_id` | `uuid` | NO | FK | — |
| 3 | `type` | `text` | NO | — | — |
| 4 | `description` | `text` | NO | — | — |
| 5 | `qty` | `numeric(10,2)` | NO | — | — |
| 6 | `unit_price` | `numeric(14,2)` | NO | — | — |
| 7 | `amount` | `numeric(14,2)` | NO | — | — |
| 8 | `source_ref` | `uuid` | NO | FK | — |
| 9 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `invoice_id` → `public.invoices(id)` (`invoice_items_invoice_id_fkey`).
- `source_ref` → `public.order_items(id)` (`invoice_items_source_ref_fkey`).

**Constraint validasi & keunikan:**
- `invoice_items_amount_check` (CHECK): `CHECK ((amount >= (0)::numeric))`.
- `invoice_items_qty_check` (CHECK): `CHECK ((qty > (0)::numeric))`.
- `invoice_items_type_check` (CHECK): `CHECK ((type = 'SERVICE'::text))`.
- `invoice_items_unit_price_check` (CHECK): `CHECK ((unit_price >= (0)::numeric))`.
- `invoice_items_invoice_id_source_ref_key` (UNIQUE): `UNIQUE (invoice_id, source_ref)`.

**Nama RLS policies:** `invoice_items_admin_owner_read` (SELECT), `invoice_items_customer_read_own` (SELECT).

#### `public.payments`

**Kolom:** 19 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `invoice_id` | `uuid` | NO | FK | — |
| 3 | `attempt_no` | `integer` | NO | — | — |
| 4 | `provider` | `text` | NO | — | `'MIDTRANS_SANDBOX'::text` |
| 5 | `method` | `payment_method` | NO | — | — |
| 6 | `bank` | `text` | YES | — | — |
| 7 | `provider_order_id` | `text` | NO | — | — |
| 8 | `provider_transaction_id` | `text` | YES | — | — |
| 9 | `status` | `payment_status` | NO | — | `'UNPAID'::payment_status` |
| 10 | `amount` | `numeric(14,2)` | NO | — | — |
| 11 | `currency` | `text` | NO | — | `'IDR'::text` |
| 12 | `payment_instructions` | `jsonb` | NO | — | `'{}'::jsonb` |
| 13 | `expires_at` | `timestamp with time zone` | YES | — | — |
| 14 | `paid_at` | `timestamp with time zone` | YES | — | — |
| 15 | `failed_at` | `timestamp with time zone` | YES | — | — |
| 16 | `failure_code` | `text` | YES | — | — |
| 17 | `idempotency_key` | `text` | NO | — | — |
| 18 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 19 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `invoice_id` → `public.invoices(id)` (`payments_invoice_id_fkey`).

**Constraint validasi & keunikan:**
- `payments_amount_check` (CHECK): `CHECK ((amount > (0)::numeric))`.
- `payments_attempt_no_check` (CHECK): `CHECK ((attempt_no > 0))`.
- `payments_check` (CHECK): `CHECK ((((method = 'QRIS'::payment_method) AND (bank IS NULL)) OR ((method = 'VA'::payment_method) AND (bank = ANY (ARRAY['BCA'::text, 'BNI'::text, 'BRI'::text, 'PERMATA'::text])))))`.
- `payments_check1` (CHECK): `CHECK (((status <> 'PAID'::payment_status) OR (paid_at IS NOT NULL)))`.
- `payments_currency_check` (CHECK): `CHECK ((currency = 'IDR'::text))`.
- `payments_idempotency_key_check` (CHECK): `CHECK (((char_length(idempotency_key) >= 16) AND (char_length(idempotency_key) <= 128)))`.
- `payments_payment_instructions_check` (CHECK): `CHECK ((jsonb_typeof(payment_instructions) = 'object'::text))`.
- `payments_provider_check` (CHECK): `CHECK ((provider = 'MIDTRANS_SANDBOX'::text))`.
- `payments_provider_order_id_check` (CHECK): `CHECK (((char_length(provider_order_id) >= 8) AND (char_length(provider_order_id) <= 100)))`.
- `payments_idempotency_key_key` (UNIQUE): `UNIQUE (idempotency_key)`.
- `payments_invoice_id_attempt_no_key` (UNIQUE): `UNIQUE (invoice_id, attempt_no)`.
- `payments_provider_order_id_key` (UNIQUE): `UNIQUE (provider_order_id)`.
- `payments_provider_transaction_id_key` (UNIQUE): `UNIQUE (provider_transaction_id)`.

**Nama RLS policies:** `payments_admin_owner_read` (SELECT), `payments_customer_read_own` (SELECT).

#### `public.payment_events`

**Kolom:** 9 • **PK:** `id` • **RLS:** ON • **RLS policies:** 0

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `payment_id` | `uuid` | YES | FK | — |
| 3 | `provider_event_id` | `text` | NO | — | — |
| 4 | `signature_hash` | `text` | NO | — | — |
| 5 | `normalized_status` | `payment_status` | NO | — | — |
| 6 | `payload_redacted` | `jsonb` | NO | — | — |
| 7 | `received_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 8 | `processed_at` | `timestamp with time zone` | YES | — | — |
| 9 | `result` | `text` | NO | — | — |

**Foreign key keluar:**
- `payment_id` → `public.payments(id)` (`payment_events_payment_id_fkey`).

**Constraint validasi & keunikan:**
- `payment_events_payload_redacted_check` (CHECK): `CHECK ((jsonb_typeof(payload_redacted) = 'object'::text))`.
- `payment_events_provider_event_id_check` (CHECK): `CHECK (((char_length(provider_event_id) >= 32) AND (char_length(provider_event_id) <= 128)))`.
- `payment_events_signature_hash_check` (CHECK): `CHECK ((char_length(signature_hash) = 64))`.
- `payment_events_provider_event_id_key` (UNIQUE): `UNIQUE (provider_event_id)`.


### Laundry & QC

#### `public.laundry_processes`

**Kolom:** 10 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `stage` | `process_stage` | NO | — | — |
| 4 | `status` | `process_status` | NO | — | `'PENDING'::process_status` |
| 5 | `started_at` | `timestamp with time zone` | YES | — | — |
| 6 | `completed_at` | `timestamp with time zone` | YES | — | — |
| 7 | `operator_id` | `uuid` | YES | FK | — |
| 8 | `note` | `text` | YES | — | — |
| 9 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 10 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `operator_id` → `public.profiles(id)` (`laundry_processes_operator_id_fkey`).
- `order_id` → `public.orders(id)` (`laundry_processes_order_id_fkey`).

**Constraint validasi & keunikan:**
- `laundry_processes_order_id_stage_key` (UNIQUE): `UNIQUE (order_id, stage)`.

**Nama RLS policies:** `laundry_processes_admin_owner_read` (SELECT), `laundry_processes_customer_read_own` (SELECT).

#### `public.quality_checks`

**Kolom:** 8 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `attempt_no` | `integer` | NO | — | `1` |
| 4 | `checklist` | `jsonb` | NO | — | — |
| 5 | `result` | `qc_result` | NO | — | — |
| 6 | `reason` | `text` | YES | — | — |
| 7 | `inspector_id` | `uuid` | NO | FK | — |
| 8 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `inspector_id` → `public.profiles(id)` (`quality_checks_inspector_id_fkey`).
- `order_id` → `public.orders(id)` (`quality_checks_order_id_fkey`).

**Constraint validasi & keunikan:**
- `quality_checks_attempt_no_check` (CHECK): `CHECK ((attempt_no > 0))`.
- `quality_checks_order_id_attempt_no_key` (UNIQUE): `UNIQUE (order_id, attempt_no)`.

**Nama RLS policies:** `quality_checks_admin_owner_read` (SELECT), `quality_checks_customer_read_own` (SELECT).


### Tracking

#### `public.location_sessions`

**Kolom:** 11 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

Deskripsi dari database: Ephemeral pickup tracking session metadata. Raw coordinates and route history are never stored.

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `task_id` | `uuid` | NO | FK | — |
| 3 | `admin_id` | `uuid` | NO | FK | — |
| 4 | `started_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 5 | `last_seen_at` | `timestamp with time zone` | YES | — | — |
| 6 | `expires_at` | `timestamp with time zone` | NO | — | — |
| 7 | `stopped_at` | `timestamp with time zone` | YES | — | — |
| 8 | `stop_reason` | `text` | YES | — | — |
| 9 | `last_accepted_sequence` | `bigint` | NO | — | `0` |
| 10 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 11 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `admin_id` → `public.profiles(id)` (`location_sessions_admin_id_fkey`).
- `task_id` → `public.pickup_delivery_tasks(id)` (`location_sessions_task_id_fkey`).

**Constraint validasi & keunikan:**
- `location_sessions_check` (CHECK): `CHECK ((expires_at >= started_at))`.
- `location_sessions_last_accepted_sequence_check` (CHECK): `CHECK ((last_accepted_sequence >= 0))`.
- `location_sessions_stop_reason_check` (CHECK): `CHECK (((stop_reason IS NULL) OR ((char_length(stop_reason) >= 3) AND (char_length(stop_reason) <= 160))))`.
- `location_sessions_task_id_key` (UNIQUE): `UNIQUE (task_id)`.

**Nama RLS policies:** `location_sessions_assigned_admin_read` (SELECT), `location_sessions_customer_read_own` (SELECT).


### Ulasan, Keluhan dan Support

#### `public.reviews`

**Kolom:** 9 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `customer_id` | `uuid` | NO | FK | — |
| 4 | `rating` | `integer` | NO | — | — |
| 5 | `comment` | `text` | YES | — | — |
| 6 | `version` | `integer` | NO | — | `1` |
| 7 | `editable_until` | `timestamp with time zone` | NO | — | — |
| 8 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 9 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `customer_id` → `public.profiles(id)` (`reviews_customer_id_fkey`).
- `order_id` → `public.orders(id)` (`reviews_order_id_fkey`).

**Constraint validasi & keunikan:**
- `reviews_comment_check` (CHECK): `CHECK (((comment IS NULL) OR (char_length(TRIM(BOTH FROM comment)) <= 1000)))`.
- `reviews_rating_check` (CHECK): `CHECK (((rating >= 1) AND (rating <= 5)))`.
- `reviews_version_check` (CHECK): `CHECK ((version > 0))`.
- `reviews_order_id_customer_id_key` (UNIQUE): `UNIQUE (order_id, customer_id)`.
- `reviews_order_id_key` (UNIQUE): `UNIQUE (order_id)`.

**Nama RLS policies:** `reviews_admin_owner_read` (SELECT), `reviews_customer_read_own` (SELECT).

#### `public.complaints`

**Kolom:** 22 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `order_id` | `uuid` | NO | FK | — |
| 3 | `customer_id` | `uuid` | NO | FK | — |
| 4 | `category` | `complaint_category` | NO | — | — |
| 5 | `description` | `text` | NO | — | — |
| 6 | `status` | `complaint_status` | NO | — | `'OPEN'::complaint_status` |
| 7 | `priority` | `complaint_priority` | NO | — | `'NORMAL'::complaint_priority` |
| 8 | `version` | `integer` | NO | — | `1` |
| 9 | `assigned_admin_id` | `uuid` | YES | FK | — |
| 10 | `sla_due_at` | `timestamp with time zone` | YES | — | — |
| 11 | `sla_paused_at` | `timestamp with time zone` | YES | — | — |
| 12 | `sla_remaining_seconds` | `integer` | YES | — | — |
| 13 | `sla_total_paused_seconds` | `integer` | NO | — | `0` |
| 14 | `sla_pause_reason` | `text` | YES | — | — |
| 15 | `resolution_outcome` | `complaint_resolution_outcome` | YES | — | — |
| 16 | `resolution_reason` | `text` | YES | — | — |
| 17 | `resolution_next_action` | `text` | YES | — | — |
| 18 | `resolved_at` | `timestamp with time zone` | YES | — | — |
| 19 | `closed_at` | `timestamp with time zone` | YES | — | — |
| 20 | `reopen_count` | `integer` | NO | — | `0` |
| 21 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |
| 22 | `updated_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `customer_id` → `public.profiles(id)` (`complaints_customer_id_fkey`).
- `order_id` → `public.orders(id)` (`complaints_order_id_fkey`).
- `assigned_admin_id` → `public.profiles(id)` (`complaints_assigned_admin_id_fkey`).

**Constraint validasi & keunikan:**
- `complaints_check` (CHECK): `CHECK (((status = 'OPEN'::complaint_status) OR (assigned_admin_id IS NOT NULL)))`.
- `complaints_check1` (CHECK): `CHECK (((status <> 'WAITING_CUSTOMER'::complaint_status) OR ((sla_due_at IS NULL) AND (sla_paused_at IS NOT NULL) AND (sla_remaining_seconds IS NOT NULL))))`.
- `complaints_check2` (CHECK): `CHECK (((status = 'WAITING_CUSTOMER'::complaint_status) OR ((sla_paused_at IS NULL) AND (sla_remaining_seconds IS NULL) AND (sla_pause_reason IS NULL))))`.
- `complaints_check3` (CHECK): `CHECK (((status <> ALL (ARRAY['RESOLVED'::complaint_status, 'REJECTED'::complaint_status, 'CLOSED'::complaint_status])) OR ((resolution_outcome IS NOT NULL) AND (resolution_reason IS NOT NULL) AND (resolved_at IS NOT NULL))))`.
- `complaints_check4` (CHECK): `CHECK (((status = 'CLOSED'::complaint_status) OR (closed_at IS NULL)))`.
- `complaints_description_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM description)) >= 20) AND (char_length(TRIM(BOTH FROM description)) <= 2000)))`.
- `complaints_reopen_count_check` (CHECK): `CHECK (((reopen_count >= 0) AND (reopen_count <= 1)))`.
- `complaints_resolution_next_action_check` (CHECK): `CHECK (((resolution_next_action IS NULL) OR (char_length(TRIM(BOTH FROM resolution_next_action)) <= 2000)))`.
- `complaints_resolution_reason_check` (CHECK): `CHECK (((resolution_reason IS NULL) OR ((char_length(TRIM(BOTH FROM resolution_reason)) >= 3) AND (char_length(TRIM(BOTH FROM resolution_reason)) <= 2000))))`.
- `complaints_sla_pause_reason_check` (CHECK): `CHECK (((sla_pause_reason IS NULL) OR ((char_length(TRIM(BOTH FROM sla_pause_reason)) >= 3) AND (char_length(TRIM(BOTH FROM sla_pause_reason)) <= 500))))`.
- `complaints_sla_remaining_seconds_check` (CHECK): `CHECK (((sla_remaining_seconds IS NULL) OR (sla_remaining_seconds >= 0)))`.
- `complaints_sla_total_paused_seconds_check` (CHECK): `CHECK ((sla_total_paused_seconds >= 0))`.
- `complaints_version_check` (CHECK): `CHECK ((version > 0))`.

**Nama RLS policies:** `complaints_admin_owner_read` (SELECT), `complaints_customer_read_own` (SELECT).

#### `public.complaint_events`

**Kolom:** 12 • **PK:** `id` • **RLS:** ON • **RLS policies:** 2

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `complaint_id` | `uuid` | NO | FK | — |
| 3 | `type` | `text` | NO | — | — |
| 4 | `actor_id` | `uuid` | NO | FK | — |
| 5 | `actor_role` | `user_role` | NO | — | — |
| 6 | `visibility` | `text` | NO | — | `'CUSTOMER'::text` |
| 7 | `from_status` | `complaint_status` | YES | — | — |
| 8 | `to_status` | `complaint_status` | NO | — | — |
| 9 | `message` | `text` | NO | — | — |
| 10 | `metadata` | `jsonb` | NO | — | `'{}'::jsonb` |
| 11 | `correlation_id` | `uuid` | NO | — | — |
| 12 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `complaint_id` → `public.complaints(id)` (`complaint_events_complaint_id_fkey`).
- `actor_id` → `public.profiles(id)` (`complaint_events_actor_id_fkey`).

**Constraint validasi & keunikan:**
- `complaint_events_message_check` (CHECK): `CHECK (((char_length(TRIM(BOTH FROM message)) >= 1) AND (char_length(TRIM(BOTH FROM message)) <= 2000)))`.
- `complaint_events_type_check` (CHECK): `CHECK ((type = ANY (ARRAY['COMPLAINT_CREATED'::text, 'COMPLAINT_UPDATED'::text, 'COMPLAINT_RESOLVED'::text])))`.
- `complaint_events_visibility_check` (CHECK): `CHECK ((visibility = ANY (ARRAY['CUSTOMER'::text, 'INTERNAL'::text])))`.

**Nama RLS policies:** `complaint_events_admin_owner_read` (SELECT), `complaint_events_customer_read_safe` (SELECT).

#### `public.support_command_receipts`

**Kolom:** 9 • **PK:** `id` • **RLS:** ON • **RLS policies:** 0

| # | Kolom | Tipe PostgreSQL | Nullable | PK/FK | Default |
|---:|---|---|:---:|---|---|
| 1 | `id` | `uuid` | NO | PK | `gen_random_uuid()` |
| 2 | `actor_id` | `uuid` | NO | FK | — |
| 3 | `aggregate_type` | `text` | NO | — | — |
| 4 | `aggregate_id` | `uuid` | NO | — | — |
| 5 | `order_id` | `uuid` | NO | FK | — |
| 6 | `command` | `text` | NO | — | — |
| 7 | `idempotency_key` | `text` | NO | — | — |
| 8 | `result_version` | `integer` | NO | — | — |
| 9 | `created_at` | `timestamp with time zone` | NO | — | `timezone('utc'::text, now())` |

**Foreign key keluar:**
- `order_id` → `public.orders(id)` (`support_command_receipts_order_id_fkey`).
- `actor_id` → `public.profiles(id)` (`support_command_receipts_actor_id_fkey`).

**Constraint validasi & keunikan:**
- `support_command_receipts_aggregate_type_check` (CHECK): `CHECK ((aggregate_type = ANY (ARRAY['REVIEW'::text, 'COMPLAINT'::text])))`.
- `support_command_receipts_idempotency_key_check` (CHECK): `CHECK (((char_length(idempotency_key) >= 16) AND (char_length(idempotency_key) <= 128)))`.
- `support_command_receipts_result_version_check` (CHECK): `CHECK ((result_version > 0))`.
- `support_command_receipts_actor_id_idempotency_key_key` (UNIQUE): `UNIQUE (actor_id, idempotency_key)`.

## PostgreSQL ENUM

| Tipe | Nilai yang tersedia |
|---|---|
| `complaint_category` | `MISSING_ITEM`, `DAMAGED_ITEM`, `QUALITY`, `DELAY`, `DELIVERY`, `PAYMENT`, `OTHER` |
| `complaint_priority` | `LOW`, `NORMAL`, `HIGH` |
| `complaint_resolution_outcome` | `EXPLANATION_APOLOGY`, `RE_CLEAN`, `REDELIVERY`, `SERVICE_CREDIT_DEMO`, `REFUND_DEMO`, `REJECTED` |
| `complaint_status` | `OPEN`, `ACKNOWLEDGED`, `INVESTIGATING`, `WAITING_CUSTOMER`, `WAITING_INTERNAL`, `RESOLVED`, `REJECTED`, `CLOSED` |
| `order_status` | `PENDING_CONFIRMATION`, `CONFIRMED`, `PICKUP_SCHEDULED`, `PICKUP_ON_THE_WAY`, `PICKED_UP`, `RECEIVED`, `REJECTED`, `CANCELLED`, `WEIGHED`, `WAITING_PAYMENT`, `PAYMENT_EXPIRED`, `PAID`, `PROCESSING`, `QUALITY_CHECK`, `READY_FOR_DELIVERY`, `REPROCESSING`, `DELAYED`, `ON_HOLD`, `DELIVERY_ON_THE_WAY`, `DELIVERED`, `COMPLETED` |
| `payment_method` | `QRIS`, `VA` |
| `payment_status` | `UNPAID`, `PENDING`, `PAID`, `EXPIRED`, `FAILED` |
| `process_stage` | `SORTING`, `WASHING`, `DRYING`, `IRONING`, `FOLDING` |
| `process_status` | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `profile_status` | `ACTIVE`, `DISABLED` |
| `qc_result` | `PASS`, `FAIL` |
| `service_unit` | `KG`, `ITEM` |
| `user_role` | `OWNER`, `ADMIN`, `CUSTOMER` |

## Migration yang tercatat pada Supabase

| Version | Nama migration |
|---|---|
| `20261003000000` | `m0_foundation` |
| `20261003000100` | `m1_auth_profiles` |
| `20261004000100` | `m2_customer_orders` |
| `20261005000100` | `m3_order_states` |
| `20261005000200` | `m3_admin_order_operations` |
| `20261006000100` | `m4_order_states` |
| `20261006000200` | `m4_weight_invoice` |
| `20261007000100` | `m5_order_payment_states` |
| `20261007000200` | `m5_payments` |
| `20261008000100` | `m6_order_processing_states` |
| `20261008000200` | `m6_laundry_processing_qc` |
| `20261008000300` | `m6_processing_live_fix` |
| `20261009000100` | `m7_realtime` |
| `20261010000100` | `m8_order_delivery_states` |
| `20261010000200` | `m8_delivery_operations` |
| `20261010000300` | `m8_delivery_storage_policies` |
| `20261010000400` | `m8_fail_delivery_fix` |
| `20261011000100` | `m9_reviews_complaints` |
| `20261011000200` | `m9_complaint_evidence_policies` |
| `20261012000100` | `m10_owner_analytics` |
| `20261012000200` | `m10_service_mix_fix` |
| `20261013000100` | `pickup_slot_availability_fix` |

## Batas Audit
- Semua informasi tabel, kolom, constraints, enum dan policy diambil dari metadata database. Dokumen ini **tidak membuktikan** validitas alur runtime, akses RLS bagi tiap jenis aktor, kualitas aplikasi live, atau penyelesaian seluruh milestone.
- Terdapat perbedaan antara blueprint dan schema terpasang: entitas `customer_preferences`, `approval_requests`, `refund_requests`, `feature_flags` dicantumkan blueprint tetapi **tidak ada** dalam daftar tabel public saat snapshot.
- Status blueprint `NEEDS_CUSTOMER_APPROVAL` serta `ISSUE_REPORTED` tidak terdapat pada enum `order_status` yang aktif saat snapshot.
- Kode repository GitHub branch `main` dan daftar migration Supabase perlu direkonsiliasi sebelum pengujian end-to-end dan release.

## Referensi
- [Supabase project](https://supabase.com/dashboard/project/uydhmkhgpeynswxkaxod)
- [GitHub database blueprint](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/08-DATABASE-DESIGN.md)
- [GitHub schema migrations](https://github.com/Rizkisopyandi/Titipcuci/tree/main/supabase/migrations)
- [Diagram Draw.io](TitipCuci_WBS_Diagrams.drawio)
