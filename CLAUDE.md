# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Pipedream Ventures website — simple static site for the holding company.

**Live URL:** https://pipedream.ventures

## Hosting

- **Platform:** Render (Static Site)
- **Service ID:** `srv-d60ildq4d50c73cr0ngg`
- **Workspace:** Pipedream Ventures (`tea-d60ijm4oud1c7395o3a0`)
- **Auto-deploy:** Yes, triggers on commit to `main`
- **Publish directory:** Root (`.`)

### Deploy Commands

```bash
# Switch to Pipedream workspace
render workspace set tea-d60ijm4oud1c7395o3a0 -o json

# Trigger manual deploy
render deploys create srv-d60ildq4d50c73cr0ngg --confirm -o json

# Check deploy status
render deploys list srv-d60ildq4d50c73cr0ngg -o json
```

## Structure

```
/
├── index.html              # Main landing page
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── robots.txt              # Crawler rules (blocks /work/)
├── favicon.svg
├── logo.svg
└── work/                   # Client deliverables (private)
    └── swyped/
        └── reports/        # Swyped API reports
```

## SEO / Robots

- Only `/index.html`, `/privacy.html`, and `/terms.html` are crawlable
- `/work/` is blocked in robots.txt
- All client reports have `noindex, nofollow` meta tags

## Client Reports

Client reports live in `/work/<client>/reports/`. Each report should have:
- `noindex, nofollow` meta tag
- Open Graph tags for Slack/social previews
- Date-based naming: `api-2026-02-04.html`

### Current Reports

| Client | Report | URL |
|--------|--------|-----|
| Swyped | API Report (Feb 4, 2026) | `/work/swyped/reports/api-2026-02-04.html` |
