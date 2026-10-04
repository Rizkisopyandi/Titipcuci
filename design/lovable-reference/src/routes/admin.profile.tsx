import { createFileRoute, Link } from "@tanstack/react-router";
import { adminHead } from "@/lib/admin/meta";
import { PageHead, Panel, Row, Pill } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/profile")({
  head: adminHead("Profile", "Profil dan shift admin TitipCuci."),
  component: Profile,
});

function Profile() {
  return (
    <>
      <PageHead eyebrow="Akun" title={<>Rudi <em>Hartono.</em></>} />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Akun">
          <div className="divide-y divide-border">
            <Row k="Peran" v={<Pill tone="ink">ADMIN</Pill>} />
            <Row k="Tugas" v="Pickup · Penerimaan · Timbang · Proses · QC · Antar · Komplain" />
            <Row k="Outlet" v="Kemang, Jakarta Selatan" />
            <Row k="Kendaraan" v="B 4821 TC" />
          </div>
        </Panel>
        <Panel title="Shift hari ini">
          <div className="divide-y divide-border">
            <Row k="Mulai" v="07.00" />
            <Row k="Selesai" v="17.00" />
            <Row k="Berbagi lokasi" v="Hanya saat pickup/antar aktif" />
          </div>
          <Link to="/" className="mt-6 inline-block text-sm font-semibold underline-offset-4 hover:underline">Ke halaman TitipCuci</Link>
        </Panel>
      </div>
    </>
  );
}
