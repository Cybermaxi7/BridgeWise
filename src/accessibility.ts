/**
 * BridgeWise Accessibility Utilities
 * Issues: #130 (Keyboard Nav), #131 (ARIA Roles)
 */

// ─── Focus Manager ───────────────────────────────────────────────────────────

export class FocusManager {
  private static readonly FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])', '[role="menuitem"]',
    '[role="option"]', '[role="tab"]', '[role="treeitem"]',
  ].join(', ');

  static getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(this.FOCUSABLE))
      .filter(el => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null);
  }

  static trapFocus(container: HTMLElement): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = FocusManager.getFocusable(container);
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    const focusable = FocusManager.getFocusable(container);
    focusable[0]?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }

  static restoreFocus(element: HTMLElement | null): void {
    element?.focus();
  }
}

// ─── Keyboard Navigation ─────────────────────────────────────────────────────

export type Direction = 'next' | 'prev' | 'first' | 'last';

export class KeyboardNav {
  /**
   * Arrow-key navigation for lists, menus, tabs, grids.
   * Returns cleanup function.
   */
  static arrowList(
    container: HTMLElement,
    selector: string,
    opts: { orientation?: 'horizontal' | 'vertical' | 'both'; wrap?: boolean } = {},
  ): () => void {
    const { orientation = 'vertical', wrap = true } = opts;

    const getItems = () =>
      Array.from(container.querySelectorAll<HTMLElement>(selector))
        .filter(el => !el.hasAttribute('disabled') && !el.closest('[aria-hidden="true"]'));

    const move = (direction: Direction) => {
      const items = getItems();
      const idx   = items.indexOf(document.activeElement as HTMLElement);
      let next: number;

      switch (direction) {
        case 'next':  next = wrap ? (idx + 1) % items.length : Math.min(idx + 1, items.length - 1); break;
        case 'prev':  next = wrap ? (idx - 1 + items.length) % items.length : Math.max(idx - 1, 0); break;
        case 'first': next = 0; break;
        case 'last':  next = items.length - 1; break;
      }
      items[next]?.focus();
    };

    const handler = (e: KeyboardEvent) => {
      const useH = orientation === 'horizontal' || orientation === 'both';
      const useV = orientation === 'vertical'   || orientation === 'both';

      switch (e.key) {
        case 'ArrowDown':  if (useV) { e.preventDefault(); move('next');  } break;
        case 'ArrowUp':    if (useV) { e.preventDefault(); move('prev');  } break;
        case 'ArrowRight': if (useH) { e.preventDefault(); move('next');  } break;
        case 'ArrowLeft':  if (useH) { e.preventDefault(); move('prev');  } break;
        case 'Home':       e.preventDefault(); move('first'); break;
        case 'End':        e.preventDefault(); move('last');  break;
      }
    };

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }

  /** Enter/Space activate, Escape dismiss */
  static activatable(
    element: HTMLElement,
    onActivate: () => void,
    onDismiss?: () => void,
  ): () => void {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
      if (e.key === 'Escape' && onDismiss)    { e.preventDefault(); onDismiss(); }
    };
    element.addEventListener('keydown', handler);
    return () => element.removeEventListener('keydown', handler);
  }
}

// ─── ARIA Helpers ─────────────────────────────────────────────────────────────

export const aria = {
  /** Announce a message to screen readers via live region */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const id  = 'bw-live-region';
    let region = document.getElementById(id);
    if (!region) {
      region = document.createElement('div');
      region.id = id;
      Object.assign(region.style, {
        position: 'absolute', width: '1px', height: '1px',
        padding: '0', overflow: 'hidden', clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap', border: '0',
      });
      document.body.appendChild(region);
    }
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.textContent = '';
    requestAnimationFrame(() => { region!.textContent = message; });
  },

  /** Set aria-expanded and aria-controls on a trigger */
  setExpanded(trigger: HTMLElement, expanded: boolean): void {
    trigger.setAttribute('aria-expanded', String(expanded));
  },

  /** Mark an element as currently selected in a list/tab */
  setSelected(items: HTMLElement[], active: HTMLElement): void {
    items.forEach(item => {
      const isActive = item === active;
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  },
};

// ─── Skip Link ────────────────────────────────────────────────────────────────

export function installSkipLink(mainId = 'main-content'): void {
  const existing = document.getElementById('bw-skip-link');
  if (existing) return;

  const link = document.createElement('a');
  link.id        = 'bw-skip-link';
  link.href      = `#${mainId}`;
  link.textContent = 'Skip to main content';
  link.className = 'bw-skip-link';
  document.body.insertBefore(link, document.body.firstChild);
}

// ─── Roving tabindex ─────────────────────────────────────────────────────────

export class RovingTabindex {
  private items: HTMLElement[] = [];
  private current = 0;

  constructor(private container: HTMLElement, private selector: string) {
    this.sync();
    new MutationObserver(() => this.sync()).observe(container, { childList: true, subtree: true });
  }

  sync(): void {
    this.items = Array.from(this.container.querySelectorAll<HTMLElement>(this.selector));
    this.items.forEach((item, i) => {
      item.setAttribute('tabindex', i === this.current ? '0' : '-1');
    });
  }

  setCurrent(index: number): void {
    this.items[this.current]?.setAttribute('tabindex', '-1');
    this.current = Math.max(0, Math.min(index, this.items.length - 1));
    this.items[this.current]?.setAttribute('tabindex', '0');
    this.items[this.current]?.focus();
  }
}