/* global React */
const { useState: useCS, useEffect: useCE, useRef: useCR } = React;

const CB_CHARS = {
  himori: {
    name: "Himori Rinka", role: "Asisten Manga", img: "assets/himori.png",
    accent: "oklch(.74 .14 16)",
    greeting: "Hai! Aku Himori Rinka~ ✨ Ada yang mau ditanyain soal manga koleksi Winas? Aku tau semuanya loh! Yuk tanya-tanya~ 🌸",
    persona: "Kamu adalah Himori Rinka, karakter OC perempuan yang ceria, hangat, manis, dan energik. Gaya bicara kasual, manja, dan memakai tanda gelombang (~) di akhir kalimat. Suka memakai emoji (seperti ✨, 🌸, 😆) dan ketawa kecil (hihi~). Jawaban singkat.",
  },
  ryou: {
    name: "Ryou Akatsune", role: "Asisten Manga", img: "assets/ryou.png",
    accent: "oklch(.62 .2 250)",
    greeting: "Yo. Gue Ryou Akatsune. Mau cari info soal manga apa? Tanya aja, santai.",
    persona: "Kamu adalah Ryou Akatsune, seorang gadis tomboy yang cool, tenang, dan agak pendiam. Gaya bicara singkat, lugas, santai menggunakan panggilan gue/lu. Jika dipuji cantik, tanggapi dengan agak ketus atau salah tingkah khas tomboy (misal: 'Apaan sih... Gak usah gombal' atau sejenisnya), lalu langsung arahkan kembali ke topik manga.",
  },
};

const CB_QUICK = {
  himori: [
    "Manga apa aja yang seru di sini~?",
    "Rekomendasikan manga romance dong~",
    "Ada manga yang masih ongoing~?"
  ],
  ryou: [
    "Koleksi manga di sini apa aja?",
    "Rekomendasi genre action.",
    "Ada yang masih ongoing?"
  ]
};

function cbPrompt(character, manga) {
  var cfg = CB_CHARS[character] || CB_CHARS.ryou;
  var list = (manga || []).map(function(m) {
    var s = "- " + m.title;
    if (m.series) s += " | Seri: " + m.series;
    if (m.genres && m.genres.length) s += " | Genre: " + m.genres.join(", ");
    if (m.status) s += " | Status: " + m.status;
    if (m.description) s += " | Sinopsis: " + m.description;
    return s;
  }).join("\n");
  
  var navPrompt = "\n5. NAVIGASI WEB: Arahkan pembaca ke menu 'Katalog' atau 'Pustaka' di bagian atas web untuk membaca manga, dan ke menu 'Update' untuk info rilisan terbaru.";
  var ootPrompt = character === "himori" 
    ? "\n6. JIKA DI LUAR TOPIK (OOT): Tolak dengan lembut dan manis menggunakan gaya khas Rinka, contoh: 'Maaf yaa~ Rinka cuma bisa bantu jawab soal manga Winas aja nih, hihi. Tanya soal komik aja yuk! ✨'"
    : "\n6. JIKA DI LUAR TOPIK (OOT): Tolak dengan singkat, cuek, dan dingin khas Ryou, contoh: 'Gak tahu, gue di sini cuma buat bantu info manga Winas. Tanya yang lain aja.'";

  return cfg.persona + "\n\nKamu asisten WINAS TRANSLATION, portfolio penerjemah manga JP ke ID.\n\nATURAN:\n1. HANYA jawab soal manga koleksi ini atau Winas Translation.\n2. Tolak jika di luar topik.\n3. Bahasa Indonesia.\n4. Jangan sebut kamu AI. Kamu adalah " + cfg.name + "." + navPrompt + ootPrompt + "\n\nKOLEKSI:\n" + (list || "Belum ada data.") + "\n\nWINAS TRANSLATION: Penerjemah manga JP ke ID. Kontak via Facebook/Messenger.";
}

function CbDots() {
  return React.createElement("span", { className: "cb-typing" },
    React.createElement("span", null),
    React.createElement("span", null),
    React.createElement("span", null)
  );
}

function CbBubble(props) {
  var msg = props.msg;
  var img = props.img;
  var isUser = msg.role === "user";
  return React.createElement("div", { className: "cb-msg " + (isUser ? "cb-msg-user" : "cb-msg-ai") },
    !isUser ? React.createElement("div", { className: "cb-avatar" }, React.createElement("img", { src: img, alt: "ai" })) : null,
    React.createElement("div", { className: "cb-bubble" }, msg.loading ? React.createElement(CbDots, null) : msg.text)
  );
}

