# Features

What a visitor can do, and what `scripts/verify.sh` checks for each. Run it after any change: it builds the site,
serves `dist/` with `vite preview`, loads the page in headless Chrome (English and Japanese) and exits non-zero on
the first broken item. Screenshots land in `verify-out/` (not committed).

| Feature | Where | Checked by verify.sh |
| --- | --- | --- |
| Contents list jumps to each chapter | `nav` at the top | every link has a target, every chapter has a link |
| How big is one pixel? | `#camera` | title, a table or control |
| Classical or learned? | `#detect` | title, a table or control |
| Ask for a coordinate | `#keypoints` | title, SVG plot |
| What mAP sees | `#map` | title, SVG box overlap |
| Max-pool is the NMS | `#peaks` | title, SVG peak grid |
| Same detector, real photos | `#real` | title, a table or control |
| Shrink the detector | `#int8` | title, a table or control |
| English / Japanese | header buttons, browser language | every chapter title differs between `en` and `ja` |
| Phone width | 390 px | no sideways page scroll in either language |
| No runtime errors | whole page | no console errors in either language |

Chrome: `google-chrome` or `chromium` on PATH, the Windows Chrome under WSL, or `CHROME=/path/to/chrome`.
