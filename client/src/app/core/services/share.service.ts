import { Injectable } from '@angular/core';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

@Injectable({ providedIn: 'root' })
export class ShareService {
  // Sharing a link; on mobile devices it uses the native share sheeth feature and on any other device it copies the link to the clipboard
  async share(url: string, title?: string, text?: string): Promise<ShareResult> {
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };

    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text, url });
        return 'shared';
      } catch (err) {
        // if the user dismisses the share sheeth, don't copy
        if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      }
    }

    return this.copy(url);
  }

  // Copy text to the clipboard, with a legacy fallback for blocked contexts
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
