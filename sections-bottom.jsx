/* global React, Icon, Ph, StatusBadge, relTime */
const { useState: useS2, useMemo: useM2 } = React;

/* ============================== CATALOG ============================== */
function MangaCard({ m, onOpen }) {
  const prog = window.getProgress(m);
  return (
    <article className="mcard" onClick={() => onOpen && onOpen(m)} role="button" tabIndex={0}
             onKeyDown={(e) => { if (e.key === "Enter") onOpen && onOpen(m); }}>
      <div className="mcard-cover">
        <Ph label="cover" ratio="3 / 4.2" hue={m.hue} radius="var(--r-md)" src={window.coverFor(m)} />
        <div className="mcard-badges">
          <StatusPill status={m.status} />
          {window.isNew(m) && <NewBadge />}
        </div>
        <span className="mcard-ch">{m.ch} ch</span>
        <div className="mcard-hover">
          <span className="btn btn-primary" style={{ padding: "9px 16px", fontSize: 13 }}>
            <Icon name="arrow" size={15} /> {prog ? "Lanjut" : "Baca"}
          </span>
        </div>
        {prog && (
          <div className="mcard-progress">
            <ProgressBar pct={prog.pct} label={`Ch. ${prog.lastCh} · ${prog.pct}%`} />
          </div>
        )}
      </div>
      <div className="mcard-info">
        <h3>{m.title}</h3>
        <div className="mcard-meta">
          <span className="mcard-series">{m.series}</span>
          <span className="mcard-upd">{relTime(m.updated)}</span>
        </div>
        <div className="mcard-genres">
          {m.genres.slice(0, 2).map(g => <span key={g} className="gtag">{g}</span>)}
        </div>
      </div>
    </article>
  );
}

