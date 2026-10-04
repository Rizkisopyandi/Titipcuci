import { useEffect, useState } from "react";
import { ArrowRight, Check, MapPin, ShieldCheck, Camera, ScanLine, MessageCircle, PackageCheck, Scale, QrCode, Landmark, Lock, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import folding from "@/assets/folding.jpg";
import pkg from "@/assets/package.jpg";
import washing from "@/assets/washing.jpg";
import bedding from "@/assets/bedding.jpg";
import dryclean from "@/assets/dryclean.jpg";
import { Logo } from "./Navbar";

const Eyebrow = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] ${light ? "text-bone/70" : "text-muted-foreground"}`}>
    <span className="h-px w-8 bg-current" /> {children}
  </p>
);

/* ---------------- HERO ---------------- */
export function Hero() {
  return (
    <section className="relative h-screen min-h-[760px] overflow-hidden bg-ink text-bone">
      <img src={hero} alt="Petugas TitipCuci menjemput tas laundry di depan rumah pelanggan" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute left-8 top-28 hidden items-center gap-2 rounded-full border border-bone/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-bone/80 lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live · Jakarta Selatan
      </div>

      <div className="relative mx-auto flex h-full max-w-[1320px] flex-col justify-end px-8 pb-24">
        <div className="grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.92] animate-rise">
              Nggak sempat nyuci?
              <br />
              <em className="text-primary">Titip aja.</em>
            </h1>
            <p className="mt-6 text-xl font-semibold tracking-tight animate-rise [animation-delay:.25s]">Kami jemput, kami cuci, kami balikin.</p>
          </div>
          <div className="animate-rise [animation-delay:.45s]">
            <p className="max-w-md text-base leading-relaxed text-bone/80">
              Jadwalkan penjemputan dari rumah, pantau prosesnya, lihat berat aktual dan harga final, lalu terima kembali laundry kamu dalam kondisi bersih dan rapi.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a id="mulai" href="/app/new" className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
                Jemput Laundry Saya <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#cara-kerja" className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-4 font-semibold transition-colors hover:bg-bone/10">
                Lihat Cara Kerjanya
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60">
        <span className="flex h-9 w-5 justify-center rounded-full border border-bone/40 pt-2">
          <span className="h-1.5 w-1 rounded-full bg-bone animate-scrolldot" />
        </span>
        Scroll
      </div>
    </section>
  );
}

/* ---------------- FRUSTRATION ---------------- */
const thoughts = [
  { q: "Kurirnya sudah sampai mana?", c: "left-[4%] top-[6%] rotate-[-3deg]" },
  { q: "Beratnya benar segini?", c: "right-[6%] top-[14%] rotate-[2deg]" },
  { q: "Sudah selesai belum?", c: "left-[18%] bottom-[18%] rotate-[2deg]" },
  { q: "Laundry saya aman nggak?", c: "right-[12%] bottom-[8%] rotate-[-2deg]" },
];
export function Frustration() {
  return (
    <section className="relative overflow-hidden py-40">
      <div className="relative mx-auto h-[560px] max-w-[1320px] px-8">
        {thoughts.map((t, i) => (
          <p key={t.q} data-reveal style={{ transitionDelay: `${i * 120}ms` }} className={`reveal absolute ${t.c} font-display text-3xl italic text-muted-foreground/70 md:text-5xl`}>
            <span className="animate-drift inline-block" style={{ animationDelay: `${i}s` }}>“{t.q}”</span>
          </p>
        ))}
        <div data-reveal className="reveal absolute inset-0 m-auto flex max-w-3xl flex-col items-center justify-center text-center">
          <h2 className="font-display text-5xl leading-[1.02] md:text-7xl">Laundry seharusnya nggak bikin kamu terus bertanya.</h2>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            TitipCuci bikin seluruh perjalanan laundry lebih transparan, dari dijemput sampai balik ke tangan kamu.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
function MiniBooking() {
  return (
    <div className="w-72 rounded-2xl bg-card p-5 shadow-float">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Jadwal jemput</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {["08–10", "13–15", "18–20"].map((s, i) => (
          <span key={s} className={`rounded-lg py-2 ${i === 1 ? "bg-ink text-bone" : "bg-secondary"}`}>{s}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-secondary p-3 text-sm">
        <MapPin className="h-4 w-4 text-sage" /> Jl. Kemang Raya No. 12
      </div>
    </div>
  );
}

const steps = [
  { n: "01", t: "Titip", d: "Pilih layanan, atur jadwal jemput, dan pin lokasi kamu di peta. Selesai dalam satu menit.", img: null as string | null, ui: <MiniBooking /> },
  { n: "02", t: "Kami Jemput", d: "Petugas TitipCuci datang ke lokasi kamu, memverifikasi tas, dan mengirim bukti penjemputan.", img: hero },
  { n: "03", t: "Kami Beresin", d: "Diterima, diverifikasi, ditimbang, dicuci, dicek kualitasnya, lalu dikemas rapi.", img: washing },
  { n: "04", t: "Balik Bersih", d: "Pantau pengantaran langsung dan terima laundry kamu kembali — bersih, wangi, terlipat.", img: pkg },
];
export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-ink py-32 text-bone">
      <div className="mx-auto max-w-[1320px] px-8">
        <div className="mb-24 grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <Eyebrow light>Cara kerja</Eyebrow>
            <h2 className="font-display text-6xl leading-none md:text-8xl">Empat langkah.<br /><em className="text-primary">Nol drama.</em></h2>
          </div>
          <p className="max-w-md text-lg text-bone/70 md:justify-self-end">Dari tombol pertama sampai baju terlipat di lemari — semua bisa kamu lihat.</p>
        </div>
        <div className="space-y-32">
          {steps.map((s, i) => (
            <div key={s.n} className={`grid items-center gap-12 md:grid-cols-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div data-reveal className={`reveal md:col-span-5 ${i % 2 ? "md:col-start-8" : ""}`}>
                <span className="font-display text-[9rem] leading-none text-bone/10">{s.n}</span>
                <h3 className="-mt-12 font-display text-5xl md:text-6xl">{s.t}</h3>
                <p className="mt-5 max-w-sm text-lg leading-relaxed text-bone/70">{s.d}</p>
              </div>
              <div className={`md:col-span-7 ${i % 2 ? "md:col-start-1 md:row-start-1" : ""}`}>
                {s.img ? (
                  <div data-reveal className="reveal-img relative aspect-[16/10] overflow-hidden rounded-2xl">
                    <img src={s.img} alt={s.t} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.5s] hover:scale-105" />
                    {s.n === "02" && (
                      <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl bg-card p-3 pr-5 text-sm text-card-foreground shadow-float">
                        <Camera className="h-4 w-4 text-sage" />
                        <div><p className="font-semibold">Bukti jemput terkirim</p><p className="text-xs text-muted-foreground">1 tas · segel #TC-4821 · 14:07</p></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div data-reveal className="reveal relative grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl bg-ink-soft">
                    <div className="animate-floaty">{s.ui}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- LIVE TRACKING ---------------- */
export function LiveTracking() {
  const [eta, setEta] = useState(12);
  useEffect(() => {
    const id = setInterval(() => setEta((e) => (e <= 6 ? 12 : e - 1)), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="py-36">
      <div className="mx-auto grid max-w-[1320px] items-center gap-16 px-8 lg:grid-cols-[1fr_1.25fr]">
        <div data-reveal className="reveal">
          <Eyebrow>Live tracking</Eyebrow>
          <h2 className="font-display text-6xl leading-[0.98] md:text-7xl">Nggak perlu nanya, <em>“kurirnya di mana?”</em></h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">Pantau perjalanan petugas saat penjemputan dan pengantaran langsung dari TitipCuci.</p>
        </div>
        <div data-reveal className="reveal relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-map shadow-float">
            <svg viewBox="0 0 500 400" className="absolute inset-0 h-full w-full" aria-hidden>
              <g stroke="var(--map-road)" strokeWidth="14" fill="none" strokeLinecap="round">
                <path d="M-10 80 L520 120" /><path d="M-10 260 L520 230" /><path d="M120 -10 L160 420" /><path d="M360 -10 L330 420" /><path d="M-10 360 L240 300 L520 340" />
              </g>
              <g stroke="var(--map-road)" strokeWidth="5" fill="none" opacity=".8">
                <path d="M40 -10 L60 420" /><path d="M250 -10 L240 420" /><path d="M440 -10 L460 420" /><path d="M-10 180 L520 170" />
              </g>
              <rect x="180" y="130" width="40" height="30" rx="4" fill="var(--sage)" opacity=".18" />
              <rect x="390" y="270" width="60" height="40" rx="4" fill="var(--sage)" opacity=".18" />
              <path className="route-draw" d="M70 330 L140 290 L150 180 L245 172 L340 166 L355 110" stroke="var(--ink)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* courier */}
            <div className="absolute left-[29%] top-[44%] animate-drift">
              <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
              <span className="relative grid h-10 w-10 place-items-center rounded-full border-4 border-card bg-ink text-xs font-bold text-primary">TC</span>
            </div>
            {/* customer pin */}
            <div className="absolute left-[69%] top-[20%] -translate-x-1/2 -translate-y-full">
              <div className="rounded-full bg-primary p-2 shadow-float"><MapPin className="h-5 w-5" /></div>
            </div>
          </div>
          {/* status card */}
          <div className="absolute -bottom-10 -left-6 w-80 rounded-2xl bg-card p-5 shadow-float md:-left-12">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" /><span className="relative h-2.5 w-2.5 rounded-full bg-primary" /></span>
              Menuju lokasi kamu
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div><p className="text-xs text-muted-foreground">Estimasi tiba</p><p className="font-display text-5xl leading-none tabular-nums">{eta}<span className="text-xl"> mnt</span></p></div>
              <div className="text-right text-xs text-muted-foreground"><p>Jendela jemput</p><p className="font-semibold text-foreground">13.00 – 15.00</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
              <span className="text-muted-foreground">#TC-4821 · Cuci + Setrika</span><span className="font-semibold">Pak Rudi · B 4821 TC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WEIGHT & PRICE ---------------- */
export function WeightPrice() {
  return (
    <section id="harga" className="bg-secondary py-36">
      <div className="mx-auto grid max-w-[1320px] items-center gap-16 px-8 lg:grid-cols-2">
        <div data-reveal className="reveal-img relative aspect-[4/5] overflow-hidden rounded-3xl">
          <img src={folding} alt="Kemeja putih dilipat rapi" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute right-6 top-6 rounded-2xl bg-ink p-5 text-bone shadow-float">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-bone/60"><Scale className="h-3.5 w-3.5" /> Berat aktual</p>
            <p className="font-display text-6xl leading-none text-primary">5.7<span className="text-2xl text-bone"> kg</span></p>
          </div>
        </div>
        <div>
          <div data-reveal className="reveal">
            <Eyebrow>Transparansi harga</Eyebrow>
            <h2 className="font-display text-6xl leading-none md:text-7xl">Tahu beratnya.<br /><em>Tahu harganya.</em></h2>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">Berat aktual dicatat setelah laundry diterima oleh petugas. Harga final dihitung dari data yang benar-benar tercatat.</p>
          </div>
          <div data-reveal className="reveal mt-12 max-w-md rounded-2xl bg-card p-7 shadow-float">
            <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Invoice #TC-4821</span><span>3 Okt 2026</span></div>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between"><dt>Berat aktual</dt><dd className="font-semibold">5.7 kg</dd></div>
              <div className="flex justify-between"><dt>Cuci + Setrika <span className="block text-xs text-muted-foreground">5.7 × Rp10.000</span></dt><dd className="font-semibold">Rp57.000</dd></div>
              <div className="flex justify-between"><dt>Pickup & Delivery</dt><dd className="font-semibold">Rp5.000</dd></div>
            </dl>
            <div className="mt-6 flex items-end justify-between border-t border-dashed border-border pt-6">
              <div><p className="text-xs text-muted-foreground">Total</p><p className="font-display text-5xl leading-none">Rp62.000</p></div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">Menunggu pembayaran</span>
            </div>
            <a href="#" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 font-semibold text-bone transition-transform hover:scale-[1.02]">Bayar Sekarang <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- REALTIME STATUS ---------------- */
const timeline = [
  ["Pesanan dikonfirmasi", "09.12", "done"], ["Laundry dijemput", "14.07", "done"], ["Laundry diterima", "14.52", "done"], ["Pembayaran berhasil", "15.03", "done"],
  ["Sedang dicuci", "Sekarang", "active"], ["Quality check", "", "todo"], ["Siap dikirim", "", "todo"], ["Dalam pengantaran", "", "todo"], ["Selesai", "", "todo"],
] as const;
export function RealtimeStatus() {
  return (
    <section className="py-36">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-8 lg:grid-cols-[1fr_1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start" data-reveal>
          <div className="reveal" data-reveal>
            <Eyebrow>Status realtime</Eyebrow>
            <h2 className="font-display text-6xl leading-none md:text-8xl">Kamu tahu apa yang sedang terjadi.</h2>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">Setiap tahap tercatat dengan waktu. Tanpa perlu chat “kak, sudah selesai belum?”</p>
          </div>
        </div>
        <div data-reveal className="relative rounded-3xl bg-card p-10 shadow-float">
          <div className="absolute bottom-[calc(10rem)] left-[3.2rem] top-12 w-px bg-border" />
          <div className="timeline-fill absolute left-[3.2rem] top-12 h-[46%] w-px bg-ink" />
          <ol className="relative space-y-7">
            {timeline.map(([label, time, st]) => (
              <li key={label} className="flex items-center gap-6">
                <span className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full ${st === "done" ? "bg-ink text-primary" : st === "active" ? "bg-primary" : "border-2 border-border bg-card"}`}>
                  {st === "done" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  {st === "active" && <><span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" /><span className="h-2 w-2 rounded-full bg-ink" /></>}
                </span>
                <span className={`flex-1 ${st === "todo" ? "text-muted-foreground" : "font-semibold"} ${st === "active" ? "font-display text-3xl font-normal" : "text-base"}`}>{label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{time}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CARE ---------------- */
const care = [
  [ScanLine, "Verifikasi tas", "Setiap tas disegel dan dipindai saat dijemput."],
  [ShieldCheck, "Cek kondisi", "Noda atau kerusakan dicatat sebelum dicuci."],
  [Camera, "Bukti jemput", "Foto + waktu dikirim ke kamu."],
  [PackageCheck, "Quality control", "Dicek ulang sebelum dikemas."],
  [MapPin, "Bukti antar", "Foto serah terima di depan pintu."],
  [MessageCircle, "Bantuan komplain", "Lapor dari pesanan, ditangani manusia."],
] as const;
export function Care() {
  return (
    <section className="overflow-hidden bg-ink py-36 text-bone">
      <div className="mx-auto max-w-[1320px] px-8">
        <div data-reveal className="reveal max-w-4xl">
          <Eyebrow light>Dijaga penuh</Eyebrow>
          <h2 className="font-display text-6xl leading-[0.98] md:text-8xl">Bukan sekadar dicuci. <em className="text-primary">Dijaga dari jemput sampai kembali.</em></h2>
        </div>
        <div className="mt-24 grid gap-12 lg:grid-cols-12">
          <div data-reveal className="reveal-img relative aspect-[4/5] overflow-hidden rounded-3xl lg:col-span-5">
            <img src={pkg} alt="Paket laundry tersegel rapi" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-card p-4 text-card-foreground">
              <div className="flex items-center justify-between text-xs"><span className="font-semibold">Bukti antar · #TC-4821</span><span className="text-muted-foreground">Sab, 18.42</span></div>
              <p className="mt-1 text-xs text-muted-foreground">Diterima oleh: Nadia · Segel utuh ✓</p>
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7 divide-y divide-bone/10 border-y border-bone/10">
            {care.map(([Icon, t, d], i) => (
              <li key={t} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="reveal group flex items-center gap-6 py-6 transition-colors">
                <span className="w-8 text-xs tabular-nums text-bone/40">0{i + 1}</span>
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl transition-transform group-hover:translate-x-2">{t}</span>
                <span className="ml-auto hidden max-w-[220px] text-right text-sm text-bone/60 md:block">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES ---------------- */
const services = [
  { t: "Cuci Kering", p: "Rp7.000/kg", img: washing, d: "Dicuci, dikeringkan, dilipat." },
  { t: "Cuci + Setrika", p: "Rp10.000/kg", img: folding, d: "Paling populer. Siap pakai." },
  { t: "Dry Cleaning", p: "mulai Rp25.000", img: dryclean, d: "Jas, kebaya, bahan halus." },
  { t: "Household & Bedding", p: "mulai Rp20.000", img: bedding, d: "Bed cover, sprei, gorden." },
];
export function Services() {
  return (
    <section id="layanan" className="py-36">
      <div className="mx-auto max-w-[1320px] px-8">
        <div data-reveal className="reveal mb-16 flex flex-wrap items-end justify-between gap-6">
          <div><Eyebrow>Layanan</Eyebrow><h2 className="font-display text-6xl leading-none md:text-7xl">Untuk semua yang<br />ada di lemarimu.</h2></div>
          <p className="max-w-xs text-muted-foreground">Harga transparan. Minimum 3 kg untuk layanan kiloan.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {services.map((s, i) => (
            <a key={s.t} href="#" data-reveal style={{ transitionDelay: `${i * 100}ms` }} className={`reveal group relative block overflow-hidden rounded-2xl ${i % 2 ? "md:mt-16" : ""}`}>
              <div className="aspect-[3/4] overflow-hidden">
                <img src={s.img} alt={s.t} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-bone">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{s.p}</p>
                <h3 className="mt-1 font-display text-3xl">{s.t}</h3>
                <p className="mt-1 max-h-0 overflow-hidden text-sm text-bone/70 transition-all duration-500 group-hover:max-h-10">{s.d}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PAYMENT ---------------- */
export function Payment() {
  return (
    <section className="bg-secondary py-36">
      <div className="mx-auto grid max-w-[1320px] items-center gap-16 px-8 lg:grid-cols-2">
        <div data-reveal className="reveal">
          <Eyebrow>Pembayaran</Eyebrow>
          <h2 className="font-display text-7xl leading-none md:text-8xl">Bayar <em>tanpa ribet.</em></h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">QRIS atau Virtual Account. Status pesanan langsung berubah begitu pembayaran masuk — nggak perlu kirim bukti transfer.</p>
          <p className="mt-8 flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-sage" /> Pembayaran terenkripsi & diproses mitra resmi berlisensi</p>
        </div>
        <div data-reveal className="reveal mx-auto w-full max-w-md rounded-3xl bg-card p-7 shadow-float">
          <div className="flex items-center justify-between"><Logo /><span className="text-xs text-muted-foreground">#TC-4821</span></div>
          <div className="mt-8"><p className="text-xs text-muted-foreground">Total tagihan</p><p className="font-display text-6xl leading-none">Rp62.000</p></div>
          <div className="mt-8 space-y-3">
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-ink p-4">
              <QrCode className="h-5 w-5" /><span className="flex-1 font-semibold">QRIS</span><span className="grid h-5 w-5 place-items-center rounded-full bg-ink"><span className="h-2 w-2 rounded-full bg-primary" /></span>
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-ink">
              <Landmark className="h-5 w-5" /><span className="flex-1 font-semibold">Virtual Account</span><span className="text-xs text-muted-foreground">BCA · Mandiri · BNI · BRI</span>
            </label>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-secondary p-4 text-sm">
            <span className="h-4 w-4 rounded-full border-2 border-ink border-t-transparent animate-spin-slow" />
            <span>Menunggu pembayaran · <span className="tabular-nums font-semibold">14:52</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
const quotes = [
  { q: "Pertama kali saya tahu berat laundry saya sebelum bayar. Nggak ada lagi ‘kok jadi segini?’", n: "Nadia P.", r: "Kemang · 14 pesanan" },
  { q: "Kurirnya kelihatan di peta, datang tepat di jendela waktunya. Hal kecil, tapi bikin tenang.", n: "Arief S.", r: "Tebet · 9 pesanan" },
  { q: "Kemeja kerja balik rapi, wangi, dan ada foto bukti antar. Sudah langganan tiap minggu.", n: "Maya L.", r: "BSD · 22 pesanan" },
];
export function Testimonials() {
  return (
    <section className="py-36">
      <div className="mx-auto max-w-[1320px] px-8">
        <div data-reveal className="reveal mb-16 flex items-center gap-3">
          <div className="flex text-ink">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
          <p className="text-sm font-semibold">4.9 dari 2.400+ ulasan pelanggan</p>
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          {quotes.map((t, i) => (
            <figure key={t.n} data-reveal style={{ transitionDelay: `${i * 120}ms` }} className="reveal border-t border-ink pt-8">
              <blockquote className="font-display text-3xl leading-tight">“{t.q}”</blockquote>
              <figcaption className="mt-8 text-sm"><span className="font-semibold">{t.n}</span> <span className="text-muted-foreground">· {t.r}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA + FOOTER ---------------- */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink text-bone">
      <img src={washing} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40 animate-kenburns" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div data-reveal className="reveal relative mx-auto flex min-h-[80vh] max-w-[1320px] flex-col items-center justify-center px-8 py-32 text-center">
        <h2 className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.92]">Kotor dititip.<br /><em className="text-primary">Baliknya bersih.</em></h2>
        <p className="mt-8 text-xl font-semibold">Kami jemput, kami cuci, kami balikin.</p>
        <a href="#" className="group mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-5 text-lg font-semibold text-primary-foreground transition-transform hover:scale-[1.04]">
          Jemput Laundry Saya <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink py-14 text-bone">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-8 border-t border-bone/10 px-8 pt-10 text-sm text-bone/60">
        <div className="text-bone"><Logo /></div>
        <div className="flex gap-8">{["Layanan", "Cara Kerja", "Harga", "Lacak Pesanan", "Bantuan"].map((l) => <a key={l} href="#" className="hover:text-bone">{l}</a>)}</div>
        <p>© 2026 TitipCuci · Jakarta</p>
      </div>
    </footer>
  );
}
