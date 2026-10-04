# Component Inventory

Gunakan shadcn/ui sebagai primitive, lalu bangun komponen domain reusable. Setiap komponen memiliki states, keyboard behavior, loading/error, responsive, dan Storybook/test bila proyek mengadopsinya.

## Foundation

Button, IconButton, Link, Input, Textarea, Select, Combobox, Checkbox, Radio, DatePicker, TimeSlotPicker, Dialog, Drawer, Toast, Alert, Tooltip, Tabs, Table/DataList, Pagination, Skeleton, EmptyState, ErrorState, ConfirmAction.

## Domain

ServiceCard, AddressPicker, MapPinPicker, ServiceabilityNotice, SlotCapacityBadge, OrderCard, OrderHeader, StatusBadge, OrderTimeline, NextActionPanel, ReasonForm, ApprovalCard, BagVerificationForm, ConditionChecklist, EvidenceUploader/Gallery, WeightEntryTable, PricingBreakdown, InvoiceSummary, PaymentMethodCard, QRPanel, VAPanel, PaymentStatus, ProcessStepper, QCChecklist, ReprocessBanner, LiveMapPanel, CourierStatusCard, ProofCard, ReviewForm, ComplaintCard/Thread, NotificationCenter, AuditTable, MetricCard, AnalyticsChart, FeatureFlagRow.

## Reuse rules

Status/color/icon mapping tunggal. Money/time formatter tunggal. Role hanya menentukan available action melalui permission result, bukan membuat tiga versi visual tanpa alasan. Domain component tidak memanggil vendor langsung; data/action diberikan lewat typed props/server boundary.
