# Features

What a visitor can do, and what `scripts/verify.sh` checks for each. Run it after any change: it builds the site,
serves `dist/` with `vite preview`, loads every route in headless Chrome (English and Japanese) and exits non-zero
when any item is broken. Screenshots land in `verify-out/` (not committed).

| Feature | Where | Checked by verify.sh |
| --- | --- | --- |
| Overview | `#/`, empty hash, unknown route | overview shown, no chapter open |
| Contents list opens each chapter | `nav` at the top, links `#/<chapter>` | 7 links in reading order on every page; the open chapter is marked `aria-current` |
| Pipeline diagram on every chapter | top of `#/<chapter>`: Camera → Image → Detector → Heatmap → Peak pick → Coordinates → mAP, one hue per part type, legend once | exactly one node lit; caption names the chapter; Back/Next open the chapters before and after (wrapping); Play present; not on the overview |
| One chapter per screen | `#/<chapter>` | that chapter alone in `main`; all 7 routes show 7 different titles |
| How big is one pixel? | `#/camera` | title, a table or control |
| Classical or learned? | `#/detect` | title, a table or control |
| Ask for a coordinate | `#/keypoints` | title, SVG plot |
| What mAP sees | `#/map` | title, SVG box overlap |
| Max-pool is the NMS | `#/peaks` | title, SVG peak grid |
| Same detector, real photos | `#/real` | title, a table or control |
| Shrink the detector | `#/int8` | title, a table or control |
| English / Japanese | header buttons, browser language | every chapter title differs between `en` and `ja` |
| Phone width | 390 px | no sideways page scroll on the overview or any chapter, either language |
| No runtime errors | whole page | no console errors in either language |

Chrome: `google-chrome` or `chromium` on PATH, the Windows Chrome under WSL, or `CHROME=/path/to/chrome`.
