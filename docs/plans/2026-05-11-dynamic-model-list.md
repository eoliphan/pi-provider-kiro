# Dynamic Kiro Model List Implementation Plan

> **REQUIRED SUB-SKILL:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Fetch Kiro models from `ListAvailableModels` after authentication, while retaining the current static catalog as a safe fallback.

**Architecture:** Add a small Kiro API client for `AmazonCodeWhispererService.ListAvailableModels`, map backend model records into pi `Model<Api>` objects, and cache successful results by resolved API region. `modifyModels` remains synchronous and uses cached backend models when present; otherwise it falls back to the existing region-filtered static catalog.

**Tech Stack:** TypeScript, Vitest, global `fetch`, pi provider OAuth `modifyModels` hook.

---

## Task 1: Add API-client tests for `ListAvailableModels`

**TDD scenario:** New feature — full TDD cycle.

**Files:**
- Create: `src/api.ts`
- Create: `test/api.test.ts`

**Steps:**
1. Write failing tests that stub `global.fetch` and call `fetchAvailableModels(credentials)`.
2. Assert the request goes to `https://q.<resolved-region>.amazonaws.com/?origin=KIRO_CLI`.
3. Assert headers include `Content-Type: application/x-amz-json-1.0`, bearer `Authorization`, and `X-Amz-Target: AmazonCodeWhispererService.ListAvailableModels`.
4. Assert body is `{ "origin": "KIRO_CLI" }`.
5. Add a failing error-path test for non-2xx responses.
6. Run `npm test -- test/api.test.ts` and confirm the tests fail because `src/api.ts` does not exist.
7. Implement the minimal `src/api.ts` client and exported response/model types.
8. Run `npm test -- test/api.test.ts` and confirm the tests pass.

## Task 2: Map backend model records into pi models

**TDD scenario:** Modifying tested code — add uncovered behavior tests first.

**Files:**
- Modify: `src/models.ts`
- Modify: `test/models.test.ts`

**Steps:**
1. Add failing tests for `mapKiroModel` that verify dot-to-dash ID conversion, name mapping, input modality mapping, context/output limits, region-specific base URL, zero cost, and reasoning defaults.
2. Add a test that known Opus models preserve `thinkingLevelMap.xhigh`.
3. Run the focused model tests and confirm failure because `mapKiroModel` is not exported.
4. Implement `mapKiroModel` in `src/models.ts`, reusing the current static model metadata where possible.
5. Run the focused model tests and confirm they pass.

## Task 3: Cache fetched models after login/refresh

**TDD scenario:** Modifying tested code — add uncovered behavior tests first.

**Files:**
- Modify: `src/oauth.ts`
- Modify: `test/oauth.test.ts`

**Steps:**
1. Export `modelsCache` and `populateModelsCache(credentials)` from `src/oauth.ts`.
2. Write tests that mock `fetchKiroModels`/`fetchAvailableModels` and verify `populateModelsCache` stores models by `resolveApiRegion(credentials.region)`.
3. Add a test that fetch failure logs a warning but does not throw.
4. Wire `populateModelsCache` into successful credential-return paths in `loginKiro` and `refreshKiroToken` where practical.
5. Run `npm test -- test/oauth.test.ts` and confirm green.

## Task 4: Use cached backend models in provider registration

**TDD scenario:** Modifying tested code — existing tests plus new registration tests.

**Files:**
- Modify: `src/index.ts`
- Modify: `test/registration.test.ts`

**Steps:**
1. Add tests that seed `modelsCache` for `eu-central-1` and verify `modifyModels` returns cached backend models plus non-Kiro models.
2. Add a fallback test verifying current static filtering remains when cache is empty.
3. Modify `src/index.ts` to import `modelsCache` and prefer cached models for the resolved API region.
4. Run `npm test -- test/registration.test.ts` and confirm green.

## Task 5: Verify full project

**TDD scenario:** Verification.

**Files:**
- No source changes expected.

**Steps:**
1. Run `npm run check`.
2. Run `npm test`.
3. Run `npm run build`.
4. Review `git diff --stat` and `git diff`.
