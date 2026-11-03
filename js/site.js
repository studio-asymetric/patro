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
  { ink: "brick", text: "AUSSTELLUNG DER\nTSCHECHOSLOWAKISCHEN\nINDUSTRIE", place: "Exhibition wall", name: "Industrie" }
];

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
    stage.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function buildRail() {
  PRESETS.forEach((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini";
    button.dataset.ink = preset.ink;
    const lines = preset.text.split("\n");
    const longest = Math.max(...lines.map((line) => line.length));
    const px = Math.max(22, Math.min(52, 540 / longest));
    const text = document.createElement("span");
    text.className = "mini-text live-type";
    text.textContent = preset.text;
    text.style.fontSize = px + "px";
    const cap = document.createElement("span");
    cap.className = "mini-cap";
    cap.textContent = preset.place;
    button.append(text, cap);
    button.addEventListener("click", () => applyPreset(preset, true));
    rail.append(button);
  });
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

stage.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".dock") || event.target.closest("button") || event.target.closest("a")) return;
  editor.focus();
});

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

document.querySelectorAll(".poster").forEach((poster) => {
  poster.addEventListener("click", () => {
    applyPreset({ text: poster.dataset.text, ink: poster.dataset.ink }, true);
    selectGlyph(poster.dataset.text, null);
  });
});

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

new ResizeObserver(() => fit()).observe(stage);

buildRail();
buildGlyphs();
readQuery();
syncOutputs();
flagMissing();
fit();
