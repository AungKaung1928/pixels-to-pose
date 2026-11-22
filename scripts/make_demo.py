"""Build docs/media/demo.gif: the overview, then the seven chapters in order, from the screenshots
scripts/verify.sh writes to verify-out/ (real pages in headless Chrome at 1280 px). Run verify.sh first.
Needs Pillow. Same input screenshots give the same GIF."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ["overview", "camera", "detect", "keypoints", "map", "peaks", "real", "int8"]
CROP = (140, 0, 1140, 700)  # page column: header, contents, pipeline strip, chapter title
WIDTH = 800
HOLD_MS = {"overview": 1800}  # every chapter frame: 1200 ms


def main() -> None:
    frames = []
    for name in FRAMES:
        im = Image.open(ROOT / "verify-out" / f"{name}.png").convert("RGB").crop(CROP)
        im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        # method 0, dither 0 = median cut, no dither (numeric: Pillow 9 has no Image.Quantize enum)
        frames.append(im.quantize(colors=128, method=0, dither=0))
    out = ROOT / "docs" / "media" / "demo.gif"
    out.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        out,
        save_all=True,
        append_images=frames[1:],
        duration=[HOLD_MS.get(n, 1200) for n in FRAMES],
        loop=0,
        optimize=True,
    )
    print(f"{out.relative_to(ROOT)}: {len(frames)} frames, {out.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
