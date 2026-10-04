export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "OWNER" | "ADMIN" | "CUSTOMER";
export type ProfileStatus = "ACTIVE" | "DISABLED";
export type ServiceUnit = "KG" | "ITEM";
export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "PICKUP_SCHEDULED"
  | "PICKUP_ON_THE_WAY"
  | "PICKED_UP"
  | "RECEIVED"
  | "WEIGHED"
  | "WAITING_PAYMENT"
  | "REJECTED"
  | "CANCELLED";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Timestamped = { created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Timestamped & {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          status: ProfileStatus;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          status?: ProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: { full_name?: string | null; phone?: string | null };
        Relationships: [];
      };
      services: {
        Row: Timestamped & {
          id: string;
          code: string;
          name: string;
          unit: ServiceUnit;
          duration_hours: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          unit: ServiceUnit;
          duration_hours: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          unit?: ServiceUnit;
          duration_hours?: number;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_price_versions: {
        Row: {
          id: string;
          service_id: string;
          unit_price: number;
          minimum_charge: number;
          effective_from: string;
          effective_to: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          unit_price: number;
          minimum_charge: number;
          effective_from: string;
          effective_to?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: { effective_to?: string | null };
        Relationships: Relationship[];
      };
      service_areas: {
        Row: Timestamped & {
          id: string;
          name: string;
          geojson: Json;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          geojson: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          geojson?: Json;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      pickup_slots: {
        Row: Timestamped & {
          id: string;
          service_area_id: string;
          starts_at: string;
          ends_at: string;
          capacity: number;
          reserved_count: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          service_area_id: string;
          starts_at: string;
          ends_at: string;
          capacity: number;
          reserved_count?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          starts_at?: string;
          ends_at?: string;
          capacity?: number;
          reserved_count?: number;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      customer_addresses: {
        Row: Timestamped & {
          id: string;
          customer_id: string;
          label: string;
          address_text: string;
          latitude: number;
          longitude: number;
          service_area_id: string;
          notes: string | null;
          is_default: boolean;
        };
        Insert: {
          id?: string;
          customer_id: string;
          label: string;
          address_text: string;
          latitude: number;
          longitude: number;
          service_area_id: string;
          notes?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          address_text?: string;
          latitude?: number;
          longitude?: number;
          service_area_id?: string;
          notes?: string | null;
          is_default?: boolean;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      orders: {
        Row: Timestamped & {
          id: string;
          order_no: string;
          customer_id: string;
          address_snapshot: Json;
          pickup_slot_id: string;
          status: OrderStatus;
          version: number;
          estimate_amount: number;
          currency: string;
          notes: string | null;
          idempotency_key: string;
          confirmed_at: string | null;
          pickup_scheduled_at: string | null;
          pickup_started_at: string | null;
          picked_up_at: string | null;
          received_at: string | null;
          weighed_at: string | null;
          invoice_issued_at: string | null;
          rejected_at: string | null;
          cancelled_at: string | null;
          rejection_reason: string | null;
          cancellation_reason: string | null;
        };
        Insert: {
          id?: string;
          order_no: string;
          customer_id: string;
          address_snapshot: Json;
          pickup_slot_id: string;
          status?: OrderStatus;
          version?: number;
          estimate_amount: number;
          currency?: string;
          notes?: string | null;
          idempotency_key: string;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          pickup_scheduled_at?: string | null;
          pickup_started_at?: string | null;
          picked_up_at?: string | null;
          received_at?: string | null;
          weighed_at?: string | null;
          invoice_issued_at?: string | null;
          rejected_at?: string | null;
          cancelled_at?: string | null;
          rejection_reason?: string | null;
          cancellation_reason?: string | null;
        };
        Update: {
          status?: OrderStatus;
          version?: number;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string;
          service_snapshot: Json;
          estimated_qty: number;
          preference_snapshot: Json;
          actual_qty: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          service_id: string;
          service_snapshot: Json;
          estimated_qty: number;
          preference_snapshot?: Json;
          actual_qty?: number | null;
          created_at?: string;
        };
        Update: { actual_qty?: number | null };
        Relationships: Relationship[];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          from_status: OrderStatus | null;
          to_status: OrderStatus;
          actor_id: string;
          actor_role: UserRole;
          reason_code: string | null;
          note: string | null;
          occurred_at: string;
          correlation_id: string;
          metadata: Json;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      pickup_delivery_tasks: {
        Row: Timestamped & {
          id: string;
          order_id: string;
          type: "PICKUP";
          status: OrderStatus;
          assigned_admin_id: string;
          scheduled_at: string | null;
          started_at: string | null;
          arrived_at: string | null;
          completed_at: string | null;
          location_session_id: string | null;
          attempt_no: number;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      bag_records: {
        Row: {
          id: string;
          order_id: string;
          bag_code: string;
          expected_count: number;
          received_count: number | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      condition_records: {
        Row: {
          id: string;
          order_id: string;
          condition_code: string;
          description: string | null;
          needs_approval: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      order_evidence: {
        Row: {
          id: string;
          order_id: string;
          task_id: string;
          kind: "PICKUP_PROOF";
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          sha256: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          actor_role: UserRole;
          event_type: string;
          entity_type: string;
          entity_id: string;
          old_value: Json | null;
          new_value: Json | null;
          reason: string | null;
          ip_hash: string | null;
          correlation_id: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      order_command_receipts: {
        Row: {
          id: string;
          actor_id: string;
          order_id: string;
          command: string;
          idempotency_key: string;
          result_status: OrderStatus;
          result_version: number;
          result_updated_at: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      invoices: {
        Row: {
          id: string;
          order_id: string;
          invoice_no: string;
          status: "ISSUED";
          subtotal: number;
          discount: number;
          surcharge: number;
          tax: number;
          total: number;
          currency: "IDR";
          pricing_snapshot: Json;
          issued_at: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          type: "SERVICE";
          description: string;
          qty: number;
          unit_price: number;
          amount: number;
          source_ref: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: Relationship[];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          entity_type: string;
          entity_id: string;
          dedupe_key: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: { read_at?: string | null };
        Relationships: Relationship[];
      };
      domain_outbox: {
        Row: {
          id: string;
          event_type: string;
          aggregate_type: string;
          aggregate_id: string;
          payload: Json;
          dedupe_key: string;
          occurred_at: string;
          published_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_actual_weight: {
        Args: {
          p_order_id: string;
          p_expected_version: number;
          p_idempotency_key: string;
          p_actual_items: Json;
          p_reason: string | null;
          p_correlation_id: string;
        };
        Returns: {
          id: string;
          order_no: string;
          status: OrderStatus;
          version: number;
          updated_at: string;
        }[];
      };
      issue_final_invoice: {
        Args: {
          p_order_id: string;
          p_expected_version: number;
          p_idempotency_key: string;
          p_correlation_id: string;
        };
        Returns: {
          id: string;
          invoice_no: string;
          order_id: string;
          order_status: OrderStatus;
          order_version: number;
          subtotal: number;
          discount: number;
          surcharge: number;
          tax: number;
          total: number;
          currency: "IDR";
          pricing_snapshot: Json;
          issued_at: string;
        }[];
      };
      admin_transition_order: {
        Args: {
          p_order_id: string;
          p_command: string;
          p_expected_version: number;
          p_idempotency_key: string;
          p_payload: Json;
          p_correlation_id: string;
        };
        Returns: {
          id: string;
          order_no: string;
          status: OrderStatus;
          version: number;
          updated_at: string;
        }[];
      };
      check_serviceability: {
        Args: { p_latitude: number; p_longitude: number };
        Returns: { area_id: string; area_name: string }[];
      };
      create_customer_order: {
        Args: {
          p_idempotency_key: string;
          p_address: Json;
          p_slot_id: string;
          p_items: Json;
          p_preferences: Json;
          p_notes: string | null;
          p_correlation_id: string;
        };
        Returns: {
          id: string;
          order_no: string;
          status: OrderStatus;
          estimate_amount: number;
          currency: string;
          created_at: string;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      profile_status: ProfileStatus;
      service_unit: ServiceUnit;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
