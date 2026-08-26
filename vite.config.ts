import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// This file runs in Node during Vite dev/typecheck. The repo doesn't include `@types/node`,
// so we declare the small subset of globals we use.
declare const process: { env: Record<string, string | undefined> };
declare const fetch: (input: string, init?: any) => Promise<any>;

function anthropicCoachProxyPlugin() {
  return {
    name: "anthropic-coach-proxy",
    configureServer(server: any) {
      server.middlewares.use("/api/coach", async (req: any, res: any, next: any) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              text: "Add ANTHROPIC_API_KEY to .env.local to enable the Anthropic coach.",
            }),
          );
          return;
        }

            const chunks: any[] = [];
            req.on("data", (chunk: any) => chunks.push(chunk));
        req.on("end", async () => {
          try {
            const raw = chunks
              .map((chunk) => (typeof chunk === "string" ? chunk : String(chunk)))
              .join("");
            const parsed: unknown = raw ? JSON.parse(raw) : {};
            if (typeof parsed !== "object" || parsed === null) {
              res.statusCode = 400;
              res.end(JSON.stringify({ text: "Invalid request body" }));
              return;
            }

            const prompt = (parsed as { prompt?: unknown }).prompt;
            if (typeof prompt !== "string") {
              res.statusCode = 400;
              res.end(JSON.stringify({ text: "Missing prompt" }));
              return;
            }

            const anthropicResponse = await fetch(
              "https://api.anthropic.com/v1/messages",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": apiKey,
                  "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                  model: "claude-haiku-4-5",
                  max_tokens: 300,
                  system:
                    "You are a careful coding tutor. Never reveal reference solutions or hidden test details. Be concise and helpful.",
                  messages: [{ role: "user", content: prompt }],
                }),
              },
            );

            const responseText = await anthropicResponse.text();
            let body: unknown;
            try {
              body = JSON.parse(responseText);
            } catch {
              body = null;
            }

            if (!anthropicResponse.ok) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  text:
                    (body &&
                      typeof body === "object" &&
                      body !== null &&
                      "error" in body &&
                      typeof (body as any).error === "object" &&
                      typeof (body as any).error.message === "string" &&
                      (body as any).error.message) ||
                    responseText ||
                    "Anthropic API error",
                }),
              );
              return;
            }

            const aiText =
              body &&
              typeof body === "object" &&
              body !== null &&
              "content" in body &&
              Array.isArray((body as any).content)
                ? ((body as any).content as any[])
                    .map((part) => (part && typeof part === "object" ? part.text : ""))
                    .filter((t) => typeof t === "string")
                    .join("")
                : "";

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ text: aiText || "No response" }));
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ text: String(error?.message ?? error) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), anthropicCoachProxyPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
