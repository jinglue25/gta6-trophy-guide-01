# Leonida Ledger — GTA VI Trophy Guide & Tracker
[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![排名](https://make.fun/badge/gta6-trophy-guide-01/jinglue25/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![奖励](https://make.fun/badge/gta6-trophy-guide-01/jinglue25/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An independent field guide for all 55 PS5 trophies, with an original navy and coral interface built entirely from HTML and CSS. The tracker saves earned trophies and manual counters on your device. Export and import JSON backups, search official names and requirements, filter by kind or grade, and hide unearned story spoilers. An eight-stage roadmap and a dedicated missables page organize the journey, with a cited guide for every trophy.

This is an unofficial fan-made guide. It contains no Rockstar Games logo, artwork or screenshots. Trophy names and descriptions are the official PlayStation ones supplied in the starter. Guide texts are original and cite their sources; they are written only from the official descriptions and are not yet verified in-game. Source links name Exophase and PSNProfiles without fetching either site. Ambiguous requirements remain unresolved, and planning inferences are identified. Only Actions Speak Louder is marked as a choice-based missable risk; story trophies carry checkpoint cautions.

Run locally with `node serve.ts`, then open `http://localhost:8080`. Node 22 is required; there is no build step or dependency installation. All app resources are local, with no external fonts, images or runtime requests to external services. Source links load only when clicked. Progress stays in this browser; keep an export for a portable backup. Numeric counters are manual notes and do not automatically mark trophies earned. Platinum completes when the other 54 trophies are marked earned.

Hand in with `MAKEFUN_OUTPUT_DIR=<dir> node main.ts`. The entry copies `app/` and `screenshots/` and uses the untouched kit vendor to build `dossier.json`. Run `node verify.mjs` for data, roadmap, screenshot and optional vendor checks. Set `KIT_VENDOR` to a reference vendor file to compare its SHA-256.

Preview parameters: `?view=checklist|roadmap|missables`, `?open=<id>`, `?spoilers=on|off` (on means hide story spoilers), and `?seed=<n>`. Seeded progress follows roadmap order and stays in memory, including subsequent edits and imports; it never overwrites saved progress.

`shots.json` defines four 1280 × 800 previews. A later capture session can run `CHROME_PATH=<chrome-headless-shell> PW_ENTRY=<playwright-module> node capture.mjs`. The capture script opens no server or listening socket: browser requests to its virtual origin are fulfilled from disk, and other origins are aborted. It removes the three starter screenshots only when run. Screenshot capture has deliberately been left to that later session.
