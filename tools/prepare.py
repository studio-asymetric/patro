"""Build the open-source Patro release files from the 2022 drawings.

The outlines are not redesigned. This adds the SIL OFL to the name table,
writes WOFF2, the download zip, icons, and the social image.
"""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\ASUS\Desktop\design\patro.asymetric.studio")
SRC_TTF = Path(
    r"C:\Users\ASUS\Desktop\design\[ DONE ]\2025\Portfolio 2020-2025\Typolab\fonts\Patro.ttf"
)
SAMPLE_OFL = ROOT / "fonts" / "OFL-sample.txt"
ASSETS = Path(
    r"C:\Users\ASUS\.cursor\projects\c-Users-ASUS-Desktop-design-DONE-2025-Portfolio-2020-2025-Typolab\assets"
)

HEADER = """Copyright 2022 Dalibor Itze (https://asymetric.studio),
with Reserved Font Name Patro.

"""


def write_ofl() -> None:
    body = SAMPLE_OFL.read_text(encoding="utf-8")
    start = body.index("This Font Software is licensed under the SIL Open Font License")
    text = HEADER + body[start:]
    if not text.endswith("\n"):
        text += "\n"
    (ROOT / "fonts" / "OFL.txt").write_text(text, encoding="utf-8")
    (ROOT / "OFL.txt").write_text(text, encoding="utf-8")


def set_name(name, name_id: int, text: str) -> None:
    name.setName(text, name_id, 3, 1, 0x409)
    name.setName(text, name_id, 1, 0, 0)


def build_font() -> tuple[Path, Path]:
    font = TTFont(SRC_TTF)
    if "DSIG" in font:
        del font["DSIG"]
    name = font["name"]
    set_name(
        name,
        0,
        "Copyright 2022 Dalibor Itze. Licensed under the SIL Open Font License, Version 1.1.",
    )
    set_name(name, 5, "Version 1.001")
    set_name(name, 8, "Studio Asymetric")
    set_name(name, 9, "Dalibor Itze")
    set_name(name, 11, "https://patro.asymetric.studio")
    set_name(name, 12, "https://asymetric.studio")
    set_name(
        name,
        13,
        "This Font Software is licensed under the SIL Open Font License, Version 1.1. "
        "This license is available with a FAQ at https://openfontlicense.org",
    )
    set_name(name, 14, "https://openfontlicense.org")

    ttf_path = ROOT / "fonts" / "Patro.ttf"
    woff_path = ROOT / "fonts" / "Patro.woff2"
    font.save(ttf_path)
    font.flavor = "woff2"
    font.save(woff_path)
    return ttf_path, woff_path


def build_zip(ttf: Path, woff: Path) -> None:
    out_dir = ROOT / "download"
    out_dir.mkdir(parents=True, exist_ok=True)
    readme = """Patro
Enamel sign typeface

Designed by Dalibor Itze, 2022.
Published by Studio Asymetric, 2026.
https://patro.asymetric.studio

License: SIL Open Font License, Version 1.1 (OFL.txt).
Reserved Font Name: Patro.

Version 1.001 (2026) — released under the Open Font License. Drawings unchanged from 1.000.
Version 1.000 (2022) — first complete alphabet, reconstructed from Czechoslovak enamel signs.

Install
- Windows: right-click Patro.ttf and choose Install, or Install for all users.
- macOS: double-click Patro.ttf and choose Install Font.
- Web: use Patro.woff2.

@font-face {
  font-family: "Patro";
  src: url("Patro.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
"""
    zip_path = out_dir / "Patro.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(ttf, "Patro/Patro.ttf")
        zf.write(woff, "Patro/Patro.woff2")
        zf.write(ROOT / "fonts" / "OFL.txt", "Patro/OFL.txt")
        zf.writestr("Patro/README.txt", readme.replace("\n", "\r\n"))
    print("zip", zip_path.stat().st_size)


