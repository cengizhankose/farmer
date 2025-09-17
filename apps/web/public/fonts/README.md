# Fonts Directory

Place `ClashDisplay-Variable.woff2` in this directory to enable the Clash Display font.

The font is referenced in `styles/globals.css` at:
```css
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/ClashDisplay-Variable.woff2') format('woff2-variations');
  font-weight: 200 700;
  font-style: normal;
  font-display: swap;
}
```

Until the font file is added, the system will fall back to the backup fonts defined in the CSS variable `--font-display`.