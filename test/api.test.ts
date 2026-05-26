import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAvailableModels } from "../src/api.js";

const creds = {
  access: "access-token",
  refresh: "refresh-token|client|secret|idc",
  expires: Date.now() + 60_000,
  clientId: "client",
  clientSecret: "secret",
  region: "eu-west-1",
  authMethod: "idc" as const,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchAvailableModels", () => {
  it("posts ListAvailableModels to the resolved Kiro API region", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          models: [
            {
              modelId: "claude-sonnet-4.6",
              modelName: "Claude Sonnet 4.6",
              tokenLimits: { maxInputTokens: 200000, maxOutputTokens: 65536 },
              supportedInputTypes: ["TEXT", "IMAGE"],
              rateMultiplier: 1,
              rateUnit: "REQUEST",
            },
          ],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchAvailableModels(creds);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://q.eu-central-1.amazonaws.com/?origin=KIRO_CLI");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/x-amz-json-1.0",
        Authorization: "Bearer access-token",
        "X-Amz-Target": "AmazonCodeWhispererService.ListAvailableModels",
      }),
      body: JSON.stringify({ origin: "KIRO_CLI" }),
    });
    expect(response.models[0].modelId).toBe("claude-sonnet-4.6");
  });

  it("throws with response details when ListAvailableModels fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: () => Promise.resolve("denied"),
      }),
    );

    await expect(fetchAvailableModels(creds)).rejects.toThrow(
      "AmazonCodeWhispererService.ListAvailableModels failed: 403 Forbidden denied",
    );
  });
});
