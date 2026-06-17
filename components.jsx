/* global React */
const { useState, useEffect, useRef } = React;

/* ---------- inline icons (simple geometric, no faux-illustration) ---------- */
function Icon({ name, size = 18, stroke = 1.8 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "sun": return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case "moon": return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
    case "arrow": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "left": return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case "right": return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case "menu": return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "close": return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "spark": return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>;
    case "book": return <svg {...p}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M9 3v18"/></svg>;
    case "coffee": return <svg {...p}><path d="M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 3v2M11 3v2"/></svg>;
    case "chat": return <svg {...p}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>;
    case "check": return <svg {...p}><path d="M4 12l5 5L20 6"/></svg>;
    case "share": return <svg {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
    case "link": return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    default: return null;
  }
}

/* ---------- striped placeholder (or real image when src given; falls back on error) ---------- */
function Ph({ label, ratio = "3 / 4", radius = "var(--r-md)", hue, style, src }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <div className="ph ph-img" style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
        <img src={src} alt={label || ""} draggable="false" loading="lazy" onError={() => setFailed(true)} />
      </div>
    );
  }
  const tint = hue != null
    ? { background: `linear-gradient(160deg, oklch(0.62 0.14 ${hue} / .35), oklch(0.5 0.12 ${(hue+40)%360} / .12))` }
    : {};
  return (
    <div className="ph" style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
      <div style={{ position: "absolute", inset: 0, ...tint }} />
      <span className="ph-label" style={{ position: "relative" }}>{label}</span>
    </div>
  );
}

/* ---------- status dot ---------- */
function StatusBadge({ status }) {
  const map = {
    Ongoing: { c: "oklch(0.72 0.16 150)", t: "Ongoing" },
    Completed: { c: "oklch(0.7 0.15 250)", t: "Tamat" },
    Tamat: { c: "oklch(0.7 0.15 250)", t: "Tamat" },
    Hiatus: { c: "oklch(0.78 0.15 70)", t: "Hiatus" },
  };
  const s = map[status] || map.Ongoing;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)",
      fontSize: 10.5, letterSpacing: ".05em", color: "var(--text-2)" }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: s.c, boxShadow: `0 0 8px ${s.c}` }} />
      {s.t}
    </span>
  );
}

function relTime(days) {
  if (days < 1) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days/7)} minggu lalu`;
  return `${Math.floor(days/30)} bulan lalu`;
}

/* ---------- status pill (prominent, for covers) ---------- */
function StatusPill({ status }) {
  const map = {
    Ongoing:   { c: "oklch(0.72 0.16 150)", t: "Ongoing" },
    Completed: { c: "oklch(0.7 0.15 250)", t: "Tamat" },
    Tamat:     { c: "oklch(0.7 0.15 250)", t: "Tamat" },
    Hiatus:    { c: "oklch(0.78 0.15 70)", t: "Hiatus" },
  };
  const s = map[status] || map.Ongoing;
  return (
    <span className="status-pill" style={{ "--sc": s.c }}>
      <span className="status-dot" />{s.t}
    </span>
  );
}

/* ---------- "Baru" badge ---------- */
function NewBadge() {
  return <span className="new-badge">BARU</span>;
}

/* ---------- progress bar ---------- */
function ProgressBar({ pct, label }) {
  return (
    <div className="progress" title={label || `${pct}%`}>
      <div className="progress-fill" style={{ width: pct + "%" }} />
    </div>
  );
}

Object.assign(window, { Icon, Ph, StatusBadge, StatusPill, NewBadge, ProgressBar, relTime, useState, useEffect, useRef });
