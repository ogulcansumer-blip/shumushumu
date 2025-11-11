"use client";
 import React, { useEffect, useMemo, useRef, useState } from "react";
// --- Minimal, single-file React MVP for a TikTok×Instagram style duality feed ---
// Styling: TailwindCSS (assumed available in Canvas). No external UI libs required.
// Features:
// - Infinite card feed with left/right choices (tap/click or ← → keys)
// - Sticky top bar, story-style category strip, bottom tabbar
// - Progress ring that fills as gözle takip edilecek sayaç (choices)
// - Lightweight share modal & copy link
// - LocalStorage to persist quick stats
// - Simple metrics panel (CTR≈choice rate, share rate, retention proxy)
// - Hook points for real analytics (window.shumu.track)
//
// Deployment: this file can be the main page of a Next.js app (app/page.tsx) or CRA src/App.tsx.
// You can publish to Vercel/Netlify directly. See chat instructions below the canvas.

// ---------- Mock Data ----------
const STARTER_DUALITIES = [
  { id: "d1", a: "iPhone", b: "Samsung", imgA: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", imgB: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", cat: "Teknoloji" },
  { id: "d2", a: "Netflix", b: "YouTube", imgA: "https://images.unsplash.com/photo-1603201667141-839a8f3b26c1?w=800", imgB: "https://images.unsplash.com/photo-1551817958-20204c6a99cc?w=800", cat: "Eğlence" },
  { id: "d3", a: "PlayStation", b: "Xbox", imgA: "https://images.unsplash.com/photo-1605901309584-818e25960a8b?w=800", imgB: "https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?w=800", cat: "Oyun" },
  { id: "d4", a: "Kahve", b: "Çay", imgA: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800", imgB: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800", cat: "İçecek" },
  { id: "d5", a: "Burger King", b: "McDonald’s", imgA: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", imgB: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800", cat: "Fast Food" },
  { id: "d6", a: "Windows", b: "macOS", imgA: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800", imgB: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", cat: "Teknoloji" },
  { id: "d7", a: "Güneş Gözlüğü", b: "Şapka", imgA: "https://images.unsplash.com/photo-1518544801976-3e4e8b8f86f2?w=800", imgB: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?w=800", cat: "Stil" },
  { id: "d8", a: "Çikolata", b: "Dondurma", imgA: "https://images.unsplash.com/photo-1599785209792-9e3fbc1e2d6f?w=800", imgB: "https://images.unsplash.com/photo-1589712183315-9bc8187b9a47?w=800", cat: "Tatlı" },
  { id: "d9", a: "Pizza", b: "Hamburger", imgA: "https://images.unsplash.com/photo-1541745537413-b804c9e06c37?w=800", imgB: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800", cat: "Yemek" },
  { id: "d10", a: "Bira", b: "Şarap", imgA: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800", imgB: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800", cat: "İçecek" },
];

const CATEGORIES = ["Popüler", "Teknoloji", "Eğlence", "Oyun", "İçecek", "Fast Food", "Stil", "Tatlı", "Yemek"]; 

// --- Utility: simple event bus (analytics hook) ---
const track = (name, payload = {}) => {
  // Replace this with your real analytics provider
  try {
    if (typeof window !== "undefined") {
      window.shumu = window.shumu || { events: [] };
      window.shumu.events.push({ name, payload, t: Date.now() });
      // console.log("track:", name, payload);
    }
  } catch {}
};

// --- Progress Ring component ---
function ProgressRing({ value, max }) {
  const radius = 22;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clamped = Math.min(Math.max(value, 0), max);
  const strokeDashoffset = circumference - (clamped / max) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="opacity-20"
      />
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

// --- Main Card ---
function DualityCard({ item, onChoose }) {
  const [imgLoaded, setImgLoaded] = useState({ A: false, B: false });

  return (
    <div className="relative w-full aspect-[9/16] sm:aspect-[9/16] rounded-3xl overflow-hidden shadow-xl bg-black text-white">
      {/* overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60 z-10" />

      {/* images side-by-side */}
      <div className="grid grid-cols-2 h-full w-full">
        <div className="relative">
          <img src={item.imgA} alt={item.a} className="h-full w-full object-cover" onLoad={() => setImgLoaded(s=>({...s,A:true}))} />
          <button onClick={() => onChoose(item, 'A')} className="absolute inset-0 flex items-end justify-center pb-16 z-20 focus:outline-none">
            <span className="px-4 py-2 rounded-full backdrop-blur bg-white/15 border border-white/30 text-white text-lg font-semibold">
              {item.a}
            </span>
          </button>
        </div>
        <div className="relative">
          <img src={item.imgB} alt={item.b} className="h-full w-full object-cover" onLoad={() => setImgLoaded(s=>({...s,B:true}))} />
          <button onClick={() => onChoose(item, 'B')} className="absolute inset-0 flex items-end justify-center pb-16 z-20 focus:outline-none">
            <span className="px-4 py-2 rounded-full backdrop-blur bg-white/15 border border-white/30 text-white text-lg font-semibold">
              {item.b}
            </span>
          </button>
        </div>
      </div>

      {/* labels */}
      <div className="absolute top-4 left-4 z-30">
        <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs uppercase tracking-wider">{item.cat}</span>
      </div>
    </div>
  );
}

// --- Share Modal ---
function ShareModal({ open, onClose }) {
  const url = typeof window !== 'undefined' ? window.location.href : 'https://shumushumu.app';
  if (!open) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {}
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[90%] max-w-sm rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
        <h3 className="text-lg font-semibold mb-2">Paylaş</h3>
        <p className="text-sm mb-4">Arkadaşlarına gönder, ilk 1000 oyuncudan biri olsun.</p>
        <div className="flex gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-center">WhatsApp</a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-center">Telegram</a>
          <button onClick={copy} className="flex-1 px-3 py-2 rounded-xl bg-gray-900 text-white">Kopyala</button>
        </div>
        <button onClick={onClose} className="mt-4 w-full px-3 py-2 rounded-xl bg-gray-200">Kapat</button>
      </div>
    </div>
  );
}

// --- Metrics Panel ---
function Metrics({ stats }) {
  const { choices, shares, sessionStart, sessions, uniqueDays } = stats;
  const minutes = Math.max(1, (Date.now() - sessionStart) / 60000);
  const choicesPerMin = (choices / minutes).toFixed(1);
  const shareRate = choices ? (shares / choices).toFixed(2) : 0;
  const retention = Math.min(100, Math.round((sessions / Math.max(1, uniqueDays)) * 25));
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 p-3 flex items-center gap-4 text-sm text-gray-800">
      <div><span className="font-semibold">CPM</span><div className="text-xs">{choicesPerMin}/dk</div></div>
      <div><span className="font-semibold">Share Rate</span><div className="text-xs">{shareRate}</div></div>
      <div><span className="font-semibold">Retention~</span><div className="text-xs">{retention}%</div></div>
      <div><span className="font-semibold">Toplam</span><div className="text-xs">{choices} seçim</div></div>
    </div>
  );
}

export default function App() {
  const [feed, setFeed] = useState(STARTER_DUALITIES);
  const [cursor, setCursor] = useState(0);
  const [stats, setStats] = useState(() => {
    const prev = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shumu_stats') || 'null') : null;
    const todayKey = new Date().toISOString().slice(0,10);
    return prev || { choices: 0, shares: 0, sessionStart: Date.now(), sessions: 1, lastDayKey: todayKey, uniqueDays: 1 };
  });
  const [shareOpen, setShareOpen] = useState(false);

  const total = feed.length;
  const current = feed[cursor % total];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handleChoose(current, 'A');
      if (e.key === 'ArrowRight') handleChoose(current, 'B');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cursor, current]);

  useEffect(() => {
    try { localStorage.setItem('shumu_stats', JSON.stringify(stats)); } catch {}
  }, [stats]);

  useEffect(() => {
    // handle new day session increment
    const dayKey = new Date().toISOString().slice(0,10);
    setStats(s => {
      if (s.lastDayKey !== dayKey) {
        return { ...s, lastDayKey: dayKey, sessions: s.sessions + 1, uniqueDays: s.uniqueDays + 1 };
      }
      return s;
    });
  }, []);

  const handleChoose = (item, side) => {
    track('choose', { id: item.id, side, cat: item.cat });
    setStats(s => ({ ...s, choices: s.choices + 1 }));
    setCursor(c => c + 1);

    // (Hook) Unlock demo: every 10 choices show a toast
    if ((stats.choices + 1) % 10 === 0) {
      const unlocked = CATEGORIES[(stats.choices / 10) % CATEGORIES.length] || 'Yeni';
      // crude toast via alert (replace with nicer UI)
      setTimeout(() => {
        alert(`🎉 Yeni kategori açıldı: ${unlocked}`);
      }, 50);
      track('unlock_category', { name: unlocked });
    }

    // prefetch next image for snappy feel
    const next = feed[(cursor + 1) % total];
    if (next) {
      const i1 = new Image(); i1.src = next.imgA;
      const i2 = new Image(); i2.src = next.imgB;
    }
  };

  const openShare = () => { setShareOpen(true); setStats(s => ({ ...s, shares: s.shares + 1 })); track('share_click'); };

  const progressMax = 50; // arbitrary milestone for the ring

  // generate more feed endlessly by shuffling
  useEffect(() => {
    if (cursor > feed.length - 4) {
      const more = [...STARTER_DUALITIES].sort(() => Math.random() - 0.5);
      setFeed(f => [...f, ...more]);
    }
  }, [cursor]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 via-white to-white text-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/5">
        <div className="mx-auto max-w-md sm:max-w-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-black text-white grid place-items-center font-bold">Š</div>
            <div className="font-semibold tracking-tight">Shumushumu</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openShare} className="px-3 py-1.5 rounded-xl bg-black text-white text-sm">Paylaş</button>
            <div className="text-black">
              <ProgressRing value={stats.choices % progressMax} max={progressMax} />
            </div>
          </div>
        </div>
        {/* Stories / Categories */}
        <div className="mx-auto max-w-md sm:max-w-lg px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <div key={c} className="flex-shrink-0 px-3 py-1.5 rounded-2xl bg-gray-900 text-white text-xs">{c}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="mx-auto max-w-md sm:max-w-lg w-full px-4 py-4">
        <DualityCard item={current} onChoose={handleChoose} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => handleChoose(current, 'A')} className="py-3 rounded-2xl bg-gray-900 text-white font-medium">{current.a}</button>
          <button onClick={() => handleChoose(current, 'B')} className="py-3 rounded-2xl bg-gray-200 font-medium">{current.b}</button>
        </div>

        {/* Metrics */}
        <div className="mt-4">
          <Metrics stats={stats} />
        </div>
      </div>

      {/* Bottom Tabbar */}
      <div className="sticky bottom-0 z-40 border-t border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-md sm:max-w-lg px-8 py-2 flex items-center justify-between text-sm">
          <button className="px-2 py-1">Akış</button>
          <button className="px-2 py-1">Keşfet</button>
          <button className="px-2 py-1">İstatistik</button>
          <button className="px-2 py-1">Profil</button>
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
