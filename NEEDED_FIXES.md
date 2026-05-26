# Needed Fixes

Notes from GS Pi dogfooding with `gs-pi-extensions` clean Just recipes.

## Git package install was fragile

Using the provider directly as a Pi package source previously failed during startup:

```bash
pi -e git:github.com/eoliphan/pi-provider-kiro@main
```

Pi installs git package sources with production install behavior (`npm install --omit=dev`). The provider previously expected build-time tooling/types from development dependencies during `prepare`, so install/build could fail before the provider registered models.

## Status

Fixed on `deps/upgrade-pi-packages`:

- Updated old `@mariozechner/*` package imports/dependencies to current `@earendil-works/*` packages.
- Removed the `prepare` build hook so git installs do not require dev-only build dependencies.
- Configured `pi.extensions` to load `./src/index.ts` directly through pi's TypeScript extension loader.
- Moved runtime tokenizer dependency (`js-tiktoken`) to `dependencies`.
- Declared pi core packages as peer dependencies.
- Included `src` in package files for source-based extension loading.

## Re-test

After merging to `main`, verify the Git package source directly:

```bash
pi -e git:github.com/eoliphan/pi-provider-kiro@main --provider kiro --list-models
```
