# Chandan Bagh — Portfolio

A responsive, static portfolio for cybersecurity, AI, 3D systems, and browser games. Built with HTML, CSS, and JavaScript; no local build step is required.

## Run locally

Serve this directory with any static HTTP server. For example:

```powershell
python -m http.server 3000
```

Then open <http://localhost:3000>.

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the static site whenever a commit is pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The published site URL will be:

`https://cbagh0819-ctrl.github.io/chandan-bagh-website/`

The portfolio itself is static. The Charlo chat has a local fallback on GitHub Pages; the optional serverless `/api/chat` endpoint requires a serverless host such as Vercel. Keep API keys in host environment variables and never commit `.env` files.

## Included pages and media

- `index.html` — portfolio
- `games.html` — game directory
- `assets/mr-perfect.mp3` — music played by the user-controlled Sound toggle
- `api/chat.js` — optional Vercel serverless chat endpoint (not executed by GitHub Pages)
