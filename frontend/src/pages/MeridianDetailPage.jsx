import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getMeridianByCode } from "@/data/meridians";
import { PointCard } from "@/components/PointCard";
import { SiteHeader } from "@/components/SiteHeader";
import { AudioButton } from "@/components/AudioButton";

export const MeridianDetailPage = () => {
  const { code } = useParams();
  const meridian = getMeridianByCode(code);

  // Always open a Meridian detail page at the very top — including when
  // navigating between two different Meridian routes (`code` changes).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [code]);

  if (!meridian) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen relative z-10">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-24">
        <Link
          to="/"
          data-testid="back-to-home"
          className="inline-flex items-center gap-2 text-sm font-body text-[#4A6B53] hover:text-[#233127] transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke daftar meridian</span>
        </Link>

        <header className="mb-12 sm:mb-16" data-testid="meridian-header">
          <span className="font-mono text-[11px] tracking-[0.24em] uppercase text-[#A3B19B]">
            {meridian.code} · {meridian.english} · {meridian.points.length} titik
          </span>
          <h1
            className="font-pinyin text-3xl sm:text-5xl font-semibold text-[#233127] mt-4 leading-[1.1] tracking-tight"
            data-testid="meridian-indonesian"
          >
            {meridian.indonesian}
          </h1>
          <p
            className="font-pinyin text-xl sm:text-2xl font-medium tracking-tight text-[#4A6B53] mt-3 leading-snug"
            data-testid="meridian-pinyin"
          >
            {meridian.pinyin}
          </p>
          <p
            className="font-hanzi text-3xl sm:text-4xl text-[#233127] mt-3 leading-tight"
            lang="zh-Hans"
            data-testid="meridian-hanzi"
          >
            {meridian.hanzi}
          </p>
          <div className="mt-6">
            <AudioButton
              text={meridian.hanzi}
              label={`Putar pelafalan nama meridian ${meridian.hanzi}`}
              testId="meridian-audio"
            />
          </div>
        </header>

        <section aria-labelledby="points-title">
          <div className="flex items-baseline justify-between mb-6">
            <h2
              id="points-title"
              className="font-pinyin text-xl sm:text-2xl font-semibold text-[#233127]"
            >
              Titik Akupunktur
            </h2>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#A3B19B]">
              {meridian.points.length} titik
            </span>
          </div>

          <div className="space-y-4" data-testid="points-list">
            {meridian.points.map((p) => (
              <PointCard
                key={`${meridian.code}-${p.num}`}
                meridianCode={meridian.code}
                point={p}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MeridianDetailPage;
