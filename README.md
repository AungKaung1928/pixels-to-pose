# Pixels to Pose

An interactive walk through a robot perception pipeline in seven chapters, from camera pixels to a scored pose, where every number is measured (for example: a 27k-parameter soft-argmax head finds the cube to 0.59 mm median error). English and Japanese.

<img src="docs/media/demo.gif" width="720" alt="The overview film strip, then each of the seven chapters in turn, with its stage lit in the pipeline strip">

## Quick start

Needs Node.js 22.12+ and npm (vitest 5 requires it; the build alone runs on 20.19+).

```bash
git clone <this repo URL>
cd pixels-to-pose
npm ci          # first time only
npm run dev     # open http://localhost:5173: the chapter overview, as a film strip
```

Checks, when changing the code:

```bash
npm run lint
npm test            # unit tests: the numbers the text relies on
scripts/verify.sh   # builds, then loads every chapter in headless Chrome (EN, JA, 390 px)
python3 scripts/make_demo.py   # rebuilds docs/media/demo.gif from those screenshots (Pillow)
```

## How it works

- Chapters: pixel size, classical vs learned, argmax vs soft-argmax, mAP vs AP50, max-pool as NMS, renders vs real photos, INT8 and pruning. `docs/FEATURES.md` lists what each one must show.
- Numbers live in `src/content/` and `src/lib/`, checked by vitest; overview cards, tables and readouts compute from them.
- One pipeline diagram (`src/content/pipeline.ts`) opens every chapter with its stage lit.

## Sources

Every number in the app comes from one of these; each chapter links its own.

- [mujoco-cube-pose-cnn](https://github.com/AungKaung1928/mujoco-cube-pose-cnn): camera setting, classical vs CNN errors, soft-argmax head.
- [mujoco-clutter-detect](https://github.com/AungKaung1928/mujoco-clutter-detect): detector, mAP shifts, real-photo gap, INT8 and pruning times.
- Levine et al. 2016, spatial softmax, [arXiv 1504.00702](https://arxiv.org/abs/1504.00702).
- Zhou et al. 2019, CenterNet (objects as points), [arXiv 1904.07850](https://arxiv.org/abs/1904.07850).

## License

MIT, see LICENSE.
