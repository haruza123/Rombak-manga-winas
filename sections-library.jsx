/* global React, Icon, Ph, StatusPill, NewBadge, ProgressBar, relTime */
const { useState: useSL, useMemo: useML } = React;

/* ============================== PUSTAKA (bookmarks) ============================== */
function Library({ manga, onBack, onOpen, onReader }) {
  const [tick, setTick] = useSL(0);
  const items = useML(() => {
    const titles = window.getBookmarks();
    return titles
      .map(t => manga.find(m => m.title === t))
      .filter(Boolean);
  }, [manga, tick]);

  const remove = (e, title) => {
    e.stopPropagation();
    window.toggleBookmark(title);
    setTick(x => x + 1);
  };

  return (
    <div className="library">
      <div className="lib-hero halftone-bg">
        <div className="wrap">
          <button className="back-btn" onClick={onBack}><Icon name="left" size={18} /> Beranda</button>
          <span className="eyebrow" style={{ marginTop: 22, display: "inline-flex" }}>Koleksimu</span>
          <h1 className="lib-title">Pustaka</h1>
          <p className="lib-sub">{items.length ? `${items.length} judul tersimpan` : "Belum ada judul tersimpan"}</p>
        </div>
      </div>

      <div className="wrap lib-wrap">
        {items.length === 0 ? (
          <div className="lib-empty">
            <span className="lib-empty-ic"><Icon name="spark" size={30} /></span>
            <h3>Pustakamu masih kosong</h3>
            <p>Simpan manga favorit dengan tombol “Simpan ke daftar” di halaman profil—nanti muncul di sini.</p>
            <button className="btn btn-primary" onClick={onBack}><Icon name="book" size={16} /> Jelajahi Katalog</button>
          </div>
        ) : (
          <div className="mgrid">
            {items.map(m => {
              const prog = window.getProgress(m);
              return (
                <article key={m.title} className="mcard" role="button" tabIndex={0}
                         onClick={() => onOpen(m)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(m); }}>
                  <div className="mcard-cover">
                    <Ph label="cover" ratio="3 / 4.2" hue={m.hue} radius="var(--r-md)" src={window.coverFor(m)} />
                    <div className="mcard-badges">
                      <StatusPill status={m.status} />
                      {window.isNew(m) && <NewBadge />}
                    </div>
                    <button className="mcard-remove" onClick={(e) => remove(e, m.title)} title="Hapus dari Pustaka">
                      <Icon name="close" size={14} />
                    </button>
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
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Library });
