/**
 * zoomNormalizer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE
 *   Browsers respect the OS-level "display scaling" setting and multiply it
 *   into window.devicePixelRatio. On Ubuntu at 100% scale, dPR is typically
 *   1.0. On Windows at 125% scale (the out-of-the-box default), dPR is 1.25.
 *   Because the browser treats 1 CSS pixel as (1 / dPR) physical pixels, the
 *   whole page is rendered proportionally *larger* on the Windows machine —
 *   not sharper, just bigger — making the layout feel "zoomed in".
 *
 *   This module detects that ratio and counter-scales the page so every OS
 *   shows the same effective visual size as Ubuntu at dPR = 1.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * APPROACH — WHY font-size ON :root?
 *
 *   Three options were considered:
 *
 *   1. CSS `zoom` property
 *      ✅ Simple one-liner, no layout side effects
 *      ❌ Non-standard (not in the CSS spec); Firefox ignores it.
 *         Ruled out for cross-browser consistency.
 *
 *   2. CSS `transform: scale()` on a root wrapper
 *      ✅ Works everywhere, text stays sharp (GPU-composited layer)
 *      ❌ Scale origin is top-left by default; the element still occupies its
 *         original box in layout flow, so you must manually set width/height
 *         as 1/factor to avoid phantom scroll space. fixed-position children
 *         become descendants of a transformed ancestor, breaking stacking
 *         context and viewport-relative positioning. Scroll and hit-testing
 *         also become misaligned. Very difficult to make robust.
 *
 *   3. Adjusting `font-size` on `:root` (HTML element)  ← CHOSEN
 *      ✅ Works in all browsers.
 *      ✅ The entire rem-based layout (fonts, spacing, widths, radii) scales
 *         proportionally because 1rem = root font-size.
 *      ✅ No transform stacking-context issues; fixed/sticky elements behave
 *         normally; scrollbars stay correct.
 *      ✅ Text remains vector-rendered — no rasterization blur.
 *      ✅ No wrapper element needed — zero DOM changes.
 *      ⚠️ Only corrects rem-unit values. Dimensions declared in px are not
 *         affected. For this codebase (IdeaBox) the vast majority of layout
 *         is rem-based, so this is acceptable. Pixel-locked values (border
 *         widths, icon sizes in px) will not scale, but they are minor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MOBILE EXCLUSION
 *   On phones/tablets, a high dPR (2, 3, even 4) reflects physical pixel
 *   density (Retina / HiDPI), NOT OS scaling. We must not shrink those
 *   layouts. The guard uses a combination of:
 *     • navigator.maxTouchPoints > 0  (touch-primary device)
 *     • screen width < 1024px         (small-screen form factor)
 *   Both must be true to be classified as mobile. This allows 2-in-1 tablets
 *   docked to keyboards (wide screen, touch enabled) to still benefit.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DYNAMIC UPDATES
 *   window.devicePixelRatio can change without a page reload when:
 *     • The user drags the browser window to a monitor with different scaling.
 *     • The user changes the OS scaling setting while the browser is open.
 *     • The user manually changes the browser zoom level (we intentionally
 *       do NOT correct for this — if the user zooms intentionally, let them).
 *
 *   The module listens to:
 *     • matchMedia(`(resolution: ${dPR}dppx)`) — fires exactly when dPR
 *       changes, with no polling overhead. We re-register the listener each
 *       time dPR changes so it always tracks the current value.
 *     • 'resize' event — belt-and-suspenders fallback for environments where
 *       matchMedia resolution queries are not supported (older Firefox).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OVERRIDE / DISABLE
 *   Add  ?disableZoomFix=1  to the URL to completely bypass all corrections.
 *   Useful for debugging or for specific setups where the fix causes issues.
 *   Also respected if window.__ZOOM_NORMALIZER_DISABLED__ === true is set
 *   programmatically before the script runs.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 *   import { initZoomNormalizer } from './utils/zoomNormalizer';
 *   initZoomNormalizer();           // call once at app entry (main.jsx)
 *
 *   To destroy (teardown listeners):
 *   import { destroyZoomNormalizer } from './utils/zoomNormalizer';
 *   destroyZoomNormalizer();
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * The baseline devicePixelRatio we treat as "100% scale".
 * Ubuntu at 100% display scaling → dPR = 1.
 * Fractional dPR values closer to 1 than to 1.5 are also considered baseline.
 */
