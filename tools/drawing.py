"""Build the outline-and-handles drawing from the Patro outlines."""

from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

FONT = "fonts/Patro.ttf"
LETTERS = "Patro"


def contours_of(font, char):
    glyph_set = font.getGlyphSet()
    name = font.getBestCmap()[ord(char)]
    pen = DecomposingRecordingPen(glyph_set)
    glyph_set[name].draw(pen)
    contours = []
    start = last = None
    contour = None
    for op, pts in pen.value:
        if op == "moveTo":
            start = last = pts[0]
            contour = {"cmds": [("M", start)], "ons": [start], "handles": []}
        elif op == "lineTo":
            end = pts[0]
            contour["cmds"].append(("L", end))
            contour["ons"].append(end)
            last = end
        elif op == "qCurveTo":
            raw = list(pts)
            end = start if raw[-1] is None else raw[-1]
            offs = raw[:-1] if raw[-1] is not None else raw[:-1]
            if raw[-1] is None:
                offs = raw[:-1]
            current = last
            for index, off in enumerate(offs):
                if index < len(offs) - 1:
                    nxt = offs[index + 1]
                    dest = ((off[0] + nxt[0]) / 2, (off[1] + nxt[1]) / 2)
                else:
                    dest = end
                c1 = (current[0] + (2 / 3) * (off[0] - current[0]), current[1] + (2 / 3) * (off[1] - current[1]))
                c2 = (dest[0] + (2 / 3) * (off[0] - dest[0]), dest[1] + (2 / 3) * (off[1] - dest[1]))
                contour["cmds"].append(("C", c1, c2, dest))
                contour["handles"].append((current, c1))
                contour["handles"].append((dest, c2))
                if dest != end or index == len(offs) - 1:
                    contour["ons"].append(dest)
                current = dest
            last = end
        elif op == "closePath":
            contours.append(contour)
            contour = None
    return contours


def num(value):
    return f"{value:.1f}".rstrip("0").rstrip(".")


def main():
    font = TTFont(FONT)
    radius = 7.5
    node = 13
    gap = 210
    pad = 96
    letters = []
    cursor = 0
    all_x = []
    all_y = []
    for char in LETTERS:
        drawn = contours_of(font, char)
        width = font.getGlyphSet()[font.getBestCmap()[ord(char)]].width
        letters.append((char, drawn, cursor, width))
        for contour in drawn:
            for point in contour["ons"]:
                all_x.append(point[0] + cursor)
                all_y.append(point[1])
            for anchor, control in contour["handles"]:
                all_x.append(control[0] + cursor)
                all_y.append(control[1])
        cursor += width + gap

    min_x = min(all_x) - pad
    max_x = max(all_x) + pad
    min_y = min(all_y) - pad
    max_y = max(all_y) + pad

    def X(x):
        return x - min_x

    def Y(y):
        return max_y - y

    width = max_x - min_x
    height = max_y - min_y
    paths = []
    handles = []
    nodes = []
    seen = set()

    for _char, drawn, origin, _width in letters:
        parts = []
        for contour in drawn:
            for cmd in contour["cmds"]:
                if cmd[0] == "M":
                    parts.append(f"M{num(X(cmd[1][0] + origin))} {num(Y(cmd[1][1]))}")
                elif cmd[0] == "L":
                    parts.append(f"L{num(X(cmd[1][0] + origin))} {num(Y(cmd[1][1]))}")
                else:
                    _kind, c1, c2, dest = cmd
                    parts.append(
                        "C{0} {1} {2} {3} {4} {5}".format(
                            num(X(c1[0] + origin)), num(Y(c1[1])),
                            num(X(c2[0] + origin)), num(Y(c2[1])),
                            num(X(dest[0] + origin)), num(Y(dest[1])),
                        )
                    )
            parts.append("Z")
            for anchor, control in contour["handles"]:
                ax, ay = X(anchor[0] + origin), Y(anchor[1])
                cx, cy = X(control[0] + origin), Y(control[1])
                dx, dy = cx - ax, cy - ay
                if dx * dx + dy * dy < 4:
                    continue
                xs = [ax, cx, cx - radius, cx + radius]
                ys = [ay, cy, cy - radius, cy + radius]
                minx, maxx = min(xs), max(xs)
                miny, maxy = min(ys), max(ys)
                ox = (ax - minx) / (maxx - minx) * 100
                oy = (ay - miny) / (maxy - miny) * 100
                handles.append(
                    '<g class="draw-handle" style="--ox:{ox:.2f}%;--oy:{oy:.2f}%">'
                    '<line x1="{ax}" y1="{ay}" x2="{cx}" y2="{cy}" />'
                    '<circle cx="{cx}" cy="{cy}" r="{r}" />'
                    "</g>".format(
                        ox=ox, oy=oy,
                        ax=num(ax), ay=num(ay), cx=num(cx), cy=num(cy), r=num(radius),
                    )
                )
            for point in contour["ons"]:
                key = (round(point[0] + origin, 1), round(point[1], 1))
                if key in seen:
                    continue
                seen.add(key)
                px, py = X(point[0] + origin), Y(point[1])
                nodes.append(
                    '<rect class="draw-node" x="{x}" y="{y}" width="{s}" height="{s}" />'.format(
                        x=num(px - node / 2), y=num(py - node / 2), s=num(node)
                    )
                )
        paths.append(f'<path class="draw-letter" d="{" ".join(parts)}" />')

    svg = (
        f'<svg class="drawing-svg" viewBox="0 0 {num(width)} {num(height)}" role="img" '
        'aria-label="Patro drawn as outlines, with anchor points and curve handles.">'
        f'<g class="draw-paths">{"".join(paths)}</g>'
        f'<g class="draw-rig">{"".join(handles)}{"".join(nodes)}</g>'
        "</svg>"
    )
    out = __import__("pathlib").Path("tools/drawing.svg")
    out.write_text(svg, encoding="utf-8")
    print(f"{len(handles)} handles, {len(nodes)} points, viewBox {width:.0f} {height:.0f}, {out.stat().st_size} bytes")


if __name__ == "__main__":
    main()