def rel_luminance(hex_color: str) -> float:
    hex_color = hex_color.lstrip("#")
    channels = []
    for i in range(0, 6, 2):
        c = int(hex_color[i : i + 2], 16) / 255
        channels.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = channels
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: str, b: str) -> float:
    l1, l2 = rel_luminance(a), rel_luminance(b)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def render_images(ttf: Path) -> None:
    cream = "#f3efe6"
    black = "#141413"
    face_big = ImageFont.truetype(str(ttf), 248)
    face_sm = ImageFont.truetype(str(ttf), 36)

    og = Image.new("RGB", (1200, 630), black)
    draw = ImageDraw.Draw(og)
    grid = "#2a2a28"
    for x in range(0, 1200, 70):
        draw.line([(x, 0), (x, 630)], fill=grid)
    for y in range(0, 630, 70):
        draw.line([(0, y), (1200, y)], fill=grid)
    draw.text((600, 300), "PATRO", font=face_big, fill=cream, anchor="mm")
    draw.text((600, 500), "ENAMEL SIGN TYPE", font=face_sm, fill=cream, anchor="mm")
    og.save(ROOT / "og.jpg", quality=86, optimize=True)

    def icon(size: int, radius_ratio: float = 0.18) -> Image.Image:
        im = Image.new("RGB", (size, size), black)
        d = ImageDraw.Draw(im)
        # Keep the letter clear of the rounded mask the OS applies.
        font_size = int(size * 0.72)
        f = ImageFont.truetype(str(ttf), font_size)
        d.text((size / 2, size * 0.56), "P", font=f, fill=cream, anchor="mm")
        if radius_ratio:
            mask = Image.new("L", (size, size), 0)
            md = ImageDraw.Draw(mask)
            r = int(size * radius_ratio)
            md.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=255)
            im.putalpha(mask)
        return im

    icon(32, 0.22).save(ROOT / "favicon-32.png")
    icon(180, 0.18).convert("RGB").save(ROOT / "apple-touch-icon.png", quality=95)
    icon(512, 0.16).save(ROOT / "icon-512.png")

    proof_dir = Path(
        r"C:\Users\ASUS\AppData\Local\Cursor\AgentStores\cursor_agent_stores\f6987afc-beea-46e9-be54-b3f6779c1045\files"
    )
    og.save(proof_dir / "patro-og-proof.jpg", quality=80)
    detail = Image.new("RGB", (900, 360), black)
    dd = ImageDraw.Draw(detail)
    f2 = ImageFont.truetype(str(ttf), 120)
    dd.text((40, 40), "SCHÖNAUER", font=f2, fill=cream)
    dd.text((40, 180), "ÄÖßŘŤ", font=f2, fill=cream)
    detail.save(proof_dir / "patro-detail-proof.jpg", quality=85)


def save_studies() -> None:
    media = ROOT / "media"
    media.mkdir(parents=True, exist_ok=True)
    mapping = {
        "schonauer.jpg": "patro-brozura-EN10-scaled-1-7dd8f571-ac16-41a4-8eff-889bfed50091.jpg",
        "gelnica.jpg": "patro-cover-scaled-1.jpg-ae702864-e67f-4a16-abf6-24a030995286.webp",
    }
    for dest, src_name in mapping.items():
        im = Image.open(ASSETS / src_name).convert("RGB")
        im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        im.save(media / dest, quality=78, optimize=True)
        print(dest, im.size, (media / dest).stat().st_size)


def main() -> None:
    write_ofl()
    ttf, woff = build_font()
    print("ttf", ttf.stat().st_size)
    print("woff2", woff.stat().st_size)
    build_zip(ttf, woff)
    render_images(ttf)
    save_studies()
    pairs = [
        ("#f3efe6", "#141413"),
        ("#e23b2a", "#e6e0d4"),
        ("#c43224", "#e6e0d4"),
        ("#141413", "#e23b2a"),
        ("#141413", "#e7e1d6"),
        ("#1d4e89", "#f4f0e6"),
        ("#7a241c", "#e6e0d4"),
    ]
    for a, b in pairs:
        print(f"contrast {a} on {b}: {contrast(a, b):.2f}")
    sample = ROOT / "fonts" / "OFL-sample.txt"
    if sample.exists():
        sample.unlink()


if __name__ == "__main__":
    main()
