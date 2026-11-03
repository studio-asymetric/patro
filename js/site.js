const CHARSET = " !\"%&'()*+,-./0123456789:;?ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]_abcdefghijklmnopqrstuvwxyz{}¨«´·»ÁÂÄÅÉÍÓÔÖØÚÜÝßáâäåéíóôöøúüýČčĎďĚěĹĺĽľŇňŔŕŘřŠšŤťŮůŹźŽžˆˇ˚–—‘’‚“”‹›";
const KNOWN = new Set(Array.from(CHARSET));

const GROUPS = {
  glyphsUpper: "AÁÄÅÂBCČDĎEÉĚFGHIÍJKLĽĹMNŇOÓÖØÔPQRŔŘSŠTŤUÚÜŮVWXYÝZŹŽß",
  glyphsFigures: "0123456789",
  glyphsPunct: " !\"%&'()*+,-./:;?[]_{}¨«´·»‹›–—‘’‚“”\\ˆˇ˚"
};

const PRESETS = [
  { ink: "noir", text: "SCHÖNAUER\nSTRAßE", place: "German street plate", name: "Schönauer Straße" },
  { ink: "rouge", text: "GELNICA – ZASTÁVKA", place: "Slovak stop", name: "Gelnica" },
  { ink: "noir", text: "ZLÍN", place: "City", name: "Zlín" },
  { ink: "noir", text: "BAŤOVY\nDOMKY", place: "Baťa houses", name: "Baťovy domky" },
  { ink: "cislo", text: "1. PATRO\nHAVLÍČKOVA 50\nMLADÁ BOLESLAV", place: "House plate", name: "Mladá Boleslav" },
  { ink: "paper", text: "P a t r o", place: "The five known letters", name: "P a t r o" },
  { ink: "paper", text: "SPUREN–STOPY", place: "Book cover", name: "Spuren–Stopy" },
  { ink: "brick", text: "AUSSTELLUNG DER\nTSCHECHOSLOWAKISCHEN\nINDUSTRIE", place: "Exhibition wall", name: "Industrie" },
  { ink: "noir", text: "28. ŘÍJEN\nPRAHA", place: "Prague street", name: "28. říjen" },
  { ink: "rouge", text: "WILSONOVO\nNÁDRAŽÍ", place: "Prague station", name: "Wilsonovo nádraží" },
  { ink: "brick", text: "NÁRODNÍ\nTŘÍDA", place: "Prague avenue", name: "Národní třída" },
  { ink: "paper", text: "TURČ. SV. MARTIN", place: "Slovak town", name: "Turčiansky Svätý Martin" },
  { ink: "cislo", text: "MASARYKOVO\nNÁBŘEŽÍ", place: "Prague embankment", name: "Masarykovo nábřeží" },
  { ink: "noir", text: "PRAHA", place: "Capital", name: "Praha", city: true },
  { ink: "rouge", text: "BRNO", place: "Moravia", name: "Brno", city: true },
  { ink: "paper", text: "BRATISLAVA", place: "Slovakia", name: "Bratislava", city: true },
  { ink: "cislo", text: "PLZEŇ", place: "Bohemia", name: "Plzeň", city: true },
  { ink: "brick", text: "KOŠICE", place: "Eastern Slovakia", name: "Košice", city: true },
  { ink: "noir", text: "PRAŽSKÝ\nHRAD", place: "The castle", name: "Pražský hrad", city: true },
  { ink: "paper", text: "UŽHOROD", place: "Ruthenia", name: "Užhorod", city: true }
];