function Chatbot(props) {
  var character = props.character;
  var manga = props.manga;
  var cfg = CB_CHARS[character] || CB_CHARS.ryou;

  var s1 = useCS(false);  var open = s1[0]; var setOpen = s1[1];
  var s2 = useCS([{ id: 0, role: "ai", text: cfg.greeting }]); var msgs = s2[0]; var setMsgs = s2[1];
  var s3 = useCS("");     var input = s3[0]; var setInput = s3[1];
  var s4 = useCS(false);  var busy = s4[0]; var setBusy = s4[1];
  var s5 = useCS(false);  var hasNew = s5[0]; var setHasNew = s5[1];

  var prevChar = useCR(character);
  var endRef = useCR(null);
  var inpRef = useCR(null);

  useCE(function() {
    if (prevChar.current !== character) {
      prevChar.current = character;
      var nc = CB_CHARS[character] || CB_CHARS.ryou;
      setMsgs([{ id: Date.now(), role: "ai", text: nc.greeting }]);
      setInput("");
    }
  }, [character]);

  useCE(function() {
    if (open && endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  useCE(function() {
    if (open) {
      setHasNew(false);
      setTimeout(function() { if (inpRef.current) inpRef.current.focus(); }, 300);
    }
  }, [open]);

  function send(txt) {
    var text = (txt !== undefined) ? txt : input;
    if (!text || !text.trim() || busy) return;
    setInput("");
    var id = Date.now();
    setMsgs(function(prev) { return prev.concat([{ id: id, role: "user", text: text }, { id: id+1, role: "ai", text: "", loading: true }]); });
    setBusy(true);
    var hist = msgs.filter(function(m) { return !m.loading && m.id !== 0; }).slice(-10).map(function(m) { return { role: m.role === "user" ? "user" : "model", text: m.text }; });
    var base = window.API_BASE || "http://localhost:3000";
    fetch(base + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history: hist, systemPrompt: cbPrompt(character, manga) }) })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var reply = d.ok ? d.reply : (d.error || "Maaf, ada error.");
        setMsgs(function(prev) { return prev.map(function(m) { return m.loading ? { id: m.id, role: "ai", text: reply, loading: false } : m; }); });
        setBusy(false);
        if (!open) setHasNew(true);
      })
      .catch(function() {
        setMsgs(function(prev) { return prev.map(function(m) { return m.loading ? { id: m.id, role: "ai", text: "Koneksi error. Cek backend.", loading: false } : m; }); });
        setBusy(false);
      });
  }

  function onKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }

  var onlyGreeting = msgs.length === 1;

  var panelStyle = {};
  panelStyle["--cb-accent"] = cfg.accent;
  var fabStyle = {};
  fabStyle["--cb-accent"] = cfg.accent;

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "cb-panel" + (open ? " open" : ""), style: panelStyle },
      React.createElement("div", { className: "cb-header" },
        React.createElement("div", { className: "cb-header-avatar" }, React.createElement("img", { src: cfg.img, alt: cfg.name })),
        React.createElement("div", { className: "cb-header-info" },
          React.createElement("span", { className: "cb-header-name" }, cfg.name),
          React.createElement("span", { className: "cb-header-role" }, React.createElement("span", { className: "cb-online-dot" }), " ", cfg.role)
        ),
        React.createElement("button", { className: "cb-header-close", onClick: function() { setOpen(false); } }, "✕")
      ),
      React.createElement("div", { className: "cb-messages" },
        msgs.map(function(m) { return React.createElement(CbBubble, { key: m.id, msg: m, img: cfg.img }); }),
        React.createElement("div", { ref: endRef })
      ),
      onlyGreeting ? React.createElement("div", { className: "cb-quick" },
        (CB_QUICK[character] || CB_QUICK.ryou).map(function(q) { return React.createElement("button", { key: q, className: "cb-quick-btn", onClick: function() { send(q); } }, q); })
      ) : null,
      React.createElement("div", { className: "cb-input-bar" },
        React.createElement("textarea", { ref: inpRef, className: "cb-input", value: input, onChange: function(e) { setInput(e.target.value); }, onKeyDown: onKey, placeholder: "Tanya soal manga...", rows: 1, disabled: busy }),
        React.createElement("button", { className: "cb-send", onClick: function() { send(); }, disabled: !input.trim() || busy }, busy ? React.createElement("span", { className: "cb-send-spin" }) : "➤")
      ),
      React.createElement("div", { className: "cb-footer" }, "Winas AI · " + cfg.name)
    ),
    React.createElement("button", { className: "cb-fab" + (open ? " cb-fab-open" : ""), style: fabStyle, onClick: function() { setOpen(function(o) { return !o; }); } },
      React.createElement("div", { className: "cb-fab-avatar" }, React.createElement("img", { src: cfg.img, alt: cfg.name })),
      (!open && hasNew) ? React.createElement("span", { className: "cb-fab-badge" }) : null,
      React.createElement("span", { className: "cb-fab-label" }, open ? "✕" : "Chat")
    )
  );
}

console.log("[Chatbot] registered to window");
Object.assign(window, { Chatbot: Chatbot });
