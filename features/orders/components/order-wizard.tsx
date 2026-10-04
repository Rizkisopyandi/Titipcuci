"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Info,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createOrderAction,
  type CreateOrderActionState,
} from "@/features/orders/actions";
import type {
  AddressChoice,
  ServiceChoice,
  SlotChoice,
} from "@/features/orders/types";
import { formatIdr, formatJakartaDate } from "@/lib/domain/orders";
import { cn } from "@/lib/utils";

const STEPS = ["Layanan", "Lokasi", "Jadwal", "Preferensi", "Review"];
const INITIAL_STATE: CreateOrderActionState = { status: "idle" };

type QuantityMap = Record<string, number>;

export function OrderWizard({
  services,
  addresses,
  slots,
  mapboxToken,
  idempotencyKey,
}: {
  services: ServiceChoice[];
  addresses: AddressChoice[];
  slots: SlotChoice[];
  mapboxToken?: string;
  idempotencyKey: string;
}) {
  const [actionState, formAction, pending] = useActionState(
    createOrderAction,
    INITIAL_STATE,
  );
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<QuantityMap>({});
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "new");
  const [label, setLabel] = useState("Rumah");
  const [addressText, setAddressText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [addressNotes, setAddressNotes] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [detergentNote, setDetergentNote] = useState("Standar");
  const [fragranceNote, setFragranceNote] = useState("Lembut");
  const [allergyNote, setAllergyNote] = useState("");
  const [handlingNotes, setHandlingNotes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  const selectedAddress = addresses.find((address) => address.id === addressId);
  const selectedSlot = slots.find((slot) => slot.id === slotId);
  const selectedServiceRows = services.filter((service) =>
    selectedServices.includes(service.id),
  );
  const estimate = selectedServiceRows.reduce((total, service) => {
    const quantity = quantities[service.id] ?? 1;
    return (
      total + Math.max(service.minimumCharge, service.unitPrice * quantity)
    );
  }, 0);

  const payload = useMemo(
    () => ({
      address: selectedAddress
        ? { addressId: selectedAddress.id }
        : {
            label,
            addressText,
            latitude: Number(latitude),
            longitude: Number(longitude),
            notes: addressNotes || undefined,
            saveAddress,
          },
      slotId,
      items: selectedServices.map((serviceId) => ({
        serviceId,
        estimatedQty: quantities[serviceId] ?? 1,
      })),
      preferences: {
        detergentNote,
        fragranceNote,
        allergyNote: allergyNote || undefined,
        handlingNotes,
      },
      notes: notes || undefined,
    }),
    [
      addressNotes,
      addressText,
      allergyNote,
      detergentNote,
      fragranceNote,
      handlingNotes,
      label,
      latitude,
      longitude,
      notes,
      quantities,
      saveAddress,
      selectedAddress,
      selectedServices,
      slotId,
    ],
  );

  const canContinue = [
    selectedServices.length > 0 &&
      selectedServices.every((id) => (quantities[id] ?? 0) > 0),
    Boolean(
      selectedAddress ||
      (label.trim().length >= 2 &&
        addressText.trim().length >= 8 &&
        latitude &&
        longitude),
    ),
    Boolean(slotId),
    true,
    true,
  ][step];

  function toggleService(service: ServiceChoice) {
    setSelectedServices((current) =>
      current.includes(service.id)
        ? current.filter((id) => id !== service.id)
        : [...current, service.id],
    );
    setQuantities((current) => ({
      ...current,
      [service.id]: current[service.id] ?? 1,
    }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolokasi tidak tersedia. Masukkan koordinat manual.",
      );
      return;
    }
    setLocationMessage("Mengambil lokasi…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setLocationMessage("Pin diperbarui dari lokasi perangkat.");
      },
      () =>
        setLocationMessage(
          "Izin lokasi tidak tersedia. Masukkan koordinat manual.",
        ),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-4xl">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <div className="mb-8 flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="text-muted-foreground inline-flex min-h-11 items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali
          </button>
        ) : (
          <Link
            href="/app"
            className="text-muted-foreground inline-flex min-h-11 items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Dashboard
          </Link>
        )}
        <span className="text-muted-foreground text-xs font-bold">
          {step + 1} / {STEPS.length}
        </span>
      </div>

      <ol className="mb-10 flex gap-1" aria-label="Progres pembuatan pesanan">
        {STEPS.map((name, index) => (
          <li key={name} className="flex-1">
            <span className="sr-only">{name}</span>
            <span
              className={cn(
                "block h-1.5 rounded-full transition-colors duration-200",
                index < step
                  ? "bg-ink"
                  : index === step
                    ? "bg-primary"
                    : "bg-border",
              )}
            />
          </li>
        ))}
      </ol>

      <section className="animate-rise" key={step}>
        <StepHeading step={step} />

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.length === 0 ? (
              <EmptyState text="Belum ada layanan aktif dengan harga berlaku." />
            ) : (
              services.map((service) => {
                const selected = selectedServices.includes(service.id);
                return (
                  <article
                    key={service.id}
                    className={cn(
                      "bg-card rounded-3xl border-2 p-6 transition-[border-color,transform,box-shadow]",
                      selected
                        ? "border-ink shadow-float"
                        : "border-transparent hover:-translate-y-1",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleService(service)}
                      className="w-full text-left"
                      aria-pressed={selected}
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span>
                          <span className="text-lg font-extrabold">
                            {service.name}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-sm">
                            Selesai sekitar {service.durationHours} jam
                          </span>
                        </span>
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-full",
                            selected ? "bg-primary" : "bg-secondary",
                          )}
                        >
                          {selected && (
                            <Check className="size-4" aria-hidden="true" />
                          )}
                        </span>
                      </span>
                      <span className="font-display mt-7 block text-3xl">
                        {formatIdr(service.unitPrice)}
                        <span className="text-muted-foreground font-sans text-sm">
                          {" "}
                          / {service.unit === "KG" ? "kg" : "item"}
                        </span>
                      </span>
                      {service.minimumCharge > 0 && (
                        <span className="text-muted-foreground mt-1 block text-xs">
                          Minimum {formatIdr(service.minimumCharge)}
                        </span>
                      )}
                    </button>
                    {selected && (
                      <label className="mt-5 block border-t pt-4 text-sm font-bold">
                        Perkiraan {service.unit === "KG" ? "berat" : "jumlah"}{" "}
                        (bukan aktual)
                        <Input
                          className="mt-2"
                          type="number"
                          min="0.01"
                          step={service.unit === "KG" ? "0.1" : "1"}
                          value={quantities[service.id] ?? 1}
                          onChange={(event) =>
                            setQuantities((current) => ({
                              ...current,
                              [service.id]: Number(event.target.value),
                            }))
                          }
                          aria-label={`Perkiraan ${service.name}`}
                        />
                      </label>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {addresses.length > 0 && (
              <fieldset className="bg-card rounded-3xl p-6">
                <legend className="px-1 text-sm font-extrabold">
                  Alamat tersimpan
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setAddressId(address.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left",
                        addressId === address.id
                          ? "border-ink bg-primary/20"
                          : "bg-background",
                      )}
                    >
                      <span className="font-bold">{address.label}</span>
                      <span className="text-muted-foreground mt-1 block text-sm">
                        {address.addressText}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddressId("new")}
                    className={cn(
                      "rounded-2xl border p-4 text-left font-bold",
                      addressId === "new"
                        ? "border-ink bg-primary/20"
                        : "bg-background",
                    )}
                  >
                    + Alamat baru
                  </button>
                </div>
              </fieldset>
            )}

            {!selectedAddress && (
              <div className="bg-card grid gap-5 rounded-3xl p-6 sm:grid-cols-2">
                <Field label="Label alamat">
                  <Input
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                  />
                </Field>
                <Field label="Alamat lengkap" className="sm:col-span-2">
                  <Input
                    value={addressText}
                    onChange={(event) => setAddressText(event.target.value)}
                    placeholder="Nama jalan, nomor, kelurahan, kota"
                  />
                </Field>
                <LocationPin
                  latitude={latitude}
                  longitude={longitude}
                  setLatitude={setLatitude}
                  setLongitude={setLongitude}
                  mapboxToken={mapboxToken}
                  onLocate={useCurrentLocation}
                  message={locationMessage}
                />
                <Field label="Catatan alamat" className="sm:col-span-2">
                  <Input
                    value={addressNotes}
                    onChange={(event) => setAddressNotes(event.target.value)}
                    placeholder="Contoh: pagar hitam, titip satpam"
                  />
                </Field>
                <label className="flex min-h-11 items-center gap-3 text-sm font-bold sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                    className="size-5 accent-[var(--color-primary)]"
                  />
                  Simpan alamat ini untuk pesanan berikutnya
                </label>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.length === 0 ? (
              <EmptyState text="Belum ada slot pickup tersedia." />
            ) : (
              slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  className={cn(
                    "bg-card rounded-2xl border p-5 text-left transition-colors",
                    slotId === slot.id
                      ? "border-ink bg-primary/25"
                      : "hover:border-foreground/40",
                  )}
                >
                  <span className="font-display block text-2xl">
                    {formatJakartaDate(slot.startsAt)}
                  </span>
                  <span className="text-muted-foreground mt-2 block text-xs font-bold">
                    hingga {formatJakartaDate(slot.endsAt)} · sisa{" "}
                    {slot.remaining}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-card grid gap-6 rounded-3xl p-6 sm:grid-cols-2">
            <Field label="Preferensi deterjen">
              <Input
                value={detergentNote}
                onChange={(event) => setDetergentNote(event.target.value)}
                maxLength={100}
              />
            </Field>
            <Field label="Preferensi aroma">
              <Input
                value={fragranceNote}
                onChange={(event) => setFragranceNote(event.target.value)}
                maxLength={100}
              />
            </Field>
            <Field label="Alergi / sensitivitas" className="sm:col-span-2">
              <Input
                value={allergyNote}
                onChange={(event) => setAllergyNote(event.target.value)}
                maxLength={250}
                placeholder="Kosongkan bila tidak ada"
              />
            </Field>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-extrabold">
                Penanganan khusus
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Pisahkan warna putih",
                  "Bahan halus",
                  "Jangan diperas",
                  "Setrika uap",
                  "Gantung, jangan dilipat",
                ].map((value) => {
                  const selected = handlingNotes.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setHandlingNotes((current) =>
                          selected
                            ? current.filter((item) => item !== value)
                            : [...current, value],
                        )
                      }
                      className={cn(
                        "min-h-11 rounded-full border px-4 text-sm font-bold",
                        selected ? "border-ink bg-primary" : "bg-background",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="text-sm font-extrabold sm:col-span-2">
              Catatan khusus
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                rows={4}
                className="border-input bg-background focus:border-ring focus:ring-ring/25 mt-2 w-full rounded-2xl border p-4 text-sm outline-none focus:ring-4"
                placeholder="Contoh: satu kemeja putih mohon dipisah."
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-card rounded-3xl p-6 sm:p-8">
              <ReviewRow
                label="Layanan"
                value={selectedServiceRows
                  .map(
                    (service) =>
                      `${service.name} (${quantities[service.id] ?? 1} ${service.unit === "KG" ? "kg perkiraan" : "item"})`,
                  )
                  .join(", ")}
              />
              <ReviewRow
                label="Alamat pickup"
                value={selectedAddress?.addressText ?? addressText}
              />
              <ReviewRow
                label="Jadwal"
                value={
                  selectedSlot
                    ? `${formatJakartaDate(selectedSlot.startsAt)} – ${formatJakartaDate(selectedSlot.endsAt)}`
                    : "—"
                }
              />
              <ReviewRow
                label="Preferensi"
                value={[
                  detergentNote,
                  fragranceNote,
                  allergyNote,
                  ...handlingNotes,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
              <ReviewRow label="Catatan" value={notes || "—"} />
              <ReviewRow
                label="Estimasi sementara"
                value={formatIdr(estimate)}
                important
              />
            </div>
            <div className="bg-ink text-bone flex gap-4 rounded-3xl p-6">
              <Info
                className="text-primary mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="font-extrabold">Ini belum harga final.</p>
                <p className="text-bone/65 mt-1 text-sm leading-relaxed">
                  Berat aktual hanya dicatat Admin setelah laundry diterima.
                  Harga final baru tersedia setelah penimbangan dan invoice
                  diterbitkan.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {actionState.status === "error" && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mt-6 rounded-2xl p-4 text-sm font-bold"
        >
          {actionState.message}
        </p>
      )}

      <div className="sticky bottom-5 z-10 mt-8">
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            size="lg"
            className="shadow-float w-full"
            disabled={!canContinue}
            onClick={() => setStep((current) => current + 1)}
          >
            Lanjut <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            className="shadow-float w-full"
            disabled={pending || !canContinue}
          >
            {pending ? "Membuat pesanan…" : "Konfirmasi pesanan"}
          </Button>
        )}
      </div>
    </form>
  );
}

function StepHeading({ step }: { step: number }) {
  const title = [
    "Pilih layanan",
    "Tentukan titik pickup",
    "Pilih jadwal",
    "Atur preferensi",
    "Periksa pesanan",
  ][step];
  return (
    <div className="mb-8">
      <p className="text-muted-foreground text-xs font-extrabold tracking-[0.2em] uppercase">
        Langkah {step + 1} · {STEPS[step]}
      </p>
      <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">
        {title}
      </h1>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("text-sm font-extrabold", className)}>
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-card text-muted-foreground col-span-full rounded-3xl border border-dashed p-10 text-center text-sm">
      {text}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  important = false,
}: {
  label: string;
  value: string;
  important?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b py-5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={cn(
          "max-w-xl text-sm font-bold sm:text-right",
          important && "font-display text-3xl",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function LocationPin({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  mapboxToken,
  onLocate,
  message,
}: {
  latitude: string;
  longitude: string;
  setLatitude: (value: string) => void;
  setLongitude: (value: string) => void;
  mapboxToken?: string;
  onLocate: () => void;
  message: string;
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasCoordinates =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    latitude !== "" &&
    longitude !== "";
  const mapUrl =
    mapboxToken && hasCoordinates
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+111b16(${lng},${lat})/${lng},${lat},15/900x420@2x?access_token=${encodeURIComponent(mapboxToken)}`
      : undefined;

  return (
    <div className="sm:col-span-2">
      <div
        className="bg-secondary relative grid min-h-64 place-items-center overflow-hidden rounded-3xl bg-cover bg-center"
        style={mapUrl ? { backgroundImage: `url(${mapUrl})` } : undefined}
        role="img"
        aria-label={
          hasCoordinates
            ? `Pin pickup di ${latitude}, ${longitude}`
            : "Pin pickup belum ditentukan"
        }
      >
        <span className="bg-primary shadow-float grid size-14 place-items-center rounded-full">
          <MapPin className="size-6" aria-hidden="true" />
        </span>
        <span className="bg-card/90 absolute bottom-4 rounded-full px-4 py-2 text-xs font-bold backdrop-blur">
          Pin pickup · koordinat dapat diubah manual
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Latitude">
          <Input
            type="number"
            min="-90"
            max="90"
            step="0.000001"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            placeholder="-6.200000"
          />
        </Field>
        <Field label="Longitude">
          <Input
            type="number"
            min="-180"
            max="180"
            step="0.000001"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            placeholder="106.816666"
          />
        </Field>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onLocate}
      >
        <Crosshair className="size-4" aria-hidden="true" /> Gunakan lokasi saya
      </Button>
      {message && (
        <p className="text-muted-foreground mt-2 text-xs" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
