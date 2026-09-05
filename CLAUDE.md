# Pipedream Ventures website

Static holding-company site at https://pipedream.ventures. Render owns current
deployment configuration and status; verify it there before a manual deploy.

## Structure

- `index.html`, `privacy.html`, `terms.html`: public pages
- `work/`: private client deliverables
- `scratch/`: unlisted experiments

## SEO / Robots

- Only `/index.html`, `/privacy.html`, and `/terms.html` are crawlable
- `/work/` is blocked in robots.txt
- `/scratch/` is blocked in robots.txt
- Every `/scratch/**/index.html` needs complete Open Graph and X card metadata
  with an absolute `pipedream.ventures` image URL. Validate changed pages with
  `python scripts/validate-share-pages.py`.
- All client reports have `noindex, nofollow` meta tags

## Client Reports

Client reports live in `/work/<client>/reports/`. Each report should have:
- `noindex, nofollow` meta tag
- Open Graph tags for Slack/social previews
- Date-based naming: `api-2026-02-04.html`
