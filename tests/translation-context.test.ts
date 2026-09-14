import type { PDFDocumentProxy } from "pdfjs-dist";
import { describe, expect, it } from "vitest";
import {
  loadTranslationDocumentContext,
  outlineSectionForPage,
  translationContextForPage,
} from "../src/translation/translation-context";

describe("translation document context", () => {
  it("chooses the nearest and deepest table-of-contents path for a page", () => {
    const outline = [
      { pageNumber: 1, path: "Chapter 1", depth: 0 },
      { pageNumber: 4, path: "Chapter 1 > Background", depth: 1 },
      { pageNumber: 4, path: "Chapter 1 > Background > Terms", depth: 2 },
      { pageNumber: 12, path: "Chapter 2", depth: 0 },
    ];

    expect(outlineSectionForPage(outline, 3)).toBe("Chapter 1");
    expect(outlineSectionForPage(outline, 4)).toBe("Chapter 1 > Background > Terms");
    expect(outlineSectionForPage(outline, 14)).toBe("Chapter 2");
    expect(outlineSectionForPage(outline, 0)).toBeUndefined();
  });

  it("loads embedded metadata and resolves nested PDF outline destinations", async () => {
    const document = {
      numPages: 300,
      getMetadata: () =>
        Promise.resolve({
          info: { Title: "  Operating   Systems  ", Author: "A. Author" },
          metadata: { get: () => undefined },
        }),
      getOutline: () =>
        Promise.resolve([
          {
            title: "Memory",
            dest: [9],
            items: [{ title: "Virtual Memory", dest: [39], items: [] }],
          },
        ]),
    } as unknown as PDFDocumentProxy;

    const index = await loadTranslationDocumentContext(document);
    const context = translationContextForPage(index, 45);

    expect(context).toEqual({
      title: "Operating Systems",
      author: "A. Author",
      sectionPath: "Memory > Virtual Memory",
      totalPages: 300,
    });
  });

  it("continues with page context when a PDF has no outline", async () => {
    const document = {
      numPages: 13,
      getMetadata: () =>
        Promise.resolve({
          info: {},
          metadata: { get: () => undefined },
        }),
      getOutline: () => Promise.resolve(null),
    } as unknown as PDFDocumentProxy;

    const index = await loadTranslationDocumentContext(document);

    expect(translationContextForPage(index, 1)).toEqual({ totalPages: 13 });
  });
});
