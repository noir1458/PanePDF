import { looksLikePdfUrl, requestPdfUrlAccess, viewerUrl } from "../shared/source";

const status = requireElement<HTMLElement>("#status");
const openCurrent = requireElement<HTMLButtonElement>("#open-current");
const openReader = requireElement<HTMLButtonElement>("#open-reader");
let activePdfUrl: string | null = null;

async function initialize(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url && looksLikePdfUrl(tab.url)) {
    activePdfUrl = tab.url;
    status.textContent = "Open the PDF from this tab in the private reader.";
    openCurrent.disabled = false;
  } else {
    status.textContent =
      "This tab does not expose a direct PDF URL. Open the reader and choose a file.";
    openCurrent.disabled = true;
  }
}

openCurrent.addEventListener("click", () => {
  void openCurrentPdf().catch((error: unknown) => {
    status.textContent =
      error instanceof Error ? error.message : "Could not request access to this PDF's site.";
  });
});

openReader.addEventListener("click", () => {
  void chrome.tabs.create({ url: viewerUrl() }).then(() => window.close());
});

function requireElement<T extends Element>(selector: string): T {
  // Generic inference preserves concrete DOM element APIs at each call site.
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing popup element: ${selector}`);
  return element;
}

async function openCurrentPdf(): Promise<void> {
  if (!activePdfUrl) return;
  const granted = await requestPdfUrlAccess(activePdfUrl);
  if (!granted) {
    status.textContent = "PanePDF needs access to this PDF's site before it can open the file.";
    return;
  }
  await chrome.tabs.create({ url: viewerUrl(activePdfUrl) });
  window.close();
}

void initialize().catch((error: unknown) => {
  status.textContent =
    error instanceof Error ? error.message : "Could not inspect the current tab.";
  openCurrent.disabled = true;
});
