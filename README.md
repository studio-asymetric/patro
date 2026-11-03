# Patro

Patro is an open-source typeface reconstructed from Czechoslovak enamel street and house signs of the late 1920s and 1930s. Designed by Dalibor Itze in 2022. Published by [Studio Asymetric](https://asymetric.studio).

The specimen site lets you type a sign, switch enamel colours, and download the font.

**Live:** https://patro.asymetric.studio

## Download

| File | Use |
| --- | --- |
| [`download/Patro.zip`](download/Patro.zip) | TTF, WOFF2, license, readme |
| [`download/Patro-TTF.zip`](download/Patro-TTF.zip) | Desktop font, license, readme |
| [`download/Patro-WOFF2.zip`](download/Patro-WOFF2.zip) | Web font, license, readme |

```css
@font-face {
  font-family: "Patro";
  src: url("Patro.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

OpenType feature `ss01` swaps in alternate drawings of N, Q, Ň, and &.

## License

The font is free under the [SIL Open Font License 1.1](OFL.txt). You can use, study, modify, and embed it. The name **Patro** is reserved: a modified version needs a different name.

The website code is MIT. See [LICENSE](LICENSE).

Version 1.001 is the 2022 drawing (1.000) with the open-source license written into the font. The outlines are unchanged.

## Preview locally

From this folder:

```bash
python -m http.server 4173
```

Open http://127.0.0.1:4173

## Deploy on Coolify (GitHub App)

The repo is a static site. Coolify builds the Dockerfile and nginx serves it on port 80. No database, no environment variables, no volume.

1. In Coolify, add an application from the GitHub App: `studio-asymetric/patro`, branch `main`.
2. Build pack: **Dockerfile**. Port: **80**.
3. Domain: `patro.asymetric.studio`. Enable HTTPS (Let’s Encrypt).
4. Turn on auto-deploy.

### DNS (Wedos)

Add a specific A record so this name does not follow the old wildcard:

| Type | Host | Target |
| --- | --- | --- |
| A | `patro` | `157.90.175.53` |

The zone still has a legacy wildcard `* → 185.8.237.22`. A specific `patro` record overrides it. Without that record, the name keeps pointing at the old server.

## Credits

Dalibor Itze, for professor Erik Faulhaber, Schrift und Typografie.

Interface set in [Geist](https://vercel.com/font), also under the SIL Open Font License.
