/* global React, Icon, Ph, ProgressBar */
const { useMemo: useMC } = React;

/* ============================== CONTINUE READING ============================== */
function ContinueReading({ manga, onOpenReader }) {
  const items = useMC(() => {
    return manga
      .map(m => ({ m, p: window.getProgress(m) }))
      .filter(x => x.p && x.p.pct < 100)        // sedang dibaca, belum tamat
      .sort((a, b) => b.p.pct - a.p.pct);
  }, [manga]);

  if (!items.length) return null;

  return (
    <section id="continue" className="section section-continue">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Selamat datang kembali</span>
            <h2 className="section-title">Lanjut Baca</h2>
            <p className="section-sub">Sambung dari tempat terakhir kamu berhenti.</p>
          </div>
        </div>

        <div className="cont-grid">
          {items.map(({ m, p }) => (
            <article key={m.title} className="cont-card" role="button" tabIndex={0}
                     onClick={() => onOpenReader(m, p.lastCh)}
                     onKeyDown={(e) => { if (e.key === "Enter") onOpenReader(m, p.lastCh); }}>
              <div className="cont-cover">
                <Ph label="cover" ratio="3 / 4" hue={m.hue} radius="var(--r-sm)" src={window.coverFor(m)} />
                <span className="cont-play"><Icon name="arrow" size={18} /></span>
              </div>
              <div className="cont-body">
                <h3>{m.title}</h3>
                <span className="cont-sub">{m.series}</span>
                <div className="cont-prog">
                  <ProgressBar pct={p.pct} label={`Ch. ${p.lastCh} · ${p.pct}%`} />
                  <span className="cont-pct">Ch. {p.lastCh} · {p.pct}%</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ContinueReading });
