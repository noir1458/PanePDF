import type { PDFDocumentProxy } from "pdfjs-dist";
import { destinationPageNumber } from "../viewer/pdf-destination";

export type TranslationDocumentContext = {
  title?: string;
  sectionPath?: string;
  totalPages: number;
};

export type ResolvedOutlineEntry = {
  pageNumber: number;
  path: string;
  depth: number;
};

export type TranslationDocumentContextIndex = Omit<TranslationDocumentContext, "sectionPath"> & {
  outline: ResolvedOutlineEntry[];
};

type OutlineItem = {
  title: string;
  dest: string | unknown[] | null;
  items?: OutlineItem[] | null;
};

const MAX_METADATA_LENGTH = 240;
const MAX_OUTLINE_TITLE_LENGTH = 160;

export async function loadTranslationDocumentContext(
  document: PDFDocumentProxy,
): Promise<TranslationDocumentContextIndex> {
  const [metadataResult, outlineResult] = await Promise.allSettled([
    document.getMetadata(),
    document.getOutline(),
  ]);
  const metadata =
    metadataResult.status === "fulfilled"
      ? documentMetadata(metadataResult.value.info, metadataResult.value.metadata)
      : {};
  const outline =
    outlineResult.status === "fulfilled" ? await resolveOutline(document, outlineResult.value) : [];
  return { ...metadata, totalPages: document.numPages, outline };
}

export function translationContextForPage(
  context: TranslationDocumentContextIndex,
  pageNumber: number,
): TranslationDocumentContext {
  const sectionPath = outlineSectionForPage(context.outline, pageNumber);
  return {
    ...(context.title ? { title: context.title } : {}),
    ...(sectionPath ? { sectionPath } : {}),
    totalPages: context.totalPages,
  };
}

export function outlineSectionForPage(
  outline: readonly ResolvedOutlineEntry[],
  pageNumber: number,
): string | undefined {
  let current: ResolvedOutlineEntry | undefined;
  for (const entry of outline) {
    if (entry.pageNumber > pageNumber) continue;
    if (
      !current ||
      entry.pageNumber > current.pageNumber ||
      (entry.pageNumber === current.pageNumber && entry.depth > current.depth)
    ) {
      current = entry;
    }
  }
  return current?.path;
}

function documentMetadata(
  infoValue: object,
  metadata: { get(name: string): unknown },
): Partial<Omit<TranslationDocumentContext, "sectionPath" | "totalPages">> {
  const info = isRecord(infoValue) ? infoValue : {};
  const title = firstMeaningfulValue(info.Title, metadata.get("dc:title"));
  return {
    ...(title ? { title } : {}),
  };
}

async function resolveOutline(
  document: PDFDocumentProxy,
  items: readonly OutlineItem[] | null | undefined,
  parents: readonly string[] = [],
): Promise<ResolvedOutlineEntry[]> {
  if (!items) return [];
  const groups = await Promise.all(
    items.map(async (item) => {
      const title = normalizedContextValue(item.title, MAX_OUTLINE_TITLE_LENGTH);
      const path = title ? [...parents, title] : [...parents];
      const own: ResolvedOutlineEntry[] = [];
      if (item.dest && path.length > 0) {
        try {
          own.push({
            pageNumber: await destinationPageNumber(document, item.dest),
            path: path.join(" > "),
            depth: path.length - 1,
          });
        } catch {
          // An unreadable outline destination should not block translation.
        }
      }
      return [...own, ...(await resolveOutline(document, item.items, path))];
    }),
  );
  return groups.flat();
}

function firstMeaningfulValue(...values: unknown[]): string | undefined {
  for (const value of values) {
    const normalized = normalizedContextValue(value, MAX_METADATA_LENGTH);
    if (normalized) return normalized;
  }
  return undefined;
}

function normalizedContextValue(value: unknown, maxLength: number): string | undefined {
  const text = Array.isArray(value)
    ? value.filter((item) => typeof item === "string").join(", ")
    : value;
  if (typeof text !== "string") return undefined;
  const printable = Array.from(text, (character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? " " : character;
  }).join("");
  const normalized = printable.replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
