# valorant-list

I made this web application for myself and for friends in the community. I hope it helps more people get to know and love the Valorant community. Thank you guys for watching 🙌

---

## ⚠️ Disclaimer

This project is created for **educational and demonstration purposes only**.

* This application is **not intended for commercial use** and does **not generate any profit**.
* All data used in this project is sourced from a public API:
  https://valorant-api.com/
* This project is **not affiliated with or endorsed by Riot Games or Valorant**.

### 📌 Data Usage

* All images, names, and in-game content belong to their respective owners.
* The API data is used strictly for **learning, testing, and showcasing development skills**.

### 📌 Legal Notice

* This project does **not claim ownership** of any game-related assets.
* If any content violates copyright or usage policies, it will be removed upon request.

---

## 🚀 Purpose of this project

* Practice working with APIs
* Learn how to structure and display game data
* Build a portfolio project for development skills

---

## 🛠️ Tech Stack

* Frontend: Next.js 16 (App Router) · React 19 · Tailwind CSS v4
* 3D: Three.js — paper-confetti hero, interactive 3D viewer for weapons/skins/agents/ranks/cosmetics, 3D tactical map with callouts
* API: Valorant Public API (`th-TH` / `en-US` picked from the URL), fetched once at build time
* Hosting: fully static export (`out/`) — every page is a plain file, so Cloudflare Pages can serve it without limits

### Pages

Every route lives under a language prefix: `/th/...` or `/en/...` (e.g. `/th/agents`). Opening `/` or an old link without a prefix redirects to the language picked last time (Thai by default).

| Route | Content |
| --- | --- |
| `/` | 3D hero, stats, roles, maps, arsenal 3D viewer, ranks, latest bundles |
| `/agents`, `/agents/[uuid]` | Role filter + search; 3D portrait, abilities with keybinds, voice line, role info |
| `/maps`, `/maps/[uuid]` | Competitive / other maps; 3D tactical map with callout pins & zone filter, artwork |
| `/weapons`, `/weapons/[uuid]` | Stats, damage by range + shots-to-kill, skins by tier, chromas, upgrade-level videos, armor |
| `/ranks` | 3D rank emblem, all tiers, episode/act timeline |
| `/bundles` | All store bundles with promo art |
| `/collection`, `/collection/[type]` | Player cards, sprays, gun buddies, titles (3D inspect) |
| `/modes` | Game modes & currencies |
| `/battlepass`, `/battlepass/[uuid]` | Every act's battle pass and event passes: rewards per tier, free track, highlights, total XP |
| `/share` | Make a shareable "my main" card (PNG download / native share / link) |
| `/play` | Mini games: Aim Rush (30-second aim trainer) and Spike Beat (`/play/beat`, an Audition-style WASD rhythm game with synthesized keyboard sounds) |

Other features: Thai / English switch (UI text and API data), grid or list view for agents, newest/oldest/A–Z sorting for bundles, skins and collectibles, and skeleton loading screens on every page.

### Run locally

```bash
cd frontend
npm install
npm run dev
```

Set `VALORANT_API_BASE` to point at a different API base URL (defaults to `https://valorant-api.com/v1`).

### Build & deploy (Cloudflare Workers)

```bash
cd frontend
npm run build      # writes the whole site to frontend/out
npx wrangler deploy  # serves frontend/out as static assets (frontend/wrangler.jsonc)
```

Cloudflare dashboard (Workers Builds, connected to this repo): root directory `frontend`, build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` redeploys. Live at https://valo.rosekorn.com.

* The data is baked in at build time. `.github/workflows/rebuild.yml` rebuilds and deploys every day once the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets are set.
* If valorant-api.com is down during a build, the build fails on purpose so the last good deploy stays online.
* Image proxy: `frontend/worker/index.ts` serves `/api/media` from the same Worker. The share card and 3D viewer use it only when an image from media.valorant-api.com fails to load because of CORS. Real files are served straight from static assets and never run the Worker.

---

## 🙏 Credits

* Valorant API provider
* Riot Games for creating Valorant

---

## 💬 Note

This project may contain incomplete or inconsistent data due to limitations of the public API.
