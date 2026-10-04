import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { useRevealAll } from "@/components/landing/use-reveal";
import {
  Hero, Frustration, HowItWorks, LiveTracking, WeightPrice, RealtimeStatus, Care, Services, Payment, Testimonials, FinalCta, Footer,
} from "@/components/landing/Sections";

const title = "TitipCuci — Kami jemput, kami cuci, kami balikin.";
const description = "Laundry antar-jemput dengan live tracking, berat aktual, harga final transparan, dan bukti jemput & antar. Nggak sempat nyuci? Titip aja.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useRevealAll();
  return (
    <main>
      <Navbar />
      <Hero />
      <Frustration />
      <HowItWorks />
      <LiveTracking />
      <WeightPrice />
      <RealtimeStatus />
      <Care />
      <Services />
      <Payment />
      <Testimonials />
      <FinalCta />
      <Footer />
    </main>
  );
}
