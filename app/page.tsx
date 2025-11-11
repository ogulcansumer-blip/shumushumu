"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/** ---------- Types ---------- */
type Duality = {
  id: string;
  a: string;
  b: string;
  imgA: string;
  imgB: string;
  cat?: string;
};

type Choice = {
  id: string;
  pick: "a" | "b";
  ts: number;
};

/** ---------- Mock Data (dilediğin gibi genişletebilirsin) ---------- */
const STARTER_DUALITIES: Duality[] = [
  {
    id: "d1",
    a: "iPhone",
    b: "Samsung",
    imgA:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1511707171634-5f897ffad3f0?w=1200&q=60",
    cat: "Teknoloji",
  },
  {
    id: "d2",
    a: "Netflix",
    b: "YouTube",
    imgA:
      "https://images.unsplash.com/photo-1603210616741-839a8fb326c1?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1558189758-202e046a99ce?w=1200&q=60",
    cat: "Eğlence",
  },
  {
    id: "d3",
    a: "PlayStation",
    b: "Xbox",
    imgA:
      "https://images.unsplash.com/photo-1569913893642-81be259e608a?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1613056166150-b34df433d6bc?w=1200&q=60",
    cat: "Oyun",
  },
  {
    id: "d4",
    a: "Kahve",
    b: "Çay",
    imgA:
      "https://images.unsplash.com/photo-1442512595331-e89e7385317a?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1523906385463-6e24ef26f89f?w=1200&q=60",
    cat: "İçecek",
  },
  {
    id: "d5",
    a: "Burger King",
    b: "McDonald's",
    imgA:
      "https://images.unsplash.com/photo-1550645612-83fe9d2b6a4f?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1551782450-17144c3a09a0?w=1200&q=60",
    cat: "Fast Food",
  },
  {
    id: "d6",
    a: "Windows",
    b: "macOS",
    imgA:
      "https://images.unsplash.com/photo-1541807084-5c52b36da4ef?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=60",
    cat: "Teknoloji",
  },
  {
    id: "d7",
    a: "Güneş Gözlüğü",
    b: "Şapka",
    imgA:
      "https://images.unsplash.com/photo-1518544801976-3e4e08b8f6f2?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1490111778993-d98654ec60f7?w=1200&q=60",
    cat: "Stil",
  },
  {
    id: "d8",
    a: "Çikolata",
    b: "Dondurma",
    imgA:
      "https://images.unsplash.com/photo-1599782598929-3e9fc1eb2d6f?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1587912813387-9a7f2f03f057?w=1200&q=60",
    cat: "Tatlı",
  },
  {
    id: "d9",
    a: "Pizza",
    b: "Hamburger",
    imgA:
      "https://images.unsplash.com/photo-1541775435713-804a9e0cc327?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?w=1200&q=60",
    cat: "Yemek",
  },
  {
    id: "d10",
    a: "Bira",
    b: "Şarap",
    imgA:
      "https://images.unsplash.com/photo-1511083638710-841d10984471?w=1200&q=60",
    imgB:
      "https://images.unsplash.com/photo-1543807903-1ac2ee7c2e4c?w=1200&q=60",
    cat: "İçecek",
  },
];

/** ---------- Küçük yardımcılar ---------- */
const STORAGE_KEY = "shumu.choices.v1";

function loadChoices(): Choice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Choice[]) : [];
  } catch {
    return [];
  }
}

