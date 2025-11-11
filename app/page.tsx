"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ——— Demo Data (dengeli, hatasız görseller) ———
type Duo = {
  id: string;
  a: string;
  b: string;
  imgA: string;
  imgB: string;
  cat?: string;
};

const STARTER: Duo[] = [
  {
    id: "d1",
    a: "iPhone",
    b: "Samsung",
    imgA:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=80&auto=format&fit=crop",
    imgB:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80&auto=format&fit=crop",
    cat: "Teknoloji",
  },
  {
    id: "d2",
    a: "Netflix",
    b: "YouTube",
    imgA:
      "https://images.unsplash.com/photo-1603210616741-839a8f3b26c2?w=1200&q=80&auto=format&fit=crop",
    imgB:
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80&auto=format&fit=crop",
    cat: "Eğlence",
  },
  {
    id: "d3",
    a: "PlayStation",
    b: "Xbox",
    imgA:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=80&auto=format&fit=crop",
    imgB:
      "https://images.unsplash.com/photo-1580237082931-46dc03a44458?w=1200&q=80&auto=format&fit=crop",
    cat: "Oyun",
  },
  {
    id: "d4",
    a: "Kahve",
    b: "Çay",
    imgA:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1200&q=80&auto=format&fit=crop",
    imgB:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1200&q=80&auto=format&fit=crop",
    cat: "İçecek",
  },
  {
    id: "d5",
    a: "Burger",
    b: "Pizza",
    imgA:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?w=1200&q=80&auto=format&fit=crop",
    imgB:
      "https://images.unsplash.com/photo-1548365328-9f547fb09530?w=1200&q=80&auto=format&fit=crop",
    cat: "Yemek",
  },
];

// ——— Küçük yardımcılar ———
function cn(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}
function useKey(onLeft: () => void, onRight: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") onLeft();
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") onRight();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onLeft, onRight]);
}

// ——— Ana UI ———
export default function Page() {
  const [i, setI] = useState(0);
  const [votes, setVotes] = useState<{ [id: string]: "a" | "b" }>({});
  const duo = STARTER[i % STARTER.length];

  // İlerleme çemberi için basit yüzde
  const progress = Math.min(100, Math.round(((Object.keys(votes).length || 0) / 20) * 100));

  // Görselleri önceden yükle (daha pürüzsüz)
  useEffect(() => {
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    preload(duo.imgA);
    preload(duo.imgB);
    const next = STARTER[(i + 1) % STARTER.length];
    preload(next.imgA);
    preload(next.imgB);
  }, [i, duo.imgA, duo.imgB]);

  const choose = (side: "a" | "b") => {
    setVotes((v) => ({ ...v, [duo.id]: side }));
    setI((x) => x + 1);
  };

  useKey(
    () => choose("a"), // ← / A
    () => choose("b"), // → / D
  );

  return (
    <div className="min-h-dvh bg-grid text-zinc-100 selection:bg-emerald-400/30">
      {/* Üst bar */}
      <header className="mx-auto w-full max-w-6xl px-4 py-4 flex items-center gap-3">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800">
          ∞
        </span>
        <h1 className="text-lg font-semibold tracking-tight">
          Shumushumu · <span className="text-zinc-300">Sonsuz Akış</span>
        </h1>

        <div className="ml-auto flex items-center gap-3">
          {/* ilerleme */}
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
                className="fill-none stroke-zinc-800"
                strokeWidth="4"
              />
              <path
                d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
                className="fill-none stroke-emerald-400 transition-[stroke-dasharray] duration-500"
                strokeWidth="4"
                strokeDasharray={`${(progress / 100) * 100} 100`}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[10px] text-zinc-300">
              {progress}%
            </span>
          </div>

          <button
            onClick={() => {
              setVotes({});
              setI(0);
            }}
            className="rounded-full bg-zinc-800 px-3 py-1 text-sm hover:bg-zinc-700"
          >
            Sıfırla
          </button>
        </div>
      </header>

      {/* Kart alanı */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 md:grid-cols-2">
        <ChoiceCard
          label={duo.a}
          img={duo.imgA}
          onChoose={() => choose("a")}
          hint="← / A"
        />
        <ChoiceCard
          label={duo.b}
          img={duo.imgB}
          onChoose={() => choose("b")}
          hint="→ / D"
        />
      </main>

      {/* Alt hızlı metrik */}
      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-zinc-400">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
          Hızlı İstatistik (lokal): {Object.keys(votes).length} seçim · Son kart:{" "}
          <span className="text-zinc-300">{duo.cat ?? "—"}</span>
        </div>
      </footer>
    </div>
  );
}

// ——— Kart Bileşeni ———
function ChoiceCard({
  img,
  label,
  hint,
  onChoose,
}: {
  img: string;
  label: string;
  hint: string;
  onChoose: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-zinc-800/80",
        "bg-zinc-950/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,.04)]",
      )}
    >
      {/* Görsel */}
      <div className="aspect-[4/5] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="eager"
          draggable={false}
          onClick={() => btnRef.current?.click()}
        />
      </div>

      {/* Alt bar */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-zinc-950/80 p-2 backdrop-blur">
        <span className="pointer-events-auto rounded-md bg-zinc-900 px-2 py-1 text-sm">
          {label}
        </span>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 md:inline">
            {hint}
          </span>
          <button
            ref={btnRef}
            onClick={onChoose}
            className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
            aria-label={`${label} seç`}
          >
            Seç
          </button>
        </div>
      </div>
    </article>
  );
}
