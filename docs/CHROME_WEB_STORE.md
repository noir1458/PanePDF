# Chrome Web Store submission

This document contains the copy and declarations for PanePDF's first Chrome Web Store submission. Verify every field against the release package before submitting it for review.

## Product details

**Name:** PanePDF

**Category:** Productivity

**Primary language:** English

**Summary:**

> A local-first PDF reader for focused reading, clean capture, range extraction, and optional AI translation.

**Detailed description:**

> PanePDF turns long PDFs into a focused reading workspace inside Chrome. Open a local file or a PDF URL, then read in continuous or page-turn mode with single-page and two-page layouts, content-aware fitting, themes, search, selectable text, links, outlines, bookmarks, and restored reading position.
>
> Capture the current page as a clean margin-cropped PNG, extract a page range using the PDF's original page objects, or download and print the unchanged source document.
>
> Optional AI translation appears as an adjustable overlay over the source page so the original remains available for comparison. PanePDF supports user-provided Gemini and OpenAI API keys, one-page and visible-spread translation, selectable target languages, locally rendered Markdown and formulas, code copying, local page caching, and optional cache-aware AUTO translation.
>
> PanePDF has no accounts, analytics, ads, telemetry, or developer-operated backend. PDF processing is local. Only a user-requested page image and limited document context are sent directly to the selected AI provider for translation. Provider keys remain in the current viewer tab's memory.

## URLs

- Homepage: `https://github.com/noir1458/PanePDF`
- Support: `https://github.com/noir1458/PanePDF/issues`
- Privacy policy: `https://github.com/noir1458/PanePDF/blob/main/PRIVACY.md`

## Single purpose

> Provide a focused PDF reading workspace with local navigation, clean page capture and extraction, and optional user-requested translation shown alongside the source.

## Permission justifications

### activeTab

PanePDF reads the active tab URL only after the user opens the extension popup. If that URL directly identifies a PDF, the popup offers to open it in PanePDF. It does not inspect page content, inject scripts, or monitor tabs in the background.

### downloads

Used only after user actions to save extracted PDF page ranges, download the unchanged original PDF, export cached translations as Markdown, or provide a PNG fallback when clipboard writing fails.

### clipboardWrite

Used after the user selects IMG or the configured copy command to write a locally rendered current-page PNG to the clipboard. The asynchronous PDF render may outlast normal transient clipboard activation.

### Required host access

- `https://generativelanguage.googleapis.com/*`: sends a page translation request directly to Google Gemini only after an explicit Translate action or while the user-enabled AUTO mode is active.
- `https://api.openai.com/*`: sends a page translation request directly to OpenAI only after an explicit Translate action or while the user-enabled AUTO mode is active.

### Optional host access

PanePDF declares optional `http`, `https`, and `file` host patterns so it can request access at runtime only for the specific PDF host chosen by the user. This access is used solely to fetch that PDF into the extension-owned reader. Local file-picker and drag-and-drop workflows do not require host access.

## Privacy practices

Declare all locally handled data as well as transmitted data. The conservative selections for the current implementation are:

- Website content: PDFs and page images selected by the user; processed locally, with one prepared page sent only for optional translation
- Web history: the active tab URL is inspected after the user opens the popup, but is not retained as browsing history or used for tracking
- Authentication information: user-entered Gemini or OpenAI API key; held only in tab memory and sent directly to that provider
- User-generated content: bookmark titles/notes and cached translations; stored only in local extension storage

Certifications and answers:

- Data is not sold to third parties.
- Data is not used or transferred for personalized advertising.
- Data is not used or transferred for creditworthiness or lending.
- Data is used only for PanePDF's disclosed single purpose.
- Human access to user content is not provided by PanePDF's developer.
- The extension does not use remote code. All executable code is packaged with the extension.
- The disclosures must match [PRIVACY.md](../PRIVACY.md).

## Reviewer test instructions

1. Select **Open empty reader**, then use **Open PDF** to choose a local PDF.
2. Verify page navigation, zoom/Fit controls, search, selectable text, themes, single/spread layout, and page-turn mode.
3. Select **IMG** to copy the current page and **PDF** to extract a page range.
4. Open the left edge to verify thumbnails, outline, saved documents, and bookmarks.
5. Open **AI** to inspect translation settings. Translation is an optional bring-your-own-key feature; no developer-owned test credential is embedded or provided.
   The settings disclosure lists the exact page image and limited context sent to the selected provider before the first translation.
6. To test remote URLs, use **Open URL** and approve the runtime prompt for that PDF host.

## Distribution recommendation

For the first review, choose **Unlisted** visibility and deferred publishing. All visibility levels receive the same policy review, but this keeps the item out of search until manual release verification is complete.

## Required assets

- 128×128 PNG icon with 16px transparent padding: `public/icons/icon-store-128.png`
- 440×280 small promotional tile: `docs/store-assets/small-promo.png`
- 1280×800 screenshots cropped and resized from actual PanePDF captures without generated content:
  - `docs/store-assets/screenshot-1-two-page-translation.png`
  - `docs/store-assets/screenshot-2-ai-overlay.png`
  - `docs/store-assets/screenshot-3-reading-controls.png`
  - `docs/store-assets/screenshot-4-document-sidebar.png`
- Optional 1400×560 marquee tile

The source README captures had non-store aspect ratios. These four derivatives preserve their pixels and UI content, use a 16:10 crop around the relevant feature, and resize to the required 1280×800 dimensions. Inspect them once more against the release build before uploading.

## Final manual gates

- Complete [TESTING.md](TESTING.md) against the exact release build.
- Confirm the optional per-site permission prompt for current-tab and manually entered remote PDF URLs.
- Confirm local file picker/drop, `file://` behavior, clipboard fallback, downloads, printing, Gemini, OpenAI, AUTO, cache deletion, and API-key clearing.
- Inspect the ZIP to ensure `manifest.json` is at its root and no credentials or unrelated files are included.
- Register the Chrome Web Store developer account and pay Google's one-time registration fee if not already completed.
- Upload the ZIP in the Developer Dashboard, complete Store listing, Privacy practices, Distribution, and Test instructions, then submit for review.
