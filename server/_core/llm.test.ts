import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({ ENV: { forgeApiKey: "" } }));
import { invokeLLM, listLLMModels } from "./llm";

afterEach(() => vi.unstubAllGlobals());

describe("missing Forge credential", () => {
  it.each([
    () => invokeLLM({ messages: [{ role: "user", content: "Hello" }] }),
    () => listLLMModels(),
  ])("names the environment variable the application reads", async (request) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(request()).rejects.toThrow("BUILT_IN_FORGE_API_KEY is not configured");
    expect(fetch).not.toHaveBeenCalled();
  });
});
