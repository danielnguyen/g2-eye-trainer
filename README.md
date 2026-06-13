# G2 Eye Trainer

Lightweight Even Realities G2 app for short visual focus and eye-movement exercises.

This is a proof-of-concept app. It is not a medical treatment, diagnostic tool, or vision therapy replacement.

## MVP goals

- Glasses-first visual target exercises.
- No backend.
- No network permission.
- No personal or health data storage.
- Fixed exercise values for the first version.
- Conservative motion and short sessions.

## Exercises

The MVP includes four fixed modes:

1. Steady Dot — fixation stability.
2. Horizontal Tracking — smooth pursuit left/right.
3. Vertical Tracking — smooth pursuit up/down.
4. Jump Focus — saccade/reacquisition practice.

The default guided session runs all four exercises for about two minutes.

## Controls

- Tap: start / pause / resume.
- Swipe up/down: change mode while idle.
- Double tap: reset to the home screen.

Keyboard simulator controls:

- Space / Enter: tap.
- ArrowUp / ArrowLeft: previous mode.
- ArrowDown / ArrowRight: next mode.
- Escape: reset.

## Safety guardrails

Stop if you feel pain, nausea, headache, or worsening double vision.

The MVP intentionally avoids:

- aggressive convergence forcing;
- rapid flashing visuals;
- high-speed movement;
- two-dot merge drills;
- medical claims.

## Development

```bash
npm install
npm run dev
```

Open the local Vite URL or scan with the Even Hub QR command:

```bash
npm run qr
```

## Packaging

`app.json` is intentionally local. Before packaging:

```bash
cp app.json.example app.json
```

Then pack:

```bash
npm run pack
```

The pack command increments the local manifest patch version, updates the visible app version, builds, and writes `g2-eye-trainer.ehpk`.

## Device validation checklist

1. App launches from the G2 menu.
2. The glasses show `Eye Trainer` and the current mode.
3. Tap starts / pauses / resumes.
4. Swipe up/down changes the selected mode while idle.
5. The guided session advances through all four exercises.
6. Dot motion is smooth and conservative.
7. The app works offline.
8. The packaged manifest has no network, microphone, camera, location, contacts, or health permissions.
