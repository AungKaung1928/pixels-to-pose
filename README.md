# Pixels to Pose

An interactive walk through a robot perception pipeline, from camera pixels to object pose, with measured accuracy and latency at each stage. English and Japanese.

Status: two chapters built, **How big is one pixel?** (pinhole camera, pixel size vs sub-pixel accuracy) and **Shrink the detector** (fp32 vs INT8 static/dynamic vs channel pruning: mAP, one- and four-thread latency, size). Planned: classical vs learned detection, keypoint heads, detection and NMS.

- Every number comes from a measured result in one of the author's repositories, cited on the page. Sources: [mujoco-cube-pose-cnn](https://github.com/AungKaung1928/mujoco-cube-pose-cnn) (camera and pose errors) and [mujoco-clutter-detect](https://github.com/AungKaung1928/mujoco-clutter-detect) results table (simulated cluttered table, 2000 validation images, model time on one idle x86 CPU, not a Jetson).
- Content lives in `src/content/`; `src/content/int8.test.ts` checks the numbers the text relies on.

```
npm ci
npm run lint && npm test && npm run build
npm run dev
```

MIT licence.
