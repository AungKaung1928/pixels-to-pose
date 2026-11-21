# Pixels to Pose

An interactive walk through a robot perception pipeline, from camera pixels to object pose, with measured accuracy and latency at each stage. English and Japanese.

Status: five chapters built, **How big is one pixel?** (pinhole camera, pixel size vs sub-pixel accuracy), **Classical or learned?** (pick the cheapest method that meets an accuracy target), **Ask for a coordinate, get a coordinate** (argmax vs spatial soft-argmax), **What mAP sees that AP50 does not** (IoU thresholds under a box shift) and **Shrink the detector** (fp32 vs INT8 static/dynamic vs channel pruning: mAP, one- and four-thread latency, size).

- Every number comes from a measured result in one of the author's repositories, cited on the page. Sources: [mujoco-cube-pose-cnn](https://github.com/AungKaung1928/mujoco-cube-pose-cnn) (camera and pose errors) and [mujoco-clutter-detect](https://github.com/AungKaung1928/mujoco-clutter-detect) results table (simulated cluttered table, 2000 validation images, model time on one idle x86 CPU, not a Jetson).
- Content lives in `src/content/`; `src/content/*.test.ts` and `src/lib/*.test.ts` check the numbers the text relies on.

## Run locally

Needs Node.js 20.19+ or 22.12+ and npm.

```bash
git clone <this repo URL>
cd pixels-to-pose
npm ci          # first time only
npm run dev     # then open http://localhost:5173
```

Only when changing the code:

```bash
npm run lint
npm test        # unit tests: the numbers the text relies on
npm run build   # type check + static build into dist/
```

MIT licence.
