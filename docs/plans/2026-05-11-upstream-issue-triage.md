# Upstream Issue Triage — 2026-05-11

Upstream: https://github.com/mikeyobrien/pi-provider-kiro
Fork: https://github.com/eoliphan/pi-provider-kiro

## Sync status

- Added `upstream` remote pointing at `https://github.com/mikeyobrien/pi-provider-kiro.git`.
- Local fork `main`, `origin/main`, and `upstream/main` were all at `d0f5cc3` when triage started.
- Upstream latest release: `v0.6.1`.

## Open upstream issues

### #69 — Fetch model list instead of hardcoding

URL: https://github.com/mikeyobrien/pi-provider-kiro/issues/69

Summary: The hardcoded model catalog can become stale. The issue reports that Kiro has a `ListAvailableModels` API and suggests fetching models the way `kiro-cli` does. A commenter has a proof-of-concept fork branch at https://github.com/theli-ua/pi-provider-kiro/tree/model-list.

Recommendation: Implement first. Keep the current hardcoded catalog as fallback so pi still has a model list when credentials are unavailable, the API is down, or the backend response shape changes.

### #66 — `glm-5` is `us-east-1` only

URL: https://github.com/mikeyobrien/pi-provider-kiro/issues/66

Summary: The static catalog exposes `glm-5` in `eu-central-1`, but Kiro only serves it from `us-east-1`, causing runtime failures.

Recommendation: Treat as a symptom of #69. A region-aware backend model list should prevent unavailable models from being exposed for the active region. If dynamic fetch is not available, consider a static regional availability filter for known exceptions.

### #61 — Package missing from pi.dev search

URL: https://github.com/mikeyobrien/pi-provider-kiro/issues/61

Summary: Package discovery issue for https://pi.dev/packages?name=pi-provider-kiro.

Recommendation: Lower priority for this fork unless publishing/discovery matters. Likely registry/package metadata rather than runtime provider behavior.

## Local priority order

1. #69 dynamic/region-aware model list with static fallback.
2. #66 verify `glm-5` handling after #69; add fallback-region guard only if needed.
3. #61 only if this fork will be published or shared via pi package discovery.