const REPUBLIC = [
  { month: 1, day: 6, year: 1918, name: "Three Kings Declaration" },
  { month: 4, day: 18, year: 1920, name: "First elections. Women vote." },
  { month: 5, day: 4, year: 1919, name: "Death of Milan Rastislav Štefánik" },
  { month: 5, day: 30, year: 1918, name: "Pittsburgh Agreement" },
  { month: 6, day: 4, year: 1920, name: "Treaty of Trianon" },
  { month: 9, day: 3, year: 1918, name: "The United States recognises the Council" },
  { month: 9, day: 10, year: 1919, name: "Treaty of Saint-Germain" },
  { month: 10, day: 14, year: 1918, name: "Provisional government in Paris" },
  { month: 10, day: 18, year: 1918, name: "Washington Declaration" },
  { month: 10, day: 28, year: 1918, name: "The state is proclaimed in Prague" },
  { month: 10, day: 30, year: 1918, name: "Martin Declaration" },
  { month: 11, day: 13, year: 1918, name: "Provisional constitution" },
  { month: 11, day: 14, year: 1918, name: "Masaryk elected president" },
  { month: 12, day: 4, year: 1918, name: "The Allies recognise the state" },
  { month: 12, day: 10, year: 1918, name: "Noble titles abolished" },
  { month: 12, day: 21, year: 1918, name: "Masaryk returns to Prague" }
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const editor = document.getElementById("editor");
const stage = document.getElementById("specimen");
const hint = document.getElementById("hint");
const missing = document.getElementById("missing");
const track = document.getElementById("track");
const size = document.getElementById("size");
const lead = document.getElementById("lead");
const trackOut = document.getElementById("trackOut");
const sizeOut = document.getElementById("sizeOut");
const leadOut = document.getElementById("leadOut");
const ss01 = document.getElementById("ss01");
const rail = document.getElementById("rail");
let lenis = null;
let placeDrawing = function () {};

function readSign() {
  return (editor.innerText || "").replace(/\u00a0/g, " ").replace(/\r/g, "");
}

function writeSign(text) {
  editor.textContent = text.slice(0, 160);
}

function fit() {
  const scale = Number(size.value) / 100;
  const leading = Number(lead.value) / 100;
  editor.style.letterSpacing = (Number(track.value) / 100).toFixed(3) + "em";
  editor.style.lineHeight = String(leading);
  editor.style.whiteSpace = "pre";
  editor.style.width = "max-content";
  editor.style.maxWidth = "none";
  editor.style.fontSize = "100px";
  const measured = Math.max(editor.scrollWidth, 1);
  const avail = Math.max(120, stage.clientWidth - 96);
  const lineCount = Math.max(1, readSign().split("\n").filter((line) => line.trim().length).length);
  const maxH = Math.max(140, stage.clientHeight - 188);
  let px = (avail / measured) * 100 * scale;
  px = Math.min(px, maxH / (lineCount * Math.max(leading, 0.72)));
  editor.style.fontSize = Math.max(22, Math.min(px, 280)) + "px";
}

function formatTrack(value) {
  const n = Number(value) / 100;
  const body = Math.abs(n).toFixed(2);
  return (n < 0 ? "−" : "") + body;
}

function syncOutputs() {
  trackOut.textContent = formatTrack(track.value);
  sizeOut.textContent = size.value;
  leadOut.textContent = (Number(lead.value) / 100).toFixed(2);
  editor.style.setProperty("--track", (Number(track.value) / 100).toFixed(3) + "em");
  editor.style.setProperty("--lead", (Number(lead.value) / 100).toFixed(2));
}

function setInk(ink) {
  stage.dataset.ink = ink;
  document.querySelectorAll(".ink").forEach((button) => {
    button.setAttribute("aria-checked", button.dataset.ink === ink ? "true" : "false");
  });
}

function flagMissing() {
  const bad = [];
  for (const ch of readSign()) {
    if (ch === "\n" || ch === "\t") continue;
    if (!KNOWN.has(ch) && !bad.includes(ch)) bad.push(ch);
  }
  if (!bad.length) {
    missing.hidden = true;
    missing.textContent = "";
    return;
  }
  missing.hidden = false;
  missing.textContent = "No drawing for " + bad.join(" ");
}

function markTyped() {
  hint.classList.add("is-gone");
}

function applyPreset(preset, scroll) {
  writeSign(preset.text);
  setInk(preset.ink);
  markTyped();
  flagMissing();
  fit();
  if (scroll) {
    if (lenis) lenis.scrollTo(stage, { offset: 0, duration: 1.05 });
    else stage.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function plateNode(preset, clone) {
  const plate = document.createElement("article");
  plate.className = "mini";
  plate.dataset.ink = preset.ink;
  if (clone) plate.setAttribute("aria-hidden", "true");

  const lines = preset.text.split("\n");
  const longest = Math.max(...lines.map((line) => line.length));
  const text = document.createElement("span");
  text.className = "mini-text live-type";
  text.textContent = preset.text;
  text.style.fontSize = Math.max(22, Math.min(52, 540 / longest)) + "px";

  const cap = document.createElement("span");
  cap.className = "mini-cap";
  cap.textContent = preset.place;

  const add = document.createElement("button");
  add.type = "button";
  add.className = "mini-add";
  add.textContent = "Add to plate";
  if (clone) add.tabIndex = -1;
  else add.setAttribute("aria-label", "Add " + preset.name + " to the plate");
  add.addEventListener("click", () => applyPreset(preset, true));

  plate.append(text, cap, add);
  return plate;
}

function buildRail() {
  const track = document.getElementById("railTrack");
  const addSet = (clone) => {
    PRESETS.forEach((preset) => track.append(plateNode(preset, clone)));
  };

  addSet(false);
  addSet(true);

  const cruise = 96;
  const crawl = 22;
  let offset = 0;
  let half = 0;
  let velocity = cruise;
  let dragging = false;
  let hovering = false;
  let focused = false;
  let startX = 0;
  let startOffset = 0;
  let lastX = 0;
  let lastMove = 0;
  let dragVelocity = 0;
  let lastFrame = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cover() {
    let sets = track.childElementCount / PRESETS.length;
    let setWidth = track.scrollWidth / sets;
    while ((setWidth * sets) / 2 < rail.clientWidth + 80) {
      addSet(true);
      addSet(true);
      sets += 2;
      setWidth = track.scrollWidth / sets;
    }
    half = track.scrollWidth / 2;
  }

  function wrap(value) {
    if (half <= 0) return 0;
    return ((value % half) + half) % half;
  }

  function paint() {
    track.style.transform = "translate3d(" + (-wrap(offset)) + "px, 0, 0)";
  }

  function targetSpeed() {
    if (reduce) return 0;
    return hovering || focused ? crawl : cruise;
  }

  function frame(now) {
    if (!lastFrame) lastFrame = now;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (!dragging) {
      const target = targetSpeed();
      const gap = Math.abs(target - velocity);
      const tau = 0.4 + Math.min(0.75, gap / 900);
      const blend = 1 - Math.exp(-dt / tau);
      velocity += (target - velocity) * blend;
      offset += velocity * dt;
    }
    paint();
    requestAnimationFrame(frame);
  }

  rail.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".mini-add")) return;
    dragging = true;
    startX = lastX = event.clientX;
    startOffset = offset;
    lastMove = performance.now();
    dragVelocity = 0;
    rail.classList.add("is-dragging");
    try { rail.setPointerCapture(event.pointerId); } catch (error) {}
  });

  rail.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = event.clientX - lastX;
    const dt = (now - lastMove) / 1000;
    if (dt > 0.008) {
      dragVelocity = dragVelocity * 0.55 + (-dx / dt) * 0.45;
      lastX = event.clientX;
      lastMove = now;
    }
    offset = startOffset - (event.clientX - startX);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove("is-dragging");
    const idle = performance.now() - lastMove;
    velocity = reduce || idle > 70 ? 0 : Math.max(-1600, Math.min(1600, dragVelocity));
  }

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);
  rail.addEventListener("mouseenter", () => { hovering = true; });
  rail.addEventListener("mouseleave", () => { hovering = false; });
  rail.addEventListener("focusin", () => { focused = true; });
  rail.addEventListener("focusout", (event) => {
    if (!rail.contains(event.relatedTarget)) focused = false;
  });

  window.addEventListener("resize", () => {
    cover();
    paint();
  });

  cover();
  requestAnimationFrame(frame);
}

