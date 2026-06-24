import { Injectable } from '@angular/core';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

@Injectable({ providedIn: 'root' })
export class ShareService {
  /**
   * Share a link. On devices that support the Web Share API (mostly mobile),
   * this opens the native share sheet. Everywhere else it copies the URL to the
   * clipboard. Returns what happened so the caller can show feedback.
   */
  async share(url: string, title?: string, text?: string): Promise<ShareResult> {
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };

    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text, url });
        return 'shared';
      } catch (err) {
        // The user dismissed the share sheet — don't fall back to copying.
        if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
        // Any other failure: fall through to copying the link.
      }
    }

    return this.copy(url);
  }

  /** Copy text to the clipboard, with a legacy fallback for blocked contexts. */
  async copy(text: string): Promise<ShareResult> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return 'copied';
      }
    } catch {
      // fall through to the legacy path
    }

    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok ? 'copied' : 'failed';
    } catch {
      return 'failed';
    }
  }
}
