/* global React, Icon, Ph, StatusBadge, relTime, getDetail, getChapters */
const { useState: useSR, useEffect: useER, useRef: useRR, useMemo: useMR } = React;

/* ── getRelated: series dulu, tambah genre kalau kurang ── */
function getRelated(m, all, limit = 4) {
  const ns = (s) => (s || '').toLowerCase().trim();
  const sameSeries = all.filter(x =>
    x.title !== m.title && ns(x.series) && ns(m.series) && ns(x.series) === ns(m.series)
  );
  if (sameSeries.length >= limit) return sameSeries.slice(0, limit);
  const taken = new Set([m.title, ...sameSeries.map(x => x.title)]);
  const mG = (m.genres || []).map(g => g.toLowerCase());
  const byGenre = all.filter(x =>
    !taken.has(x.title) && (x.genres || []).some(g => mG.includes(g.toLowerCase()))
  );
  return [...sameSeries, ...byGenre].slice(0, limit);
}

/* ── RelatedManga: grid kartu manga terkait ── */
function RelatedManga({ current, manga, onOpen, inReader }) {
  if (!onOpen) return null;
  const related = getRelated(current, manga || []);
  if (!related.length) return null;
  return (
    <div className={inReader ? 'rd-related related' : 'related'}>
      <h3 className="related-head">Manga Terkait</h3>
      <div className="related-grid">
        {related.map(rm => (
          <button key={rm.title} className="related-card"
                  onClick={() => { onOpen(rm); window.scrollTo(0, 0); }}>
            <div className="related-thumb">
              <Ph label="cover" ratio="3/4" hue={rm.hue} radius="0" src={window.coverFor(rm)} />
            </div>
            <span className="related-name">{rm.title}</span>
            <span className="related-series">{rm.series}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* read-state helpers (localStorage) */
const readKey = (t) => "winas:read:" + t;
const posKey = (t, n) => "winas:pos:" + t + ":" + n;
function getRead(title) {
  try { return new Set(JSON.parse(localStorage.getItem(readKey(title)) || "[]")); }
  catch { return new Set(); }
}
function markRead(title, n) {
  const s = getRead(title); s.add(n);
  localStorage.setItem(readKey(title), JSON.stringify([...s]));
}

/* ============================== MANGA DETAIL ============================== */
function MangaDetail({ m, onBack, onRead, onOpenManga }) {
  const d = useMR(() => getDetail(m), [m]);
  const chapters = useMR(() => getChapters(m), [m]);
  const [order, setOrder] = useSR("new");
  const [q, setQ] = useSR("");
  const [bookmarked, setBookmarked] = useSR(() => window.isBookmarked(m.title));
  const [readSet, setReadSet] = useSR(() => getRead(m.title));
  const [copied, setCopied] = useSR(false);

  useER(() => { setBookmarked(window.isBookmarked(m.title)); }, [m]);
  const toggleBm = () => { setBookmarked(window.toggleBookmark(m.title)); };

  const handleShare = () => {
    const base = window.location.origin + window.location.pathname;
    const url = base + '#manga=' + encodeURIComponent(m.title);
    const doShare = () => {
      if (navigator.share) { navigator.share({ title: m.title + ' — Winas Translation', url }).catch(() => {}); return; }
      const copy = (u) => {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(u).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); }).catch(() => fallback(u));
        } else { fallback(u); }
      };
      const fallback = (u) => {
        const el = document.createElement('textarea');
        el.value = u; el.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(el); el.focus(); el.select();
        try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
        document.body.removeChild(el);
      };
      copy(url);
    };
    doShare();
  };

  useER(() => { window.scrollTo(0, 0); }, [m]);

  const list = useMR(() => {
    let l = chapters.filter(c => String(c.n).includes(q.trim()));
    return order === "new" ? l : [...l].reverse();
  }, [chapters, order, q]);

  const firstCh = chapters.length > 0 ? chapters[chapters.length - 1].n : null;
  const lastReadN = [...readSet].sort((a, b) => b - a)[0];

  return (
    <div className="detail">
      <div className="detail-backdrop" style={{ background: `linear-gradient(160deg, oklch(.6 .15 ${m.hue} / .5), transparent 70%)` }} />
      <div className="wrap detail-top">
        <button className="back-btn" onClick={onBack}><Icon name="left" size={18} /> Katalog</button>
      </div>

      <div className="wrap detail-grid">
        <aside className="detail-side">
          <div className="detail-cover">
            <Ph label="cover" ratio="3 / 4.3" hue={m.hue} radius="var(--r-lg)" src={window.coverFor(m)} />
          </div>
          {firstCh != null && (
            <button className="btn btn-primary detail-read" onClick={() => onRead(firstCh)}>
              <Icon name="book" size={17} /> Baca dari Ch. {firstCh}
            </button>
          )}
          {lastReadN && (
            <button className="btn btn-ghost detail-read" onClick={() => onRead(lastReadN)}>
              <Icon name="arrow" size={16} /> Lanjut Ch. {lastReadN}
            </button>
          )}
          <button className={"bookmark " + (bookmarked ? "on" : "")} onClick={toggleBm}>
            <Icon name={bookmarked ? "check" : "spark"} size={16} /> {bookmarked ? "Tersimpan di Pustaka" : "Simpan ke daftar"}
          </button>
          <button className={"share-btn " + (copied ? "copied" : "")} onClick={handleShare}>
            <Icon name={copied ? "check" : "share"} size={16} /> {copied ? "Link disalin!" : "Bagikan manga"}
          </button>
        </aside>

        <div className="detail-main">
          <span className="eyebrow">{d.altTitle}</span>
          <h1 className="detail-title">{m.title}</h1>

          <div className="detail-meta">
            {d.rating && <span className="rating"><Icon name="spark" size={14} /> {d.rating}</span>}
            <StatusBadge status={m.status} />
            {d.year && <span className="dim">{d.year}</span>}
            {d.views && <span className="dim">{d.views} views</span>}
            <span className="dim">{m.ch} chapter</span>
          </div>

          <div className="detail-genres">
            {m.genres.map(g => <span key={g} className="gtag">{g}</span>)}
          </div>

          <p className="detail-syn">{d.synopsis}</p>

          <div className="detail-credits">
            <div>
              <span>Artist</span>
              {d.artistUrl
                ? <a className="credit-link" href={d.artistUrl} target="_blank" rel="noopener">{d.artist} <Icon name="arrow" size={12} /></a>
                : <b>{d.artist}</b>}
            </div>
            <div><span>Seri</span><b>{m.series}</b></div>
            <div><span>Terjemahan</span><b>Johan Winas TL</b></div>
          </div>

          {/* chapter list */}
          <div className="ch-head">
            <h2>Daftar Chapter</h2>
            <div className="ch-tools">
              <label className="search ch-search">
                <Icon name="search" size={15} />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="No. chapter…" />
              </label>
              <div className="sort-pills">
                <button className="sort-pill" data-on={order === "new"} onClick={() => setOrder("new")}>Terbaru</button>
                <button className="sort-pill" data-on={order === "old"} onClick={() => setOrder("old")}>Terlama</button>
              </div>
            </div>
          </div>

          <div className="ch-list">
            {list.map(c => {
              const read = readSet.has(c.n);
              return (
                <button key={c.n} className={"ch-row " + (read ? "read" : "")} onClick={() => onRead(c.n)}>
                  <span className="ch-n">{String(c.n).padStart(2, "0")}</span>
                  <span className="ch-info">
                    <b>Chapter {c.n}{c.title ? " — " + c.title : ""}</b>
                    <span>{c.pages} halaman · {relTime(c.days)}</span>
                  </span>
                  {read && <span className="ch-readtag">dibaca</span>}
                  <Icon name="right" size={16} />
                </button>
              );
            })}
          </div>

          <RelatedManga current={m} manga={window.WINAS_DATA?.manga || []} onOpen={onOpenManga} />
        </div>
      </div>
    </div>
  );
}

/* ============================== READER ============================== */
function Reader({ m, startCh, onExitToDetail, onExitHome, onOpenManga }) {
  const chapters = useMR(() => getChapters(m), [m]);
  const idxOf = (n) => chapters.findIndex(c => c.n === n);
  const [chN, setChN] = useSR(startCh);
  const chapter = chapters[idxOf(chN)] || chapters[0];

  const [mode, setMode] = useSR(() => localStorage.getItem("winas:mode") || "vertical");
  const [rtl, setRtl] = useSR(() => localStorage.getItem("winas:rtl") === "1");
  const [page, setPage] = useSR(0);
  const [showBar, setShowBar] = useSR(true);
  const [settings, setSettings] = useSR(false);
  const [progress, setProgress] = useSR(0);
  const scroller = useRR(null);
  const lastY = useRR(0);

  const pages = chapter.pages;

  useER(() => { localStorage.setItem("winas:mode", mode); }, [mode]);
  useER(() => { localStorage.setItem("winas:rtl", rtl ? "1" : "0"); }, [rtl]);

  // mark read + reset position when chapter changes
  useER(() => {
    markRead(m.title, chN);
    // restore saved position
    const saved = localStorage.getItem(posKey(m.title, chN));
    if (mode === "paged") {
      setPage(saved ? Math.min(pages - 1, parseInt(saved, 10) || 0) : 0);
    } else {
      requestAnimationFrame(() => {
        if (scroller.current) scroller.current.scrollTop = saved ? parseFloat(saved) * scroller.current.scrollHeight : 0;
      });
    }
  }, [chN, mode]); // eslint-disable-line

  // persist + progress for vertical
  const onScroll = () => {
    const el = scroller.current; if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const ratio = max > 0 ? el.scrollTop / max : 0;
    setProgress(ratio);
    localStorage.setItem(posKey(m.title, chN), String(el.scrollTop / el.scrollHeight));
    // auto-hide bar on scroll down
    if (el.scrollTop > lastY.current + 8 && el.scrollTop > 120) setShowBar(false);
    else if (el.scrollTop < lastY.current - 8) setShowBar(true);
    lastY.current = el.scrollTop;
  };

  // persist paged position + progress
  useER(() => {
    if (mode === "paged") {
      localStorage.setItem(posKey(m.title, chN), String(page));
      setProgress(pages > 1 ? page / (pages - 1) : 1);
    }
  }, [page, mode]); // eslint-disable-line

  const goCh = (dir) => {
    const i = idxOf(chN) - dir; // chapters newest-first; next chapter = lower index
    if (i >= 0 && i < chapters.length) { setChN(chapters[i].n); setPage(0); window.scrollTo(0,0); }
  };
  const hasPrev = idxOf(chN) < chapters.length - 1;
  const hasNext = idxOf(chN) > 0;

  // paged nav
  const flip = (dir) => {
    const step = rtl ? -dir : dir;
    setPage(p => {
      const np = p + step;
      if (np < 0) return 0;
      if (np > pages - 1) { if (hasNext) goCh(1); return p; }
      return np;
    });
  };
  useER(() => {
    if (mode !== "paged") return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") flip(1);
      if (e.key === "ArrowLeft") flip(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, rtl, page, chN]); // eslint-disable-line

  const pageEls = [];
  for (let i = 0; i < pages; i++) {
    pageEls.push(
      <div className="rd-page" key={i}>
        <Ph label={`hal. ${i + 1} / ${pages}`} ratio="auto" hue={(m.hue + i * 9) % 360} radius="6px" src={window.pageFor(m, i, chapter)} />
      </div>
    );
  }

  return (
    <div className="reader" data-mode={mode}>
      {/* progress */}
      <div className="rd-progress" style={{ transform: `scaleX(${progress})` }} />

      {/* top bar */}
      <header className={"rd-bar rd-top " + (showBar ? "" : "hide")}>
        <div className="rd-bar-inner">
          <button className="back-btn" onClick={onExitToDetail}><Icon name="left" size={18} /> Profil</button>
          <div className="rd-title">
            <b>{m.title}</b>
            <span>Chapter {chN}{chapter.title ? " — " + chapter.title : ""}</span>
          </div>
          <div className="rd-actions">
            <select className="ch-select" value={chN} onChange={e => { setChN(parseInt(e.target.value,10)); setPage(0); }}>
              {chapters.map(c => <option key={c.n} value={c.n}>Ch. {c.n}{c.title ? " — " + c.title : ""}</option>)}
            </select>
            <button className="icon-btn" onClick={() => setSettings(s => !s)} aria-label="Pengaturan baca"><Icon name="spark" size={18} /></button>
            <button className="icon-btn" onClick={onExitHome} aria-label="Beranda"><Icon name="close" size={18} /></button>
          </div>
        </div>
        {settings && (
          <div className="rd-settings">
            <div className="rd-set-row">
              <span>Mode baca</span>
              <div className="sort-pills">
                <button className="sort-pill" data-on={mode==="vertical"} onClick={()=>setMode("vertical")}>Scroll</button>
                <button className="sort-pill" data-on={mode==="paged"} onClick={()=>setMode("paged")}>Per halaman</button>
              </div>
            </div>
            {mode === "paged" && (
              <div className="rd-set-row">
                <span>Arah</span>
                <div className="sort-pills">
                  <button className="sort-pill" data-on={!rtl} onClick={()=>setRtl(false)}>Kiri → Kanan</button>
                  <button className="sort-pill" data-on={rtl} onClick={()=>setRtl(true)}>Kanan → Kiri</button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* content */}
      {mode === "vertical" ? (
        <div className="rd-scroll" ref={scroller} onScroll={onScroll}>
          <div className="rd-strip">
            {pageEls}
            <div className="rd-end">
              <p>Akhir Chapter {chN}</p>
              {hasNext
                ? <button className="btn btn-primary" onClick={() => goCh(1)}>Chapter berikutnya <Icon name="right" size={16} /></button>
                : <button className="btn btn-ghost" onClick={onExitToDetail}>Kembali ke profil</button>}
              {!hasNext && (
                <RelatedManga current={m} manga={window.WINAS_DATA?.manga || []}
                              onOpen={onOpenManga} inReader />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rd-paged">
          <div className="rd-page-stage">
            {pageEls[page]}
          </div>
          <button className="rd-zone rd-zone-l" onClick={() => flip(rtl ? 1 : -1)} aria-label="Sebelumnya" />
          <button className="rd-zone rd-zone-r" onClick={() => flip(rtl ? -1 : 1)} aria-label="Berikutnya" />
        </div>
      )}

      {/* bottom bar */}
      <footer className={"rd-bar rd-bottom " + (showBar ? "" : "hide")}>
        <div className="rd-bar-inner">
          <button className="rd-chbtn" disabled={!hasPrev} onClick={() => goCh(-1)}><Icon name="left" size={16} /> Sebelumnya</button>
          <span className="rd-counter">
            {mode === "paged" ? `Halaman ${page + 1} / ${pages}` : `${pages} halaman`}
          </span>
          <button className="rd-chbtn" disabled={!hasNext} onClick={() => goCh(1)}>Berikutnya <Icon name="right" size={16} /></button>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { MangaDetail, Reader });
