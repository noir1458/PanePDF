import { describe, expect, it } from "vitest";
import {
  classifyPdfUrl,
  looksLikePdfUrl,
  pdfUrlPermissionOrigin,
  sourceUrlFromLocation,
} from "../src/shared/source";

describe("PDF source helpers", () => {
  it("classifies remote and local URLs", () => {
    expect(classifyPdfUrl("https://example.com/a.pdf").kind).toBe("remote-url");
    expect(classifyPdfUrl("file:///Users/me/a.pdf").kind).toBe("file-url");
  });

  it("recognizes PDF paths despite query and fragment", () => {
    expect(looksLikePdfUrl("https://example.com/a.PDF?download=1#page=2")).toBe(true);
    expect(looksLikePdfUrl("https://example.com/viewer?id=1")).toBe(false);
  });

  it("reads the viewer URL query", () => {
    expect(sourceUrlFromLocation("?url=https%3A%2F%2Fexample.com%2Fa.pdf")).toBe(
      "https://example.com/a.pdf",
    );
  });

  it("requests only the PDF URL's origin at runtime", () => {
    expect(pdfUrlPermissionOrigin("https://docs.example.com:8443/a.pdf")).toBe(
      "https://docs.example.com/*",
    );
    expect(pdfUrlPermissionOrigin("http://localhost:4173/a.pdf")).toBe("http://localhost/*");
    expect(pdfUrlPermissionOrigin("file:///Users/me/a.pdf")).toBe("file:///*");
  });
});