function buildGlyphs() {
  const used = new Set();
  Object.entries(GROUPS).forEach(([id, chars]) => {
    const host = document.getElementById(id);
    Array.from(chars).forEach((ch) => {
      if (ch === " " || used.has(ch) || !KNOWN.has(ch)) return;
      used.add(ch);
      host.append(glyphButton(ch));
    });
  });
  Array.from("aáäåâbcčdďeéěfghiíjklľĺmnňoóöøôpqrŕřsštťuúüůvwxyýzźž").forEach((ch) => used.add(ch));
  const more = [];
  Array.from(CHARSET).forEach((ch) => {
    if (ch !== " " && !used.has(ch)) more.push(ch);
  });
  if (more.length) {
    document.getElementById("glyphsMoreWrap").hidden = false;
    more.forEach((ch) => document.getElementById("glyphsMore").append(glyphButton(ch)));
  }
}

let activeGlyph = null;

function glyphButton(ch) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "glyph live-type";
  button.textContent = ch;
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => selectGlyph(ch, button));
  return button;
}

function codeOf(ch) {
  return "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
}

function selectGlyph(ch, button) {
  if (activeGlyph) activeGlyph.setAttribute("aria-pressed", "false");
  activeGlyph = button || null;
  if (button) button.setAttribute("aria-pressed", "true");
  const box = document.getElementById("inspector");
  box.hidden = false;
  document.getElementById("inspectorChar").textContent = ch;
  document.getElementById("inspectorCode").textContent = codeOf(ch);
  document.getElementById("inspectorStatus").textContent = "Copied " + ch;
  document.getElementById("putOnPlate").dataset.char = ch;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ch).catch(() => {
      document.getElementById("inspectorStatus").textContent = ch + "  ·  " + codeOf(ch);
    });
  }
}

