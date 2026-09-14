import MarkdownIt from "markdown-it";
import renderMathInElement from "katex/contrib/auto-render";

const markdown = new MarkdownIt({
  html: false,
  linkify: false,
  breaks: true,
  typographer: false,
});

markdown.renderer.rules.image = (tokens, index) =>
  markdown.utils.escapeHtml(tokens[index]?.content ?? "");

markdown.renderer.rules.link_open = (tokens, index, options, _environment, renderer) => {
  const token = tokens[index];
  if (!token) return "";
  token.attrSet("target", "_blank");
  token.attrSet("rel", "noopener noreferrer");
  return renderer.renderToken(tokens, index, options);
};

export function renderTranslationMarkdown(source: string): string {
  const protectedMath = protectMath(source.trim());
  let html = markdown.render(protectedMath.source);
  for (const [placeholder, math] of protectedMath.math) {
    html = html.replaceAll(placeholder, () => markdown.utils.escapeHtml(math));
  }
  return html;
}

export function renderTranslationMath(element: HTMLElement): void {
  renderMathInElement(element, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "$$", right: "$$", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false },
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    throwOnError: false,
    trust: false,
    strict: "warn",
  });
}

function protectMath(source: string): { source: string; math: Map<string, string> } {
  const math = new Map<string, string>();
  const segments = markdownSegments(source);
  const protectedSource = segments
    .map(({ code, text }) => (code ? text : protectMathSegment(text, math)))
    .join("\n");
  return { source: protectedSource, math };
}

function protectMathSegment(source: string, math: Map<string, string>): string {
  const inlineCode = new Map<string, string>();
  let protectedSource = source.replace(/(`+)([\s\S]*?)\1/g, (match: string) => {
    const placeholder = `PANEPDFINLINECODE${inlineCode.size}TOKEN`;
    inlineCode.set(placeholder, match);
    return placeholder;
  });
  const protect = (match: string): string => {
    const placeholder = `PANEPDFMATHEXPRESSION${math.size}TOKEN`;
    math.set(placeholder, match);
    return placeholder;
  };
  protectedSource = protectedSource
    .replace(/\\\[[\s\S]*?\\\]/g, protect)
    .replace(/\$\$[\s\S]*?\$\$/g, protect)
    .replace(/\\\([\s\S]*?\\\)/g, protect)
    .replace(/(?<!\\)\$(?!\$)(?=\S)([^\n$]*?[^\s$])(?<!\\)\$(?!\$)/g, protect);
  for (const [placeholder, code] of inlineCode) {
    protectedSource = protectedSource.replaceAll(placeholder, () => code);
  }
  return protectedSource;
}

function markdownSegments(source: string): { code: boolean; text: string }[] {
  const segments: { code: boolean; lines: string[] }[] = [];
  let current = { code: false, lines: [] as string[] };
  let fence: { marker: "`" | "~"; length: number } | null = null;
  for (const line of source.split("\n")) {
    const openingFence: { marker: "`" | "~"; length: number } | null = fence
      ? null
      : fenceStart(line);
    if (openingFence) {
      if (current.lines.length > 0) segments.push(current);
      current = { code: true, lines: [line] };
      fence = openingFence;
      continue;
    }
    current.lines.push(line);
    if (fence && fenceEnd(line, fence)) {
      segments.push(current);
      current = { code: false, lines: [] };
      fence = null;
    }
  }
  if (current.lines.length > 0) segments.push(current);
  return segments.map(({ code, lines }) => ({ code, text: lines.join("\n") }));
}

function fenceStart(line: string): { marker: "`" | "~"; length: number } | null {
  const candidate = /^ {0,3}(`{3,}|~{3,})/u.exec(line)?.[1];
  if (!candidate) return null;
  const marker = candidate[0];
  if (marker !== "`" && marker !== "~") return null;
  return { marker, length: candidate.length };
}

function fenceEnd(line: string, fence: { marker: "`" | "~"; length: number }): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length >= fence.length &&
    Array.from(trimmed).every((character) => character === fence.marker)
  );
}
