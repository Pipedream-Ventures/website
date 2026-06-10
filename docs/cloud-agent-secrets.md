# Cloud-agent secret handling

Static marketing site (Render) — there should be no secrets in this repo at all.

- **Source of truth:** any deploy hook / form-handler key lives in the Render dashboard env, never in the repo.
- **Client code:** never embed API keys or tokens in HTML/JS — anything shipped to the browser is public.
- **Agent read-block:** `.claude/settings.json` denies reading `.env*` / `secrets/**`.
- **Never** interpolate raw secrets into prompts or skill markdown (OWASP LLM07).

Refs: https://platform.claude.com/docs/en/managed-agents/environments