function plainPaste(event) {
  event.preventDefault();
  const text = (event.clipboardData.getData("text/plain") || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  document.execCommand("insertText", false, text.slice(0, 160));
}

function openCity() {
  if (new URLSearchParams(location.search).get("t")) return;
  const cities = PRESETS.filter((preset) => preset.city);
  const preset = cities[Math.floor(Math.random() * cities.length)];
  writeSign(preset.text);
  setInk(preset.ink);
}

function readQuery() {
  const params = new URLSearchParams(location.search);
  const text = params.get("t");
  const ink = params.get("ink");
  if (text) {
    writeSign(text);
    markTyped();
  }
  if (ink && ["noir", "rouge", "brick", "cislo", "paper"].includes(ink)) setInk(ink);
  if (params.get("ss01") === "1") {
    ss01.setAttribute("aria-pressed", "true");
    document.body.dataset.ss01 = "on";
  }
}

editor.addEventListener("paste", plainPaste);
editor.addEventListener("input", () => {
  const text = readSign();
  if (text.length > 160) writeSign(text.slice(0, 160));
  markTyped();
  flagMissing();
  fit();
});
editor.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && ["b", "i", "u"].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});

const handheld = window.matchMedia("(pointer: coarse), (max-width: 1024px)");
const typeSign = document.getElementById("typeSign");
let plateOpen = true;

function closePlate() {
  plateOpen = false;
  editor.setAttribute("contenteditable", "false");
  editor.setAttribute("inputmode", "none");
  editor.setAttribute("aria-readonly", "true");
  editor.setAttribute("tabindex", "-1");
  typeSign.hidden = false;
  typeSign.setAttribute("aria-pressed", "false");
  document.documentElement.classList.add("plate-locked");
}

function openPlate() {
  plateOpen = true;
  editor.setAttribute("contenteditable", "true");
  editor.removeAttribute("inputmode");
  editor.setAttribute("aria-readonly", "false");
  editor.removeAttribute("tabindex");
  typeSign.hidden = false;
  typeSign.setAttribute("aria-pressed", "true");
  document.documentElement.classList.remove("plate-locked");
  editor.focus();
}

function desktopPlate() {
  plateOpen = true;
  editor.setAttribute("contenteditable", "true");
  editor.removeAttribute("inputmode");
  editor.removeAttribute("aria-readonly");
  editor.removeAttribute("tabindex");
  typeSign.hidden = true;
  typeSign.setAttribute("aria-pressed", "false");
  document.documentElement.classList.remove("plate-locked");
}

function syncPlate() {
  if (handheld.matches) closePlate();
  else desktopPlate();
}

typeSign.addEventListener("click", () => {
  if (typeSign.getAttribute("aria-pressed") === "true") {
    closePlate();
    editor.blur();
  } else {
    openPlate();
  }
});

editor.addEventListener("blur", (event) => {
  if (!handheld.matches) return;
  if (event.relatedTarget === typeSign) return;
  closePlate();
});

editor.addEventListener("pointerdown", (event) => {
  if (handheld.matches && !plateOpen) event.preventDefault();
});

stage.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".dock") || event.target.closest("button") || event.target.closest("a")) return;
  if (handheld.matches && !plateOpen) return;
  editor.focus();
});

handheld.addEventListener("change", syncPlate);
syncPlate();

document.querySelectorAll(".ink").forEach((button) => {
  button.addEventListener("click", () => setInk(button.dataset.ink));
});

