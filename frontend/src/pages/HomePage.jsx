import { meridians } from "@/data/meridians";
import { MeridianCard } from "@/components/MeridianCard";
import { SiteHeader } from "@/components/SiteHeader";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20">
        <section className="mb-14 sm:mb-20" data-testid="home-hero">
          <span className="font-mono text-[11px] tracking-[0.24em] uppercase text-[#A3B19B]">
            经络 · Jīng Luò
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#233127] mt-4 leading-[1.05]">
            Belajar pelafalan
            <br />
            <span className="italic text-[#4A6B53]">14 meridian</span> TCM.
          </h1>
          <p className="font-body text-base sm:text-lg text-[#233127]/75 max-w-2xl mt-6 leading-relaxed">
            Pilih sebuah meridian untuk mendengar pelafalan Mandarin dari setiap
            titik akupunktur. Sederhana, tenang, dan dibuat untuk pembelajar
            Traditional Chinese Medicine.
          </p>
        </section>

        <section aria-labelledby="meridian-list-title">
          <div className="flex items-baseline justify-between mb-6 sm:mb-8">
            <h2
              id="meridian-list-title"
              className="font-heading text-2xl sm:text-3xl font-medium text-[#233127]"
            >
              Daftar Meridian
            </h2>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#A3B19B]">
              {meridians.length} jalur
            </span>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            data-testid="meridian-grid"
          >
            {meridians.map((m) => (
              <MeridianCard key={m.code} meridian={m} />
            ))}
          </div>
        </section>

        <footer className="mt-24 pt-8 border-t border-[#E2E7DE]">
          <p className="font-body text-xs text-[#697A6D] leading-relaxed">
            Alat pembelajaran pelafalan · nomenklatur akupunktur standar
            (WHO). Audio dihasilkan dengan sintesis suara Mandarin bawaan
            peramban.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
