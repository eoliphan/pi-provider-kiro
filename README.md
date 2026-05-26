# pi-provider-kiro

A [pi](https://pi.dev/) provider extension that connects pi to the **Kiro API** (AWS CodeWhisperer/Q), exposing the models available to your Kiro account through one provider surface.

## Why this exists

Kiro gives you a strong free model menu, but pi needs a provider that speaks Kiro's auth, model catalog, and streaming protocol cleanly. `pi-provider-kiro` handles that bridge, including:

- AWS Builder ID, IAM Identity Center, Google, and GitHub login flows
- shared credentials from an existing `kiro-cli` session when available
- reasoning-aware streaming
- dynamic model discovery via Kiro's `ListAvailableModels` API so pi only shows models your account and region can actually use

## Quick start

This fork is installed directly from GitHub, not npm.

Install the provider globally for your pi user:

```bash
pi install git:github.com/eoliphan/pi-provider-kiro
```

Or install it only for the current project:

```bash
pi install -l git:github.com/eoliphan/pi-provider-kiro
```

To pin a specific branch, tag, or commit, append `@ref`:

```bash
pi install git:github.com/eoliphan/pi-provider-kiro@main
pi install git:github.com/eoliphan/pi-provider-kiro@<commit-sha>
```

Update the installed GitHub package later with:

```bash
pi update --extensions
```

The GitHub package is configured at the repository root via `package.json` and loads `./src/index.ts` directly, so no separate npm publish or `dist/` build artifact is required for pi installation.

Then log in from pi:

```text
/login kiro
```

The login flow supports:
- **AWS Builder ID** — native device-code flow, works well over SSH/remotes
- **Your organization** — IAM Identity Center start URL
- **Google** — social login via `kiro-cli`
- **GitHub** — social login via `kiro-cli`

If you already use [kiro-cli](https://kiro.dev), the provider can reuse those credentials instead of forcing a second login.

## Models

Kiro model availability is account-, plan-, auth-, and region-dependent. This provider fetches the model list from Kiro's backend and uses static metadata only as enrichment/fallback hints.

List the models currently visible to pi with:

```bash
pi --provider kiro --list-models
```

For comparison, Kiro CLI exposes its current backend list with:

```bash
kiro-cli chat --list-models --format json
```

## Usage

Once logged in, select any Kiro model in pi:

```text
/model claude-sonnet-4-6
```

Or let Kiro pick automatically:

```text
/model auto
```

Reasoning is automatically enabled for supported models. Use `/reasoning` to adjust the thinking budget.

## Retry Behavior

Generic transient retries such as HTTP `429` and `5xx` are handled by `pi-coding-agent` at the session layer.

This provider only keeps local recovery for Kiro-specific cases:
- `403` auth races, where it can refresh credentials from `kiro-cli`
- first-token / stalled-stream recovery
- empty-stream retries
- non-retryable Kiro body markers like `MONTHLY_REQUEST_COUNT` and `INSUFFICIENT_MODEL_CAPACITY`

## Development

```bash
npm run build       # Compile TypeScript
npm run check       # Type check (no emit)
npm test            # Run the Vitest suite
npm run test:watch  # Watch mode
```

## Architecture

The extension is organized as one feature per file:

```
src/
├── index.ts            # Extension registration
├── models.ts           # Static model metadata + dynamic model mapping + ID resolution
├── oauth.ts            # Multi-provider auth (Builder ID / Google / GitHub)
├── kiro-cli.ts         # kiro-cli credential sharing
├── transform.ts        # Message format conversion
├── history.ts          # Conversation history management
├── thinking-parser.ts  # Streaming <thinking> tag parser
├── event-parser.ts     # Kiro stream event parser
└── stream.ts           # Main streaming orchestrator
```

See [AGENTS.md](AGENTS.md) for detailed development guidance and [.agents/summary/](/.agents/summary/index.md) for full architecture documentation.

## License

MIT