[track, size, lead].forEach((input) => {
  input.addEventListener("input", () => {
    syncOutputs();
    fit();
  });
});

ss01.addEventListener("click", () => {
  const on = ss01.getAttribute("aria-pressed") !== "true";
  ss01.setAttribute("aria-pressed", on ? "true" : "false");
  document.body.dataset.ss01 = on ? "on" : "off";
});

document.querySelectorAll(".poster, .place").forEach((poster) => {
  poster.addEventListener("click", () => {
    applyPreset({ text: poster.dataset.text, ink: poster.dataset.ink }, true);
    selectGlyph(poster.dataset.text, null);
  });
});

function republicYear(now) {
  const year = now.getFullYear();
  const today = new Date(year, now.getMonth(), now.getDate());
  const events = REPUBLIC
    .map((event) => {
      const date = new Date(year, event.month - 1, event.day);
      return { ...event, date, calendarYear: year };
    })
    .filter((event) => event.date.getMonth() === event.month - 1)
    .sort((a, b) => a.date - b.date);
  let marked = false;
  events.forEach((event) => {
    if (event.date < today) event.status = "past";
    else if (event.date.getTime() === today.getTime()) event.status = "today";
    else if (!marked) {
      event.status = "next";
      marked = true;
    } else event.status = "ahead";
  });
  return events;
}

function formatRepublic(event, withYear) {
  const day = event.date.getDate() + " " + MONTHS[event.date.getMonth()];
  return (withYear ? day + " " + event.calendarYear : day) + " · " + event.name;
}

function paintRepublic() {
  const events = republicYear(new Date());
  const next = events.find((event) => event.status === "next" || event.status === "today");
  document.querySelectorAll("[data-republic-short]").forEach((node) => {
    if (!next) {
      node.hidden = true;
      return;
    }
    const word = next.status === "today" ? "Today" : "Next event";
    const label = formatRepublic(next, false);
    node.hidden = false;
    node.textContent = word + " · " + next.date.getDate() + " " + MONTHS[next.date.getMonth()].slice(0, 3);
    node.title = label;
    node.setAttribute("aria-label", word + ", " + label);
  });
  document.querySelectorAll("[data-republic-line]").forEach((node) => {
    const row = node.closest("[data-republic-spec]");
    if (!next) {
      if (row) row.hidden = true;
      return;
    }
    node.textContent = formatRepublic(next, true);
    if (row) row.hidden = false;
  });
  document.querySelectorAll("[data-republic-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
  const labels = { past: "Passed", today: "Today", next: "Next", ahead: "Ahead" };
  document.querySelectorAll("[data-republic-list]").forEach((list) => {
    list.replaceChildren();
    events.forEach((event) => {
      const item = document.createElement("li");
      item.className = "is-" + event.status;
      const date = document.createElement("span");
      date.className = "year-date live-type";
      date.textContent = event.date.getDate() + ". " + (event.date.getMonth() + 1) + ".";
      const copy = document.createElement("span");
      copy.className = "year-copy";
      const when = document.createElement("span");
      when.className = "year-when";
      when.textContent = labels[event.status] + " · " + event.year;
      const name = document.createElement("span");
      name.className = "year-name";
      name.textContent = event.name;
      copy.append(when, name);
      item.append(date, copy);
      list.append(item);
    });
  });
}

document.getElementById("putOnPlate").addEventListener("click", () => {
  const ch = document.getElementById("putOnPlate").dataset.char || "A";
  applyPreset({ text: ch, ink: stage.dataset.ink }, true);
});

document.getElementById("copyCss").addEventListener("click", async () => {
  const css = document.getElementById("cssSnippet").textContent;
  const button = document.getElementById("copyCss");
  try {
    await navigator.clipboard.writeText(css);
    button.textContent = "Copied";
  } catch (err) {
    button.textContent = "Select the CSS";
  }
  setTimeout(() => {
    button.textContent = "Copy CSS";
  }, 1400);
});

function watchDrawing() {
  const el = document.getElementById("drawing");
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function place() {
    if (reduce.matches) {
      el.style.setProperty("--h", "1");
      el.style.setProperty("--drift", "0px");
      return;
    }
    const rect = el.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const t = Math.min(1, Math.max(0, (view - rect.top) / (view + rect.height)));
    const grow = Math.min(1, Math.max(0, (t - 0.08) / 0.42));
    const eased = 1 - Math.pow(1 - grow, 3);
    el.style.setProperty("--h", (0.08 + 0.92 * eased).toFixed(4));
    el.style.setProperty("--drift", ((0.5 - t) * 42).toFixed(2) + "px");
  }

  placeDrawing = place;
  place();
  window.addEventListener("scroll", place, { passive: true });
  window.addEventListener("resize", place);
  reduce.addEventListener("change", place);
}

function watchSections(getY) {
  const items = [...document.querySelectorAll(".nav-links a, .nav-download")].map((link) => {
    const section = document.getElementById(link.getAttribute("href").slice(1));
    return section ? { link, section } : null;
  }).filter(Boolean);
  const line = 88;

  function mark() {
    if (!items.length) return;
    let current = items[0];
    items.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= line) current = item;
    });
    const limit = document.documentElement.scrollHeight - window.innerHeight - 4;
    if (getY() >= limit) current = items[items.length - 1];
    items.forEach((item) => {
      const on = item === current;
      item.link.classList.toggle("is-on", on);
      if (on) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
  }

  mark();
  return mark;
}

