/* global React, ReactDOM, Navbar, Hero, Updates, ShortTL, Catalog, OCBranding, WorkWithMe, Footer,
   MangaDetail, Reader, Guard, ContinueReading, Library, Greeting, AdPopup,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor */
const { useState: useSA, useEffect: useEA, useRef: useRA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "dark",
  "characterTheme": true,
  "accent": "ryou",
  "cornerStyle": "soft",
  "showOcDuo": true,
  "guard": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [query, setQuery] = useSA("");
  const [view, setView] = useSA({ name: "home" }); // {name:'home'|'detail'|'reader', manga, ch}
  const D = window.WINAS_DATA;

  // when characterTheme is on, accent follows the mode (dark=Ryou, light=Himori)
  const accent = t.characterTheme ? (t.mode === "dark" ? "ryou" : "himori") : t.accent;
  const character = t.mode === "dark" ? "ryou" : "himori";

  const openDetail = (m) => { setView({ name: "detail", manga: m }); };
  const openReader = (m, ch) => { setView({ name: "reader", manga: m, ch }); };
  const goHome = () => { setView({ name: "home" }); };
  const openLibrary = () => { setView({ name: "library" }); window.scrollTo(0, 0); };
  const findManga = (title) => D.manga.find(x => x.title === title);

  // search dari navbar → pindah ke katalog di beranda
  const goSearch = () => {
    if (view.name !== "home") { setView({ name: "home" }); }
    setTimeout(() => {
      const el = document.getElementById("catalog");
      if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
    }, view.name !== "home" ? 80 : 0);
  };

  const toggleMode = () => setTweak("mode", t.mode === "dark" ? "light" : "dark");

  useEA(() => {
    const root = document.documentElement;
    const scale = { sharp: 0.35, soft: 1, round: 1.5 }[t.cornerStyle] || 1;
    root.style.setProperty("--rscale", scale);
  }, [t.cornerStyle]);

  // Share link: buka manga dari URL hash (#manga=Judul)
  useEA(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#manga=')) return;
    const title = decodeURIComponent(hash.slice(7));
    const m = D.manga.find(x => x.title === title);
    if (m) { openDetail(m); window.scrollTo(0, 0); }
  }, []); // eslint-disable-line

  const isReader = view.name === "reader";
  const openManga = (m) => { openDetail(m); window.scrollTo(0, 0); };

  return (
    <div className="app" data-mode={t.mode} data-accent={accent}
         style={{
           "--r-sm": `calc(10px * var(--rscale, 1))`,
           "--r-md": `calc(16px * var(--rscale, 1))`,
           "--r-lg": `calc(24px * var(--rscale, 1))`,
           "--r-xl": `calc(34px * var(--rscale, 1))`,
         }}>
      {!isReader && <Navbar mode={t.mode} character={character} onToggleMode={toggleMode} query={query} setQuery={setQuery} onHome={goHome} onLibrary={openLibrary} onSearchFocus={goSearch} manga={D.manga} onOpen={openManga} />}

      {view.name === "home" && (
        <main id="main-content">
          <Hero showOc={t.showOcDuo} mode={t.mode} character={character} />
          <ContinueReading manga={D.manga} onOpenReader={openReader} />
          <Updates updates={D.updates} onOpen={(title) => { const m = findManga(title); if (m) openDetail(m); }} />
          <ShortTL />
          <Catalog manga={D.manga} query={query} onOpen={openDetail} />
          <OCBranding ocs={D.ocs} character={character} />
          <WorkWithMe character={character} />
        </main>
      )}

      {view.name === "detail" && (
        <MangaDetail m={view.manga} onBack={goHome} onRead={(ch) => openReader(view.manga, ch)}
                     onOpenManga={openManga} />
      )}

      {view.name === "reader" && (
        <Reader m={view.manga} startCh={view.ch}
                onExitToDetail={() => openDetail(view.manga)}
                onExitHome={goHome}
                onOpenManga={openManga} />
      )}

      {view.name === "library" && (
        <Library manga={D.manga} onBack={goHome} onOpen={openDetail} onReader={openReader} />
      )}

      {!isReader && <Footer character={character} />}

      <Guard enabled={t.guard} character={character} />
      <Greeting character={character} />
      <AdPopup />

      <TweaksPanel>
        <TweakSection label="Tema & karakter" />
        <TweakRadio label="Mode" value={t.mode} options={["dark", "light"]}
                    onChange={v => setTweak("mode", v)} />
        <TweakToggle label="Warna ikut karakter" value={t.characterTheme}
                     onChange={v => setTweak("characterTheme", v)} />
        {!t.characterTheme && (
          <TweakColor label="Aksen" value={accentSwatch(t.accent)}
                      options={ACCENT_SWATCHES.map(a => a.sw)}
                      onChange={sw => setTweak("accent", swatchToAccent(sw))} />
        )}
        <TweakSection label="Bentuk & proteksi" />
        <TweakRadio label="Sudut" value={t.cornerStyle}
                    options={["sharp", "soft", "round"]}
                    onChange={v => setTweak("cornerStyle", v)} />
        <TweakToggle label="Duo OC di hero" value={t.showOcDuo}
                     onChange={v => setTweak("showOcDuo", v)} />
        <TweakToggle label="Proteksi gambar" value={t.guard}
                     onChange={v => setTweak("guard", v)} />
      </TweaksPanel>
    </div>
  );
}

const ACCENT_SWATCHES = [
  { key: "himori", sw: ["#e86a86", "#f0995a"] },
  { key: "ryou",   sw: ["#d83a3a", "#5b8bf0"] },
  { key: "warm",   sw: ["#e8612d", "#f0964a"] },
  { key: "cool",   sw: ["#5b6bf0", "#9a6cf0"] },
  { key: "pastel", sw: ["#e88aa0", "#c79ae8"] },
  { key: "moon",   sw: ["#7d8fe0", "#e0d28a"] },
];
function accentSwatch(key) { return (ACCENT_SWATCHES.find(a => a.key === key) || ACCENT_SWATCHES[0]).sw; }
function swatchToAccent(sw) {
  const found = ACCENT_SWATCHES.find(a => JSON.stringify(a.sw) === JSON.stringify(sw));
  return found ? found.key : "warm";
}

(window.DATA_READY || Promise.resolve()).then(function () {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
});
