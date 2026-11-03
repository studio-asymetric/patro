from pathlib import Path

svg = Path("tools/drawing.svg").read_text(encoding="utf-8").strip()
html_path = Path("index.html")
html = html_path.read_text(encoding="utf-8")
section = """
    <section id="drawing" class="block drawing">
      <div class="sec-head">
        <p class="sec-kicker">03 — Drawing</p>
        <p class="sec-lead">P, a, t, r and o, the letters the signs actually gave. The points sit on the outline. The handles pull the curves.</p>
      </div>
      <div class="drawing-frame">
        {svg}
      </div>
    </section>

""".format(svg=svg)
start = html.find('    <section id="drawing"')
end = html.find('    <section id="letters"')
if start < 0 or end < 0 or end < start:
    raise SystemExit("drawing section missing")
html = html[:start] + section + html[end:]
html_path.write_text(html, encoding="utf-8")
print("replaced", len(svg))