function tuneNav(getY, subscribe) {
  const nav = document.querySelector(".nav");
  const markSection = watchSections(getY);
  window.addEventListener("resize", markSection);
  let last = getY();
  let intent = 0;
  const stopScroll = subscribe(() => {
    markSection();
    const y = getY();
    const delta = y - last;
    last = y;
    if (y < 16) {
      nav.classList.remove("is-min");
      intent = 0;
      return;
    }
    if (Math.abs(delta) < 0.4) return;
    if (Math.sign(delta) !== Math.sign(intent)) intent = 0;
    intent += delta;
    if (intent > 36) nav.classList.add("is-min");
    else if (intent < -36) nav.classList.remove("is-min");
  });
  return () => {
    stopScroll();
    window.removeEventListener("resize", markSection);
  };
}

function watchReveals() {
  const nodes = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
  nodes.forEach((node) => observer.observe(node));
}

function startMotion() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  root.dataset.booted = "1";
  const loader = document.getElementById("loader");
  const begun = performance.now();

  function armScroll() {
    const phone = window.matchMedia("(max-width: 768px)");
    let unbindNav = null;

    function unbind() {
      if (unbindNav) unbindNav();
      unbindNav = null;
    }

    function useNative() {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      unbind();
      unbindNav = tuneNav(() => window.scrollY, (fn) => {
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
      });
    }

    function useLenis() {
      if (lenis) return;
      unbind();
      lenis = new Lenis({
        autoRaf: true,
        anchors: false,
        duration: 1.2,
        easing: (t) => 1 - Math.pow(3, -10 * t),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        syncTouch: false
      });
      lenis.on("scroll", () => placeDrawing());
      unbindNav = tuneNav(() => lenis.animatedScroll, (fn) => lenis.on("scroll", fn));
    }

    function sync() {
      if (reduce || typeof Lenis !== "function" || phone.matches) useNative();
      else useLenis();
    }

    document.addEventListener("click", (event) => {
      if (!lenis) return;
      const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -84 });
    });

    phone.addEventListener("change", sync);
    sync();
  }

  function open() {
    watchReveals();
    if (reduce) {
      if (loader) loader.remove();
      root.classList.remove("is-loading");
      armScroll();
      return;
    }
    root.classList.remove("is-loading");
    root.classList.add("is-on");
    if (loader) {
      loader.classList.add("is-leave");
      loader.addEventListener("transitionend", () => loader.remove(), { once: true });
    }
    armScroll();
  }

  let opened = false;
  const reveal = open;
  function openOnce() {
    if (opened) return;
    opened = true;
    reveal();
  }

  const wait = () => {
    const hold = reduce ? 0 : Math.max(0, 1050 - (performance.now() - begun));
    setTimeout(openOnce, hold);
  };

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(wait);
  else window.addEventListener("load", wait);
  setTimeout(wait, 1800);
}

let motionStarted = false;
function startMotionOnce() {
  if (motionStarted) return;
  motionStarted = true;
  startMotion();
}

new ResizeObserver(() => fit()).observe(stage);

watchDrawing();
paintRepublic();
buildRail();
startMotionOnce();
buildGlyphs();
openCity();
readQuery();
syncOutputs();
flagMissing();
fit();
