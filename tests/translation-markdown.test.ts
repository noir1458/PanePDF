import { describe, expect, it } from "vitest";
import { renderTranslationMarkdown } from "../src/translation/translation-markdown";

describe("translation Markdown rendering", () => {
  it("renders headings, tables, and fenced source code", () => {
    const html = renderTranslationMarkdown(`
## 결과

| 항목 | 값 |
| --- | --- |
| 식 | \\(x + 1\\) |

\`\`\`ts
const answer = 42;
\`\`\`
`);

    expect(html).toContain("<h2>결과</h2>");
    expect(html).toContain("<table>");
    expect(html).toContain('<code class="language-ts">const answer = 42;');
    expect(html).toContain("\\(x + 1\\)");
  });

  it("does not execute raw HTML or load Markdown images", () => {
    const html = renderTranslationMarkdown(
      '<script>alert("x")</script>\n\n![remote](https://example.com/tracker.png)',
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("remote");
  });

  it("opens validated links outside the extension context", () => {
    const html = renderTranslationMarkdown("[reference](https://example.com/docs)");

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