function Catalog({ manga, query, onOpen }) {
  const [sort, setSort] = useS2("recent");
  const [shown, setShown] = useS2(8);
  const [genre, setGenre] = useS2("Semua");
  const [series, setSeries] = useS2("Semua");

  const genres = useM2(() => {
    const s = new Set();
    manga.forEach(m => m.genres.forEach(g => s.add(g)));
    return ["Semua", ...[...s].sort()];
  }, [manga]);

  const seriesList = useM2(() => {
    const s = new Set();
    manga.forEach(m => m.series && s.add(m.series));
    return ["Semua", ...[...s].sort()];
  }, [manga]);

  const filtered = useM2(() => {
    let list = manga.filter(m =>
      m.title.toLowerCase().includes(query.toLowerCase()) &&
      (genre === "Semua" || m.genres.includes(genre)) &&
      (series === "Semua" || m.series === series)
    );
    const by = {
      recent: (a, b) => a.updated - b.updated,
      oldest: (a, b) => b.updated - a.updated,
      az: (a, b) => a.title.localeCompare(b.title),
      za: (a, b) => b.title.localeCompare(a.title),
    };
    return [...list].sort(by[sort]);
  }, [manga, query, sort, genre, series]);

  const sorts = [["recent", "Terbaru"], ["az", "A–Z"], ["za", "Z–A"], ["oldest", "Terlama"]];

  return (
    <section id="catalog" className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">{manga.length} judul</span>
            <h2 className="section-title">Katalog Manga</h2>
            <p className="section-sub">Daftar lengkap seri yang sedang & sudah diterjemahkan.</p>
          </div>
          <div className="sort-pills">
            {sorts.map(([k, t]) => (
              <button key={k} className="sort-pill" data-on={sort === k} onClick={() => setSort(k)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="filterbar">
          <div className="filterbar-row">
            <span className="filter-label"><Icon name="book" size={13} /> Seri</span>
            <div className="filter-pills">
              {seriesList.map(s => {
                const count = s === "Semua" ? manga.length : manga.filter(m => m.series === s).length;
                return (
                  <button key={s} className="fpill fpill-series" data-on={series === s} onClick={() => { setSeries(s); setShown(8); }}>
                    {s}<span className="fpill-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="filterbar-divider" />
          <div className="filterbar-row">
            <span className="filter-label"><Icon name="spark" size={13} /> Genre</span>
            <div className="filter-pills">
              {genres.map(g => (
                <button key={g} className="fpill" data-on={genre === g} onClick={() => { setGenre(g); setShown(8); }}>{g}</button>
              ))}
            </div>
          </div>
          <div className="filterbar-foot">
            <span className="filter-count">{filtered.length} judul ditemukan</span>
            {(series !== "Semua" || genre !== "Semua" || query) && (
              <button className="filter-clear" onClick={() => { setSeries("Semua"); setGenre("Semua"); setShown(8); }}>
                <Icon name="close" size={13} /> Reset filter
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <Icon name="search" size={26} />
            <p>Tidak ada judul cocok dengan filter ini.</p>
          </div>
        ) : (
          <div className="mgrid">
            {filtered.slice(0, shown).map(m => <MangaCard key={m.title} m={m} onOpen={onOpen} />)}
          </div>
        )}

        {shown < filtered.length && (
          <div className="loadmore-wrap">
            <button className="btn btn-ghost" onClick={() => setShown(s => s + 8)}>
              Muat lebih banyak ({filtered.length - shown})
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================== OC BRANDING ============================== */
function OCBranding({ ocs, character }) {
  const imgs = ["assets/himori.png", "assets/ryou.png"];
  return (
    <section id="oc" className="section oc-sec">
      <div className="wrap">
        <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
          <div>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Identity</span>
            <h2 className="section-title">Karakter OC</h2>
            <p className="section-sub" style={{ margin: "8px auto 0" }}>Dua karakter yang jadi wajah Winas Translation.</p>
          </div>
        </div>
        <div className="oc-grid">
          {ocs.map((o, i) => (
            <article key={o.name} className={"ocb-card " + (i === 0 ? "ocb-pink" : "ocb-blue")} data-on={(character === "himori" && i === 0) || (character === "ryou" && i === 1)}>
              <div className="ocb-img">
                <img src={imgs[i]} alt={o.name} draggable="false" />
              </div>
              <div className="ocb-body">
                <span className="ocb-role">{o.role}</span>
                <h3>{o.name}</h3>
                <p>{o.bio}</p>
                <div className="ocb-tags">
                  {o.tags.map(t => <span key={t} className="chip">{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== WORK WITH ME ============================== */
function WorkWithMe() {
  const services = [
    { icon: "book", t: "Terjemahan", d: "JP → ID, ritme & nuansa terjaga." },
    { icon: "spark", t: "Typeset", d: "Lettering & SFX rapi sesuai panel." },
    { icon: "check", t: "QA Istilah", d: "Konsistensi nama & terminologi." },
  ];
  return (
    <section id="work-with-me" className="section work-sec">
      <div className="wrap work-grid">
        <div className="work-copy">
          <span className="eyebrow">Work with me</span>
          <h2 className="section-title">Komisi, kolaborasi<br />& proofreading</h2>
          <p className="section-sub" style={{ maxWidth: "44ch" }}>
            Terbuka untuk kolaborasi penerjemahan, typeset, dan QA istilah.
            Jelaskan judul, deadline, dan contoh halaman—saya balas dengan estimasi.
          </p>

          <div className="svc-list">
            {services.map(s => (
              <div key={s.t} className="svc">
                <span className="svc-ic"><Icon name={s.icon} size={18} /></span>
                <div><b>{s.t}</b><span>{s.d}</span></div>
              </div>
            ))}
          </div>

          <div className="work-cta">
            <a className="btn btn-primary" href="https://m.me/johan.winas.2025" target="_blank" rel="noopener">
              <Icon name="chat" size={16} /> Chat via Messenger
            </a>
            <a className="btn btn-ghost" href="https://www.facebook.com/johan.winas.2025/" target="_blank" rel="noopener">Facebook 1</a>
            <a className="btn btn-ghost" href="https://www.facebook.com/profile.php?id=61585006332289" target="_blank" rel="noopener">Facebook 2</a>
          </div>
        </div>

        <aside className="support-card">
          <div className="support-glow" aria-hidden="true" />
          <h3>Dukung karya ini</h3>
          <p>Traktir kopi biar TL tetap jalan & rilis makin rajin ☕</p>
          <a className="support-btn" href="https://saweria.co/JohanWinas" target="_blank" rel="noopener">
            <Icon name="coffee" size={18} /> <span>Saweria</span> <Icon name="arrow" size={16} />
          </a>
          <a className="support-btn" href="https://trakteer.id/oybmjkbtowieibzefkey" target="_blank" rel="noopener">
            <Icon name="spark" size={18} /> <span>Trakteer</span> <Icon name="arrow" size={16} />
          </a>
          <div className="support-note">Respon biasanya &lt; 24 jam</div>
        </aside>
      </div>
    </section>
  );
}

/* ============================== FOOTER ============================== */
function Footer({ character }) {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <span className="brand-avatars" data-active={character}>
            <span className="brand-av brand-himori" />
            <span className="brand-av brand-ryou" />
          </span>
          <div>
            <b>Winas Translation</b>
            <span>Portfolio penerjemah manga · Johan Winas TL</span>
          </div>
        </div>
        <div className="footer-links">
          <a href="https://www.facebook.com/johan.winas.2025/" target="_blank" rel="noopener">Facebook 1</a>
          <a href="https://www.facebook.com/profile.php?id=61585006332289" target="_blank" rel="noopener">Facebook 2</a>
          <a href="https://m.me/johan.winas.2025" target="_blank" rel="noopener">Messenger</a>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>© 2026 Rizqi W — Portfolio penerjemah.</span>
        <span>Dibuat dengan ☕ & 🌙</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Catalog, OCBranding, WorkWithMe, Footer });
