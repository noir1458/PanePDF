# PanePDF Privacy Policy

Effective date: September 15, 2026

PanePDF is a local-first Chrome extension for reading PDF documents. It has no developer-operated backend, analytics, advertising, or telemetry. The developer does not sell user data.

## Data PanePDF handles

PanePDF handles the following data only to provide its user-facing PDF reading features:

- PDF documents selected, dropped, or opened by the user
- The active tab URL after the user opens the extension popup, solely to offer a direct PDF URL in PanePDF
- Locally created reading state, saved-document entries, thumbnails, bookmarks, and bookmark notes
- AI provider API keys entered by the user
- For an explicit AI translation, or while user-enabled AUTO translation is active: the prepared current-page image, embedded PDF title when available, nearest table-of-contents path when available, page position, target language, and translation instructions
- AI translation results and provider-reported token counts

PanePDF does not send the complete PDF, its source filename, embedded author or subject metadata, saved-document library, bookmarks, or reading history to an AI provider.

## Local processing and storage

PDF parsing, page rendering, margin detection, search, page-range extraction, thumbnails, bookmarks, and reading-state management happen in the browser. Saved PDF copies, reading state, bookmarks, and translation results are stored locally in extension IndexedDB. Display preferences are stored in extension local storage.

API keys are kept only in the current viewer tab's memory. They are not written to local storage or IndexedDB and are forgotten when that tab closes.

Users can remove saved PDFs, bookmarks, and cached translations from PanePDF. Uninstalling the extension removes its Chrome-managed local extension data.

## Network transfers

When the user opens a remote PDF URL, PanePDF requests access to that specific site and fetches the PDF directly from its source. The source server receives the ordinary network information necessary to fulfill that request.

AI translation is optional. PanePDF sends translation input directly from the browser to the provider selected by the user:

- Google Gemini at `generativelanguage.googleapis.com`
- OpenAI at `api.openai.com`

These transfers use HTTPS. The selected provider receives the user's provider API key for authentication and processes the submitted translation input under its own terms and privacy policy. PanePDF's developer does not receive or retain these requests or responses.

## Data use and sharing

PanePDF uses data only to provide or improve its single user-facing purpose: a focused PDF reading workflow with page capture, extraction, and optional translation. Data is not used for advertising, creditworthiness, lending, or unrelated profiling. It is not sold. No human reviews user content on behalf of PanePDF's developer.

Data is shared only with a user-selected AI provider when necessary to perform a translation requested by the user or enabled through AUTO mode, or when required by law or necessary for security. PanePDF's use of information complies with the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Security

PanePDF does not load or execute remote code. Extension logic and third-party libraries are included in the installed package. AI provider traffic uses HTTPS. Remote PDFs are fetched using the scheme of the URL supplied by the user; users should prefer HTTPS sources.

## Changes

Material changes to this policy or PanePDF's data handling will be disclosed before the changed practice takes effect. The effective date above will be updated.

## Contact

For privacy or support questions, open an issue in the [PanePDF GitHub repository](https://github.com/noir1458/PanePDF/issues).
