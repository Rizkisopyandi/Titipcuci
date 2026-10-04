import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { customerOf, clock, RESOLUTIONS, type ComplaintStatus } from "@/lib/admin/data";
import { PageHead, Pill, Panel, Chip, Btn, Row } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/complaints")({
  head: adminHead("Complaints", "Kelola komplain customer TitipCuci: tinjau bukti, tindak lanjut, dan resolusi."),
  component: Complaints,
});

const tone: Record<ComplaintStatus, "danger" | "warn" | "info" | "lime" | "muted"> = { OPEN: "danger", REVIEWING: "info", ACTION_REQUIRED: "warn", RESOLVED: "lime", CLOSED: "muted" };
const NEXT: ComplaintStatus[] = ["OPEN", "REVIEWING", "ACTION_REQUIRED", "RESOLVED", "CLOSED"];

function Complaints() {
  const { complaints, updateComplaint } = useAdmin();
  const [sel, setSel] = useState(complaints[0]?.id);
  const [res, setRes] = useState("");
  const c = complaints.find((x) => x.id === sel)!;
  return (
    <>
      <PageHead eyebrow="Layanan customer" title={<>Kom<em>plain.</em></>} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2">
          {complaints.map((x) => (
            <button key={x.id} onClick={() => { setSel(x.id); setRes(""); }} className={cn("w-full rounded-3xl border p-4 text-left transition-all", sel === x.id ? "border-ink bg-card shadow-float" : "border-border bg-card/60 hover:bg-card")}>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">{x.id} · {x.orderId}</span><Pill tone={tone[x.status]}>{x.status}</Pill></div>
              <p className="mt-2 font-semibold">{x.type}</p>
              <p className="text-sm text-muted-foreground">{customerOf(x.customerId).name}</p>
            </button>
          ))}
        </div>
        {c && (
          <Panel key={c.id} className="animate-slidein">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-semibold text-muted-foreground">{c.id}</p><p className="font-display text-4xl">{c.type}</p></div>
              <Pill tone={tone[c.status]}>{c.status}</Pill>
            </div>
            <p className="mt-4 rounded-2xl bg-secondary p-4 text-sm">“{c.detail}”</p>
            <div className="mt-4 divide-y divide-border">
              <Row k="Customer" v={customerOf(c.customerId).name} />
              <Row k="Pesanan" v={<Link to="/admin/orders/$id" params={{ id: c.orderId }} className="underline">{c.orderId}</Link>} />
              <Row k="Bukti" v={<span className="inline-flex items-center gap-1"><Camera className="h-4 w-4" />{c.evidence} foto</span>} />
              {c.resolution && <Row k="Resolusi" v={c.resolution} strong />}
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold">Ubah status</p>
              <div className="flex flex-wrap gap-2">{NEXT.map((s) => <Chip key={s} on={c.status === s} onClick={() => updateComplaint(c.id, { status: s }, `Status → ${s}`)}>{s}</Chip>)}</div>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold">Resolusi</p>
              <div className="flex flex-wrap gap-2">{RESOLUTIONS.map((r) => <Chip key={r} on={res === r} onClick={() => setRes(r)}>{r}</Chip>)}</div>
              <Btn className="mt-3" disabled={!res} onClick={() => updateComplaint(c.id, { resolution: res, status: "RESOLVED" }, `Resolusi: ${res}`)}>Terapkan resolusi</Btn>
            </div>
            <ol className="mt-8 space-y-3 border-l border-border pl-5">
              {[...c.timeline].reverse().map((t, i) => (
                <li key={i} className="relative"><span className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full", i === 0 ? "bg-primary" : "bg-ink")} /><p className="text-sm">{t.note}</p><p className="text-xs text-muted-foreground">{clock(t.at)}</p></li>
              ))}
            </ol>
          </Panel>
        )}
      </div>
    </>
  );
}
