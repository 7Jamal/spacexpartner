import { createServerFn } from "@tanstack/react-start";

type TranslateInput = { texts: string[]; target: string; targetName: string };

/**
 * Translates administrator-written content (announcements, notification bodies)
 * into the reader's language. The full text is translated — never truncated.
 */
export const translateContent = createServerFn({ method: "POST" })
  .inputValidator((input: TranslateInput) => {
    if (!input || !Array.isArray(input.texts)) throw new Error("Nothing to translate.");
    if (!input.target || input.target.length > 12) throw new Error("Invalid target language.");
    return {
      texts: input.texts.slice(0, 40).map((text) => String(text).slice(0, 8000)),
      target: input.target,
      targetName: String(input.targetName ?? input.target).slice(0, 60),
    };
  })
  .handler(async ({ data }) => {
    if (data.target === "en" || data.texts.every((text) => !text.trim())) {
      return { texts: data.texts };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Translation is not configured.");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You translate corporate payroll announcements for a partner portal into ${data.targetName}.
Return JSON of the form {"items": ["translation", ...]} with exactly one translation per input item, in the same order.
Translate the COMPLETE text with no summarising, no truncation and no added commentary.
Preserve line breaks, paragraph structure, numbers, currency amounts, dates, names and email addresses exactly.
If an item is already in the target language, return it unchanged. Use formal, natural business language.`,
          },
          {
            role: "user",
            content: JSON.stringify({ items: data.texts }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 429) throw new Error("Translation is busy right now. Please retry.");
      if (response.status === 402) throw new Error("Translation credits are exhausted.");
      throw new Error(`Translation failed: ${detail.slice(0, 200)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content ?? "{}";
    let items: unknown;
    try {
      items = (JSON.parse(content) as { items?: unknown }).items;
    } catch {
      items = undefined;
    }
    if (!Array.isArray(items) || items.length !== data.texts.length) {
      return { texts: data.texts };
    }
    return { texts: items.map((item, index) => String(item ?? data.texts[index] ?? "")) };
  });