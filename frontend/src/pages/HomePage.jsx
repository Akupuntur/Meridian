import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { meridians } from "@/data/meridians";
import { searchAll } from "@/lib/search";
import { MeridianCard } from "@/components/MeridianCard";
import { PointCard } from "@/components/PointCard";
import { SiteHeader } from "@/components/SiteHeader";

export const HomePage = () => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const results = useMemo(
    () => (isSearching ? searchAll(trimmed) : null),
    [trimmed, isSearching]
  );

  return (
    <div className="min-h-screen relative z-10">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 sm:pt-20 pb-20">
        <section className="mb-10 sm:mb-14" data-testid="home-hero">
          <span className="hidden sm:inline-block font-mono text-[11px] tracking-[0.24em] uppercase text-[#A3B19B]">
            经络 · Jīng Luò
          </span>
          <h1
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#233127] sm:mt-4 leading-[1.05]"
            data-testid="home-title"
          >
            Mempelajari Pelafalan
            <br />
            <span className="italic text-[#4A6B53]">
              14 Meridian Akupunktur
            </span>
          </h1>
          <p
            className="font-body text-base sm:text-lg text-[#233127]/75 max-w-2xl mt-6 leading-relaxed"
            data-testid="home-description"
          >
            Dengarkan pelafalan Mandarin setiap titik akupunktur dan ikuti
            pengucapannya dengan mudah.
          </p>
          <p
            className="font-body text-[11px] sm:text-xs tracking-[0.18em] text-[#A3B19B] mt-8"
            data-testid="home-credit"
          >
            Lembaga Pendidikan Akupuntur Tseng Kai{" "}
            <span aria-hidden="true">·</span> Angkatan 98
          </p>
        </section>

        {/* Search */}
        <section aria-label="Pencarian" className="mb-10 sm:mb-12">
          <label htmlFor="meridian-search" className="sr-only">
            Cari meridian atau titik akupunktur
          </label>
          <div className="relative" data-testid="search-container">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3B19B] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="meridian-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari meridian atau titik akupunktur..."
              autoComplete="off"
              spellCheck={false}
              data-testid="search-input"
              className="w-full pl-11 pr-11 py-3.5 sm:py-4 rounded-full border border-[#E2E7DE] bg-white font-body text-base text-[#233127] placeholder:text-[#A3B19B] shadow-[0_2px_12px_rgba(74,107,83,0.04)] focus:outline-none focus:border-[#4A6B53]/50 focus:ring-4 focus:ring-[#4A6B53]/10 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Bersihkan pencarian"
                data-testid="search-clear"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-full text-[#697A6D] hover:bg-[#A3B19B]/15 hover:text-[#233127] transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        {isSearching ? (
          <SearchResultsView query={trimmed} results={results} />
        ) : (
          <MeridianGridView />
        )}

        <footer className="mt-24 pt-8 border-t border-[#E2E7DE] text-center">
          <p className="font-body text-sm sm:text-base text-[#233127]/80 leading-relaxed">
            Media pembelajaran pelafalan nama titik akupunktur dalam bahasa
            Mandarin.
          </p>
          <p
            className="font-body text-[11px] tracking-[0.14em] text-[#A3B19B] mt-4"
            data-testid="site-credit"
          >
            Created by Hartono <span aria-hidden="true">·</span> Angkatan 98
          </p>
        </footer>
      </main>
    </div>
  );
};

const MeridianGridView = () => (
  <section aria-labelledby="meridian-list-title">
    <div className="flex items-baseline justify-between mb-6 sm:mb-8">
      <h2
        id="meridian-list-title"
        className="font-heading text-2xl sm:text-3xl font-medium text-[#233127]"
      >
        Daftar Meridian
      </h2>
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
);

const SearchResultsView = ({ query, results }) => {
  const hasMeridians = results.meridians.length > 0;
  const hasPoints = results.points.length > 0;
  const totalCount = results.meridians.length + results.points.length;

  return (
    <section data-testid="search-results" aria-live="polite">
      <div className="flex items-baseline justify-between mb-6 sm:mb-8">
        <h2 className="font-heading text-2xl sm:text-3xl font-medium text-[#233127]">
          Hasil Pencarian
        </h2>
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#A3B19B]"
          data-testid="search-results-count"
        >
          {totalCount} hasil
        </span>
      </div>

      {!hasMeridians && !hasPoints && (
        <div
          data-testid="search-empty"
          className="rounded-2xl border border-dashed border-[#E2E7DE] bg-white/60 px-6 py-12 text-center"
        >
          <p className="font-body text-base text-[#233127]">
            Tidak ada hasil untuk{" "}
            <span className="italic text-[#4A6B53]">“{query}”</span>.
          </p>
          <p className="font-body text-sm text-[#697A6D] mt-2">
            Coba masukkan kode meridian (LU, ST, DU), kode titik (LU7, ST36),
            Hanzi (列缺), Pinyin (Lie Que), atau nama Indonesia.
          </p>
        </div>
      )}

      {hasMeridians && (
        <div className="mb-10 sm:mb-14">
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <h3 className="font-heading text-lg sm:text-xl text-[#233127]">
              Meridian
            </h3>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#A3B19B]">
              {results.meridians.length}
            </span>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            data-testid="search-meridian-results"
          >
            {results.meridians.map((m) => (
              <MeridianCard key={m.code} meridian={m} />
            ))}
          </div>
        </div>
      )}

      {hasPoints && (
        <div>
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <h3 className="font-heading text-lg sm:text-xl text-[#233127]">
              Titik Akupunktur
            </h3>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#A3B19B]">
              {results.points.length}
            </span>
          </div>
          <div className="space-y-4" data-testid="search-point-results">
            {results.points.map(({ meridian, point }) => (
              <div key={`${meridian.code}-${point.num}`}>
                <p className="font-body text-[11px] tracking-[0.18em] uppercase text-[#A3B19B] mb-2 pl-1">
                  {meridian.indonesian}
                </p>
                <PointCard meridianCode={meridian.code} point={point} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HomePage;