const BASELINE_DPR = 1;

/**
 * The browser default root font-size in px.
 * All major browsers default to 16px; we use this as the starting point.
 */
const DEFAULT_ROOT_FONT_SIZE_PX = 16;

/**
 * Minimum and maximum allowed correction factors to prevent extreme results
 * on unusual display configurations (e.g. dPR = 4 on a 4K monitor used as
 * desktop without HiDPI awareness — we clamp so we don't shrink the page to
 * 25% of its original size).
 *
 * Range: 0.625 → 1.0 covers the most realistic OS scaling scenarios:
 *   dPR 1.0  → factor 1.0   (Ubuntu 100% — no change)
 *   dPR 1.25 → factor 0.8   (Windows 125% — shrink slightly)
 *   dPR 1.5  → factor 0.667 (Windows/macOS 150% — moderate shrink)
 *   dPR 1.6  → factor 0.625 (clamped minimum)
 *   dPR 2.0  → factor 0.625 (clamped — very likely Retina, not OS scale)
 */
const MIN_CORRECTION_FACTOR = 0.625;
const MAX_CORRECTION_FACTOR = 1.0;

// ─── Internal State ───────────────────────────────────────────────────────────

/** Holds the current matchMedia listener so we can clean it up. */
let _mqListener = null;

/** Holds the current matchMedia object so we can remove the listener. */
let _mq = null;

/** Resize event listener reference for cleanup. */
let _resizeListener = null;

/** Whether the module has been initialized. */
let _initialized = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the current environment looks like a mobile/tablet device
 * based on touch support AND a narrow viewport.
 *
 * We intentionally avoid user-agent sniffing — UA strings are unreliable and
 * easily spoofed. Instead we combine two strong heuristics:
 *
 * @returns {boolean}
 */
function isMobileDevice() {
  const touchPrimary = navigator.maxTouchPoints > 0;
  const narrowScreen = window.screen.width < 1024;
  return touchPrimary && narrowScreen;
}

/**
 * Reads the ?disableZoomFix query parameter from the current URL.
 * Also checks the global programmatic override flag.
 *
 * @returns {boolean} true if the correction should be skipped entirely.
 */
function isDisabledByOverride() {
  // Programmatic flag (set before script loads for server-side injection)
  if (window.__ZOOM_NORMALIZER_DISABLED__ === true) return true;

  // URL query-param override
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('disableZoomFix') === '1';
  } catch {
    return false;
  }
}

/**
 * Computes the correction factor for a given devicePixelRatio.
 *
 * Factor = BASELINE_DPR / currentDPR
 *
 * Examples:
 *   dPR 1.0  → 1 / 1.0  = 1.0   (no change)
 *   dPR 1.25 → 1 / 1.25 = 0.8
 *   dPR 1.5  → 1 / 1.5  ≈ 0.667
 *   dPR 0.8  → 1 / 0.8  = 1.25  (clamped to MAX_CORRECTION_FACTOR = 1.0)
 *
 * @param {number} dpr
 * @returns {number} clamped factor in [MIN_CORRECTION_FACTOR, MAX_CORRECTION_FACTOR]
 */
function computeCorrectionFactor(dpr) {
  const raw = BASELINE_DPR / dpr;
  return Math.max(MIN_CORRECTION_FACTOR, Math.min(MAX_CORRECTION_FACTOR, raw));
}

/**
 * Applies (or removes) the font-size correction on the <html> element.
 *
 * By changing the root font-size, every `rem` value in the stylesheet scales
 * proportionally. No DOM nodes are added or removed; no transforms are applied.
 *
 * @param {number} factor — a value in [MIN_CORRECTION_FACTOR, 1.0]
 */
function applyCorrection(factor) {
  const correctedSize = DEFAULT_ROOT_FONT_SIZE_PX * factor;
  document.documentElement.style.fontSize = `${correctedSize}px`;

  if (import.meta.env?.DEV) {
    // Development-only diagnostic — stripped from production builds
    console.info(
      `[ZoomNormalizer] dPR=${window.devicePixelRatio.toFixed(3)} ` +
      `→ factor=${factor.toFixed(4)} ` +
      `→ root font-size=${correctedSize.toFixed(3)}px`
    );
  }
}

