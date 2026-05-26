// ABOUTME: Minimal Kiro API client for metadata endpoints used by the provider.
// ABOUTME: Fetches region-aware model catalog data from ListAvailableModels.

import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { resolveApiRegion } from "./models.js";
import type { KiroCredentials } from "./oauth.js";

const JSON_HEADERS = {
  "Content-Type": "application/x-amz-json-1.0",
  "User-Agent": "pi-provider-kiro",
} as const;

export interface KiroModel {
  modelId: string;
  modelName?: string;
  description?: string;
  tokenLimits?: {
    maxInputTokens?: number;
    maxOutputTokens?: number;
  };
  supportedInputTypes?: ("TEXT" | "IMAGE")[];
  rateMultiplier?: number;
  rateUnit?: string;
  promptCaching?: {
    supportsPromptCaching?: boolean;
  };
}

export interface ListAvailableModelsResponse {
  defaultModel?: KiroModel;
  models: KiroModel[];
}

function getEndpoint(credentials: OAuthCredentials): string {
  const apiRegion = resolveApiRegion((credentials as KiroCredentials).region);
  return `https://q.${apiRegion}.amazonaws.com/?origin=KIRO_CLI`;
}

async function postOperation<TResponse>(
  credentials: OAuthCredentials,
  target: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const response = await fetch(getEndpoint(credentials), {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${credentials.access}`,
      "X-Amz-Target": target,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${target} failed: ${response.status} ${response.statusText}${text ? ` ${text}` : ""}`);
  }

  return (await response.json()) as TResponse;
}

export async function fetchAvailableModels(credentials: OAuthCredentials): Promise<ListAvailableModelsResponse> {
  return postOperation<ListAvailableModelsResponse>(credentials, "AmazonCodeWhispererService.ListAvailableModels", {
    origin: "KIRO_CLI",
  });
}
