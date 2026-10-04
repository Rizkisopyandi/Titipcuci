import { createFileRoute, Link } from "@tanstack/react-router";
import { customerHead } from "@/lib/customer-meta";
import { customerOf } from "@/lib/admin/data";
import { ME } from "@/components/customer/Shell";
import { Eyebrow, Row } from "@/components/admin/kit";

export const Route = createFileRoute("/app/profile")({
  head: customerHead("Profil", "Profil akun TitipCuci kamu."),
  component: Profile,
});

function Profile() {
  const me = customerOf(ME);
  return (
    <>
      <div className="mb-10"><Eyebrow>Akun</Eyebrow><h1 className="mt-4 font-display text-5xl md:text-7xl">{me.name.split(" ")[0]} <em>{me.name.split(" ")[1]}.</em></h1></div>
      <div className="max-w-xl rounded-3xl bg-card p-6">
        <div className="divide-y divide-border"><Row k="Nama" v={me.name} /><Row k="Telepon" v={me.phone} /><Row k="Pelanggan sejak" v={me.since} /><Row k="Notifikasi" v="WhatsApp & push" /></div>
      </div>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold underline-offset-4 hover:underline">Kembali ke halaman TitipCuci</Link>
    </>
  );
}