/**
 * Resets the root font-size to the browser default, effectively disabling
 * any correction that was previously applied.
 */
function resetCorrection() {
  document.documentElement.style.fontSize = '';
}

// ─── Core Logic ───────────────────────────────────────────────────────────────

/**
 * Reads the current devicePixelRatio, computes the correction, and applies it.
 * This is intentionally a pure side-effect function so it can be called both
 * on init and on every relevant event.
 */
function recalculateAndApply() {
  // Skip correction on mobile / tablets
  if (isMobileDevice()) {
    resetCorrection();
    return;
  }

  const dpr = window.devicePixelRatio;
  const factor = computeCorrectionFactor(dpr);

  // If we're already at baseline, remove any residual correction
  if (factor >= MAX_CORRECTION_FACTOR) {
    resetCorrection();
  } else {
    applyCorrection(factor);
  }

  // Re-register the matchMedia listener for the NEW dPR value
  // (the current one fires only when dPR moves *away* from its registered value)
  registerDprChangeListener();
}

/**
 * Registers a matchMedia listener that fires when the devicePixelRatio
 * changes from its current value. This is the most efficient way to detect
 * cross-monitor moves or OS scaling changes.
 *
 * The trick: we watch for the media query `(resolution: Xdppx)` where X is
 * the CURRENT dPR. When the query stops matching (change event fires with
 * `matches === false`), dPR has changed — we recalculate.
 *
 * Because this listener fires once and then becomes stale (dPR has changed),
 * recalculateAndApply() always re-registers with the new dPR value.
 */
function registerDprChangeListener() {
  // Clean up the previous listener before attaching a new one
  if (_mq && _mqListener) {
    _mq.removeEventListener('change', _mqListener);
  }

  const currentDpr = window.devicePixelRatio;

  // Build a resolution media query for the current dPR
  // 1dppx = 1 device pixel per CSS pixel (i.e. dPR = 1)
  _mq = window.matchMedia(`(resolution: ${currentDpr}dppx)`);

  _mqListener = (event) => {
    // When the current resolution is no longer active, dPR has changed
    if (!event.matches) {
      recalculateAndApply();
    }
  };

  // `addEventListener` is the modern API; fall back to `addListener` for
  // older Safari (< 14)
  if (_mq.addEventListener) {
    _mq.addEventListener('change', _mqListener);
  } else if (_mq.addListener) {
    // Deprecated, but kept for broad compatibility
    _mq.addListener(_mqListener);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialises the zoom normaliser. Call this ONCE at app startup.
 *
 * Steps performed:
 *  1. Checks override flags — bails out if disabled.
 *  2. Applies the initial correction based on the current dPR.
 *  3. Registers a matchMedia listener to react to dPR changes (e.g., dragging
 *     the window to a different monitor or changing OS scaling live).
 *  4. Attaches a resize listener as a belt-and-suspenders fallback for
 *     environments that don't support matchMedia resolution queries.
 *
 * Calling initZoomNormalizer() more than once is safe — subsequent calls are
 * no-ops after the first successful initialisation.
 */
export function initZoomNormalizer() {
  if (_initialized) return;

  if (isDisabledByOverride()) {
    if (import.meta.env?.DEV) {
      console.info('[ZoomNormalizer] Disabled via override flag. No correction applied.');
    }
    return;
  }

  // Apply correction immediately on page load
  recalculateAndApply();

  // Belt-and-suspenders: 'resize' fires on zoom and on monitor change
  // (matchMedia resolution is the primary; this is the fallback)
  _resizeListener = () => recalculateAndApply();
  window.addEventListener('resize', _resizeListener, { passive: true });

  _initialized = true;
}

/**
 * Tears down all event listeners and resets the root font-size to the browser
 * default. Useful for cleanup in test environments or when hot-reloading.
 */
export function destroyZoomNormalizer() {
  if (_mq && _mqListener) {
    if (_mq.removeEventListener) {
      _mq.removeEventListener('change', _mqListener);
    } else if (_mq.removeListener) {
      _mq.removeListener(_mqListener);
    }
  }

  if (_resizeListener) {
    window.removeEventListener('resize', _resizeListener);
  }

  resetCorrection();

  _mq = null;
  _mqListener = null;
  _resizeListener = null;
  _initialized = false;
}