function saveChoices(list: Choice[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

/** ---------- Ana Bileşen ---------- */
export default function Page() {
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [ready, setReady] = useState(false);
  const current = STARTER_DUALITIES[idx];

  // İlk yüklemede localStorage'dan seçimleri çek
  useEffect(() => {
    const loaded = loadChoices();
    setChoices(loaded);
    setReady(true);
  }, []);

  // Seçimler değiştikçe kaydet
  useEffect(() => {
    if (ready) saveChoices(choices);
  }, [choices, ready]);

  // Klavye ile yönlendirme (← → ve A/D)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) choose("a");
      if (["ArrowRight", "d", "D"].includes(e.key)) choose("b");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, current]);

  function choose(pick: "a" | "b") {
    if (!current) return;
    setChoices((prev) => [...prev, { id: current.id, pick, ts: Date.now() }]);
    setIdx((i) => Math.min(i + 1, STARTER_DUALITIES.length)); // sona gelince stop
  }

  function goBack() {
    if (idx === 0) return;
    setIdx((i) => i - 1);
    setChoices((prev) => prev.slice(0, -1));
  }

  function resetAll() {
    setIdx(0);
    setChoices([]);
    saveChoices([]);
  }

  const progress = Math.min(
    100,
    Math.round((idx / STARTER_DUALITIES.length) * 100)
  );

  const metrics = useMemo(() => {
    const m = new Map<string, number>();
    choices.forEach((c) => {
      const d = STARTER_DUALITIES.find((x) => x.id === c.id);
      const key = d?.cat ?? "Genel";
      const prev = m.get(key) ?? 0;
      // a = -1, b = +1 gibi küçük bir eğim
      m.set(key, prev + (c.pick === "b" ? 1 : -1));
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [choices]);

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♾️</span>
            <h1 className="text-lg font-semibold tracking-wide">
              Shumushumu · Sonsuz Akış
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
              title="Geri (⌫)"
            >
              Geri
            </button>
            <button
              onClick={resetAll}
              className="rounded-xl bg-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-white"
              title="Sıfırla"
            >
              Sıfırla
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-900">
          <div
            className="h-1 bg-emerald-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2">
        {/* Sol Kart */}
        <Card
          label={current?.a ?? "Bitti"}
          img={current?.imgA}
          onPick={() => choose("a")}
          disabled={!current}
          side="left"
        />

        {/* Sağ Kart */}
        <Card
          label={current?.b ?? "Bitti"}
          img={current?.imgB}
          onPick={() => choose("b")}
          disabled={!current}
          side="right"
        />
      </section>

      {/* Bottom metrics */}
      <footer className="mx-auto max-w-4xl px-4 pb-10">
        <h2 className="mb-2 text-sm font-medium text-zinc-400">
          Hızlı İstatistik (lokal)
        </h2>
        {choices.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz bir seçim yapılmadı.</p>
        ) : (
          <ul className="flex flex-wrap gap-2 text-sm">
            {metrics.map(([cat, score]) => (
              <li
                key={cat}
                className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300"
                title="Pozitif = B seçimi yönünde eğilim"
              >
                {cat}: {score > 0 ? `+${score}` : score}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-zinc-500">
          İpucu: Klavye ile seçebilirsin — Sol (← / A), Sağ (→ / D)
        </p>
      </footer>
    </main>
  );
}

/** ---------- Kart bileşeni ---------- */
function Card({
  label,
  img,
  onPick,
  disabled,
  side,
}: {
  label: string;
  img?: string;
  onPick: () => void;
  disabled: boolean;
  side: "left" | "right";
}) {
  return (
    <button
      disabled={disabled}
      onClick={onPick}
      className={[
        "group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border",
        "border-zinc-800 bg-zinc-900/40 ring-emerald-400/40 transition",
        "hover:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
      ].join(" ")}
      aria-label={`${side === "left" ? "Sol" : "Sağ"} seçimi: ${label}`}
    >
      {/* Görsel */}
      {img ? (
        // Next/Image yerine sade <img> — config ile uğraşmadan hızlı deploy
        <img
          src={img}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}

      {/* Alt degrade + etiket */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-black/60 px-3 py-2 backdrop-blur">
          <span className="text-lg font-semibold">{label}</span>
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
            {side === "left" ? "← / A" : "→ / D"}
          </kbd>
        </div>
      </div>
    </button>
  );
}
