/* global React, Icon */
const { useState: useSO, useEffect: useEO, useRef: useRO } = React;

/* ============================== GREETING TOAST ============================== */
/* Muncul sekali per sesi, SETELAH iklan ditutup (biar tak bentrok). Himori ceria / Ryou cool. */
function Greeting({ character }) {
  const [show, setShow] = useSO(false);
  const v = (window.VOICE && window.VOICE[character]) || {};
  const greet = useRO(null);
  if (!greet.current) {
    const list = v.greetings || [{ title: "", body: "" }];
    greet.current = list[Math.floor(Math.random() * list.length)];
  }

  useEO(() => {
    if (sessionStorage.getItem("winas:greeted")) return;
    // kalau iklan belum ditutup di sesi ini, tunggu event-nya dulu
    const adPending = !sessionStorage.getItem("winas:ad");
    if (adPending) {
      const onClosed = () => setTimeout(() => setShow(true), 500);
      window.addEventListener("winas:adclosed", onClosed, { once: true });
      const fallback = setTimeout(() => setShow(true), 14000); // jaga-jaga kalau iklan tak muncul
      return () => { window.removeEventListener("winas:adclosed", onClosed); clearTimeout(fallback); };
    }
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("winas:greeted", "1");
  };

  useEO(() => {
    if (!show) return;
    const t = setTimeout(close, 8000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div className="greet" data-char={character}>
      <div className="greet-portrait"><img src={v.img} alt={v.name} draggable="false" /></div>
      <div className="greet-body">
        <div className="greet-name">{v.name}</div>
        <h4 className="greet-title">{greet.current.title}</h4>
        <p className="greet-text">{greet.current.body}</p>
        <span className="greet-sign">{v.sign}</span>
      </div>
      <button className="greet-close" onClick={close} aria-label="Tutup"><Icon name="close" size={15} /></button>
    </div>
  );
}

/* ============================== AD POPUP (banner gambar → link) ============================== */
/* Konfigurasi iklan diambil dari API /api/ads (diatur via admin dashboard).
   Fallback ke default jika API gagal atau belum ada konfigurasi. */
const AD_DEFAULT = {
  image: "assets/ad-sample.png",
  href: "https://example.com",
  alt: "Promo Toko Manga",
  enabled: true,
};

function AdPopup() {
  const [show, setShow] = useSO(false);
  const [closing, setClosing] = useSO(false);
  const [ad, setAd] = useSO(window.AD_CONFIG || null);

  // Muat konfigurasi iklan dari API
  useEO(() => {
    if (ad) return; // sudah ada dari window.AD_CONFIG
    const base = (window.API_BASE || "").replace(/\/$/, "");
    fetch(base + "/api/ads")
      .then((r) => r.json())
      .then((data) => setAd(data))
      .catch(() => setAd(AD_DEFAULT));
  }, []);

  useEO(() => {
    if (!ad) return; // tunggu config dimuat
    if (sessionStorage.getItem("winas:ad")) return;
    if (ad.enabled === false) return; // iklan dinonaktifkan dari admin
    const t = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(t);
  }, [ad]);

  const close = () => {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("winas:ad", "1");
      window.dispatchEvent(new Event("winas:adclosed")); // beri tahu greeting boleh muncul
    }, 220);
  };

  // tombol Esc menutup
  useEO(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  if (!show || !ad) return null;
  return (
    <div className={"ad-overlay " + (closing ? "closing" : "")}>
      <button className="ad-dim" onClick={close} aria-label="Tutup iklan" />
      <div className="ad-modal ad-modal-img" role="dialog" aria-label="Iklan">
        <span className="ad-label">Iklan</span>
        <button className="ad-close" onClick={close} aria-label="Tutup"><Icon name="close" size={18} /></button>

        <a className="ad-banner" href={ad.href} target="_blank" rel="noopener sponsored"
           onClick={() => { sessionStorage.setItem("winas:ad", "1"); }}>
          <img src={ad.image} alt={ad.alt} draggable="false" />
        </a>

        <button className="ad-skip" onClick={close}>Tutup iklan ✕</button>
      </div>
    </div>
  );
}

/* ============================== NEW CHAPTER BANNER ============================== */
/* Banner dismissible di atas halaman, muncul kalau ada manga ≤ 3 hari terakhir.   */
function NewChapterBanner({ manga, onOpen }) {
  const [show, setShow] = useSO(() => !sessionStorage.getItem('winas:newbanner'));
  if (!show) return null;

  const recent = (manga || [])
    .filter(m => typeof m.updated === 'number' && m.updated >= 0 && m.updated <= 3)
    .sort((a, b) => a.updated - b.updated);
  if (!recent.length) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('winas:newbanner', '1');
  };

  const shown = recent.slice(0, 2);
  const extra = recent.length - shown.length;

  return (
    <div className="new-banner">
      <span className="new-banner-icon">✨</span>
      <span className="new-banner-text">Update terbaru:</span>
      <div className="new-banner-links">
        {shown.map(m => (
          <button key={m.title} className="new-banner-link"
                  onClick={() => { onOpen(m); dismiss(); }}>
            {m.title}
          </button>
        ))}
        {extra > 0 && <span className="new-banner-extra">+{extra} lainnya</span>}
      </div>
      <button className="new-banner-close" onClick={dismiss} aria-label="Tutup">
        <Icon name="close" size={13} />
      </button>
    </div>
  );
}

Object.assign(window, { Greeting, AdPopup });
