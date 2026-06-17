/* global React, Icon */
const { useState: useSG, useEffect: useEG, useRef: useRG, useCallback: useCG } = React;

/* in-character lines, keyed by character + reason. Each reason has SEVERAL variants
   (dipilih acak). Himori = ceria/ramah · Ryou = cool/dingin. NO portrait image. */
const GUARD_LINES = {
  ryou: {
    name: "Ryou Akatsune",
    sign: "— Ryou · QA Winas TL",
    save: [
      { title: "Tanganmu, amankan.", body: "Klik kanan tidak akan menghasilkan apa-apa di sini. Gambarnya terkunci, baca saja dengan tenang." },
      { title: "Mau ku-kick?", body: "Mencoba mengunduh aset Winas TL tanpa izin? Jangan memancing emosiku, baca di sini atau keluar." },
      { title: "Percuma.", body: "Sudah ku-setting sedemikian rupa agar tidak bisa disimpan. Berhentilah membuang energimu." },
      { title: "Ilegal, tahu.", body: "Menyimpan komik ini secara ilegal? Hargai kerja keras tim yang sudah begadang menyelesaikannya." },
    ],
    devtools: [
      { title: "Niat nge-crack?", body: "Menekan F12 atau kombinasi tombol itu tidak akan membuka apa pun. Tutup atau saya blokir IP-mu." },
      { title: "Kuhentikan di sini.", body: "Membuka Inspect Element? Tidak ada *source code* ajaib di balik layar. Kembali membaca." },
      { title: "Sedang memata-matai?", body: "Membuka alat pengembang hanya membuatmu terlihat mencurigakan. Jangan cari masalah di sini." },
    ],
    copy: [
      { title: "Dilarang plagiat.", body: "Menyalin naskah terjemahan kami? Itu hasil *typeset* dan *translate* yang melelahkan. Jangan asal comot." },
      { title: "Cukup.", body: "Teks ini milik Winas TL. Kalau butuh versimu sendiri, silakan terjemahkan dari nol." },
    ],
  },
  himori: {
    name: "Himori Rinka",
    sign: "— Himori 🌸",
    save: [
      { title: "Eeh~ tangan nakal! 💢", body: "Hehe, ketahuan kan mau klik kanan! Gambarnya dilindungi punya Winas TL tauu~ Baca di sini aja ih! (っ.❛ ᴗ ❛.)っ" },
      { title: "Uwaa, jangan dimaling~ 😭", body: "Gambarnya hasil begadang tim lho! Kalau kamu simpan sembarangan, nanti Himori nangis nih... Dukung di sini aja ya! ✨" },
      { title: "Hng hng, nggak boleh! 💕", body: "Eits, folder penyimpanan kamu nggak boleh kemasukan gambar ini! Biar Himori yang jagain di website ini aja~ (๑˃ᴗ˂)" },
      { title: "Mau diculik ya? 😳", body: "Manga-manga ini sudah betah di sini~ Jangan ditarik-tarik atau di-drag dong, nanti halamannya rusak!" },
    ],
    devtools: [
      { title: "Waa, jangan diintip! >_<", body: "Kamu buka jendela item-item hitam itu ya?! Ih, mesum eh... maksudnya, nggak boleh ngintip kode di dalam! Yuk balik baca! 🌸" },
      { title: "Eh eh, tombol apa itu?! 😳", body: "F12? Shortcut rahasia ya? Hehe, Himori udah pasang mantra pelindung loh, nggak bakalan mempan! (｡•̀ᴗ-)✧" },
      { title: "Penasaran ya? (っ*´∀｀*)っ", body: "Di balik layar cuma ada tumpukan kode pusing, nggak ada bonus chapter kok~ Mending lanjutin ceritanya, lagi seru-serunya tuh!" },
    ],
    copy: [
      { title: "Hehe, ketahuan~ 🤭", body: "Mau nyalin teksnya buat apa hayo? Konten ini eksklusif punya Winas TL~ Kalau suka, mending share link web ini aja! 💕" },
      { title: "Eitss, no copy-copy! 🌸", body: "Naskah terjemahan ini dibuat pakai keringat dan air mata (plus kopi)! Daripada disalin, mending ajak temen kamu baca bareng di sini~" },
    ],
  },
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function Guard({ enabled, character }) {
  const [popup, setPopup] = useSG(null);
  const timer = useRG(null);

  const fire = useCG((reason) => {
    const c = GUARD_LINES[character] || GUARD_LINES.ryou;
    const line = rand(c[reason] || c.save);
    setPopup({ reason, line, id: Date.now() });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPopup(null), 6000);
  }, [character]);

  useEG(() => {
    if (!enabled) return;
    const onContext = (e) => { e.preventDefault(); fire("save"); };
    const onDragStart = (e) => {
      if (e.target.tagName === "IMG" || (e.target.closest && e.target.closest(".ph, .rd-page, .hero-oc, .ocb-img"))) {
        e.preventDefault(); fire("save");
      }
    };
    const onKey = (e) => {
      const k = e.key, ctrl = e.ctrlKey || e.metaKey;
      if (k === "F12") { e.preventDefault(); fire("devtools"); return; }
      if (ctrl && e.shiftKey && ["I","J","C","i","j","c"].includes(k)) { e.preventDefault(); fire("devtools"); return; }
      if (ctrl && (k === "u" || k === "U")) { e.preventDefault(); fire("devtools"); return; }
      if (ctrl && (k === "s" || k === "S")) { e.preventDefault(); fire("save"); return; }
    };
    const onCopy = (e) => {
      const sel = (window.getSelection && String(window.getSelection())) || "";
      if (sel.length > 40) { e.preventDefault(); fire("copy"); }
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKey);
    document.addEventListener("copy", onCopy);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("copy", onCopy);
    };
  }, [enabled, fire]);

  if (!popup) return null;
  const c = GUARD_LINES[character] || GUARD_LINES.ryou;
  const line = popup.line || rand(c[popup.reason] || c.save);

  return (
    <div className="guard" key={popup.id} data-char={character}>
      <button className="guard-dim" onClick={() => setPopup(null)} aria-label="Tutup" />
      <div className="guard-card guard-noimg" role="alertdialog" aria-label={line.title}>
        <span className="guard-lock"><Icon name="spark" size={18} /></span>
        <div className="guard-body">
          <div className="guard-name">{c.name}<span className="guard-badge">PROTECTED</span></div>
          <h3 className="guard-title">{line.title}</h3>
          <p className="guard-text">{line.body}</p>
          <div className="guard-foot">
            <span className="guard-sign">{c.sign}</span>
            <button className="guard-ok" onClick={() => setPopup(null)}>
              {character === "himori" ? "Oke, maaf~" : "Mengerti."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Guard });
