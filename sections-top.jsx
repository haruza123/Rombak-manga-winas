/* global React, Icon, Ph, relTime */
const { useState: useS1, useEffect: useE1, useRef: useR1 } = React;

/* ============================== NAVBAR ============================== */
function Navbar({ mode, character, onToggleMode, query, setQuery, onHome, onLibrary, onSearchFocus, manga, onOpen }) {
  const [scrolled, setScrolled] = useS1(false);
  const [open, setOpen] = useS1(false);
  const [notifOpen, setNotifOpen] = useS1(false);
  const [dismissed, setDismissed] = useS1(() => !!sessionStorage.getItem('winas:newbanner'));
  const notifRef = useR1(null);

  useE1(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup popover kalau klik di luar
  useE1(() => {
    if (!notifOpen) return;
    const out = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, [notifOpen]);

  const recent = dismissed ? [] :
    (manga || []).filter(m => typeof m.updated === 'number' && m.updated >= 0 && m.updated <= 3)
      .sort((a, b) => a.updated - b.updated);

  const dismissNotif = () => { setDismissed(true); setNotifOpen(false); sessionStorage.setItem('winas:newbanner', '1'); };

  const links = [
    ["#catalog", "Katalog"],
    ["#updates", "Update"],
    ["#oc", "Karakter"],
    ["#work-with-me", "Komisi"],
  ];
  const goSection = (e, h) => {
    if (onHome && document.querySelector(h) === null) { e.preventDefault(); onHome(); setTimeout(() => { const el = document.querySelector(h); if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" }); }, 80); }
  };

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="wrap nav-inner">
        <a href="#top" className="brand" onClick={(e) => { if (onHome) { e.preventDefault(); onHome(); } }}>
          <span className="brand-avatars" data-active={character}>
            <span className="brand-av brand-himori" />
            <span className="brand-av brand-ryou" />
          </span>
          <span className="brand-text">
            <b>Winas</b><span>Translation</span>
          </span>
        </a>

        <nav className="nav-links">
          {links.map(([h, t]) => <a key={h} href={h} onClick={(e) => goSection(e, h)}>{t}</a>)}
          <a href="#pustaka" className="nav-lib" onClick={(e) => { e.preventDefault(); onLibrary && onLibrary(); }}>
            <Icon name="spark" size={14} /> Pustaka
          </a>
        </nav>

        <div className="nav-tools">
          {/* Notifikasi update terbaru */}
          {recent.length > 0 && (
            <div className="nav-notif" ref={notifRef}>
              <button className="icon-btn nav-notif-btn" onClick={() => setNotifOpen(o => !o)}
                      aria-label={`${recent.length} manga baru diupdate`}>
                <Icon name="spark" size={18} />
                <span className="nav-notif-dot" />
              </button>
              {notifOpen && (
                <div className="nav-notif-popover">
                  <div className="nav-notif-head">
                    <span className="nav-notif-label">✨ Update Terbaru</span>
                    <button className="nav-notif-dismiss" onClick={dismissNotif}>Tandai dibaca</button>
                  </div>
                  {recent.map(m => (
                    <button key={m.title} className="nav-notif-item"
                            onClick={() => { onOpen && onOpen(m); setNotifOpen(false); }}>
                      <div className="nav-notif-cover">
                        <Ph label="" ratio="1/1" hue={m.hue} radius="4px" src={window.coverFor(m)} />
                      </div>
                      <div className="nav-notif-info">
                        <span className="nav-notif-title">{m.title}</span>
                        <span className="nav-notif-time">{relTime(m.updated)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <label className="search">
            <Icon name="search" size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)}
                   onFocus={() => onSearchFocus && onSearchFocus()}
                   placeholder="Cari judul…" aria-label="Cari judul manga" />
          </label>
          <button className="icon-btn" onClick={onToggleMode} aria-label="Ganti tema terang/gelap">
            <Icon name={mode === "dark" ? "sun" : "moon"} size={18} />
          </button>
          <button className="icon-btn mobile-only" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          <label className="search search-full">
            <Icon name="search" size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)}
                   onFocus={() => { setOpen(false); onSearchFocus && onSearchFocus(); }}
                   placeholder="Cari judul…" />
          </label>
          {links.map(([h, t]) => <a key={h} href={h} onClick={(e) => { setOpen(false); goSection(e, h); }}>{t}</a>)}
          <a href="#pustaka" onClick={(e) => { e.preventDefault(); setOpen(false); onLibrary && onLibrary(); }}>Pustaka</a>
        </div>
      )}
    </header>
  );
}

/* ============================== HERO ============================== */
function Hero({ showOc = true, mode = "dark", character = "ryou" }) {
  return (
    <section id="top" className="hero halftone-bg">
      <div className="hero-glow" />
      {/* speed lines */}
      <div className="speedlines" aria-hidden="true" />

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">{(window.WINAS_DATA && window.WINAS_DATA.translator && window.WINAS_DATA.translator.tagline) || "Manga Translator • JP → ID"}</span>
          <h1 className="hero-title">
            <span>Bikin cerita</span>
            <span className="hl">terasa hidup</span>
            <span>dalam Bahasa.</span>
          </h1>
          <p className="hero-tag">
            {(window.WINAS_DATA && window.WINAS_DATA.translator && window.WINAS_DATA.translator.heroDescription)
              || "Portfolio terjemahan manga—ritme dialog terjaga, istilah konsisten, typeset rapi."}
          </p>
          <div className="hero-cta">
            <a href="#catalog" className="btn btn-primary"><Icon name="book" size={17} /> Lihat Katalog</a>
            <a href="#work-with-me" className="btn btn-ghost"><Icon name="spark" size={17} /> Komisi / Kolaborasi</a>
          </div>
        </div>

        {/* OC duo — active character (by mode) is featured */}
        <div className="hero-oc" data-solo={!showOc} data-active={character}>
          <figure className="oc-fig oc-himori">
            <img src="assets/himori.png" alt="Himori Rinka" draggable="false" />
            <figcaption className="oc-tag" style={{ "--t": "oklch(.74 .14 16)" }}>Himori Rinka</figcaption>
          </figure>
          <figure className="oc-fig oc-ryou">
            <img src="assets/ryou.png" alt="Ryou Akatsune" draggable="false" />
            <figcaption className="oc-tag" style={{ "--t": "oklch(.62 .2 25)" }}>Ryou Akatsune</figcaption>
          </figure>
        </div>
      </div>

      <a href="#updates" className="scroll-hint">scroll ↓</a>
    </section>
  );
}

/* ============================== UPDATES (horizontal) ============================== */
function Updates({ updates, onOpen }) {
  const rail = useR1(null);
  const scroll = (dir) => {
    if (rail.current) rail.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  const NavArrows = () => (
    <>
      <button className="icon-btn" onClick={() => scroll(-1)} aria-label="Sebelumnya"><Icon name="left" /></button>
      <button className="icon-btn" onClick={() => scroll(1)} aria-label="Berikutnya"><Icon name="right" /></button>
    </>
  );
  return (
    <section id="updates" className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Fresh off the press</span>
            <h2 className="section-title">Pembaruan terbaru</h2>
            <p className="section-sub">Rilis chapter & revisi paling baru. Geser untuk lihat lebih banyak.</p>
          </div>
          {/* Desktop only — hidden on mobile */}
          <div className="rail-nav rail-nav-desktop">
            <NavArrows />
          </div>
        </div>

        <div className="rail" ref={rail}>
          {updates.map((u, i) => (
            <article key={i} className="upd-card" onClick={() => onOpen && onOpen(u.title)} role="button" tabIndex={0}
                     onKeyDown={(e) => { if (e.key === "Enter") onOpen && onOpen(u.title); }}>
              <div className="upd-cover">
                <Ph label={u.tag} ratio="16 / 10" hue={(i*47)%360} radius="0" src={window.WINAS_DATA.manga.find(m=>m.title===u.title) ? window.coverFor(window.WINAS_DATA.manga.find(m=>m.title===u.title)) : undefined} />
                <span className="upd-ch">{u.ch}</span>
              </div>
              <div className="upd-body">
                <span className="chip">{u.tag}</span>
                <h3>{u.title}</h3>
                <div className="upd-meta">
                  <span>{u.note}</span>
                  <span className="dot">•</span>
                  <span>{u.time}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile: arrows below the rail */}
        <div className="rail-nav rail-nav-mobile">
          <NavArrows />
        </div>
      </div>
    </section>
  );
}

/* ============================== SHORT TRANSLATIONS ============================== */
/* Gambar & link archive diatur via window.SHORT_TL dan window.SHORT_TL_ARCHIVE_URL di data.js */
const HUE_FALLBACKS = [20, 290, 200, 160, 50]; // warna placeholder kalau src kosong

function ShortTL() {
  const items = window.SHORT_TL || [];
  const archiveUrl = window.SHORT_TL_ARCHIVE_URL || "#";

  return (
    <section className="section short-sec">
      <div className="wrap short-grid">
        <div className="short-visual halftone-bg" aria-hidden="true">
          <div className="short-pages">
            {items.length > 0
              ? items.map((item, i) => (
                  <Ph
                    key={i}
                    label={item.label || String(i + 1) + "P"}
                    ratio="3/4"
                    src={item.src || undefined}
                    hue={HUE_FALLBACKS[i % HUE_FALLBACKS.length]}
                    style={item.title ? { title: item.title } : undefined}
                  />
                ))
              : /* belum ada data → tampil placeholder default */
                [20, 290, 200].map((hue, i) => (
                  <Ph key={i} label={String(i + 1) + "P"} ratio="3/4" hue={hue} />
                ))
            }
          </div>
        </div>
        <div className="short-copy">
          <span className="eyebrow">Bite-size</span>
          <h2 className="section-title">Short Translations</h2>
          <p className="section-sub" style={{ maxWidth: "40ch" }}>
            Terjemahan singkat <b>1–4 halaman</b> dari berbagai seri—oneshot, omake,
            dan potongan favorit. Cocok buat baca cepat.
          </p>
          <a className="btn btn-ghost" href={archiveUrl} target="_blank" rel="noopener">
            <Icon name="arrow" size={16} /> Lihat Archive
          </a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Navbar, Hero, Updates, ShortTL });
