# Accessibility — Delight Studio

Target standard: **WCAG 2.1 / 2.2 Level AA**

This document records (1) the accessibility work already built into the site and
(2) step-by-step instructions for running a third-party automated scan against the
**deployed** site, so you have a compliance record.

---

## 1. Pages & states to test

Run every tool against all three live pages:

| Page | URL (once deployed) |
|------|---------------------|
| Coming soon (home) | `https://thedelightstudio.com/` |
| Services | `https://thedelightstudio.com/services.html` |
| Contact | `https://thedelightstudio.com/contact.html` |

For each page, also check these **states** (automated tools only see the current DOM):

- **Contact form – empty submit:** click "Send inquiry" with blank required fields; confirm the browser shows an accessible error prompt.
- **Contact form – focus:** Tab through every field; confirm a visible focus ring appears on each.
- **Keyboard nav:** press Tab from the top — the first stop should be "Skip to main content"; activating it should jump focus past the nav.
- **Mobile viewport:** re-run at a 375 px width (browser dev-tools device mode).
- **Reduced motion:** enable "Reduce motion" in your OS, reload, confirm the glow/sparkle animation stops.

---

## 2. Option A — axe DevTools (browser extension) — recommended

Best for a quick, authoritative pass with almost no false positives.

1. Install the **axe DevTools** extension (Chrome or Firefox web store — by Deque).
2. Open the deployed page in the browser.
3. Open DevTools (`F12`) → **axe DevTools** tab.
4. Click **Scan all of my page**.
5. Review results. Aim for **0 Critical / 0 Serious** issues.
6. Use **Export** (or a screenshot) to save the report for your records.
7. Repeat for each page + the form states above.

## 3. Option B — WAVE (no install needed)

Good visual, page-by-page report; easy to share.

1. Go to **https://wave.webaim.org/**.
2. Paste the deployed page URL and run.
   - Or install the **WAVE** browser extension to test states the online version can't reach (e.g., the focused/filled form).
3. Review the left panel: **Errors** (red) and **Contrast Errors** must be **0**.
   "Alerts" (yellow) are advisory — review but they are not automatic failures.
4. Save the report (screenshot or the extension's export).
5. Repeat for each page.

## 4. Option C — Lighthouse (built into Chrome)

Gives a numeric score that's handy for tracking over time.

1. Open the page in Chrome → DevTools (`F12`) → **Lighthouse** tab.
2. Check **Accessibility**, choose **Desktop** (then repeat with **Mobile**).
3. Click **Analyze page load**.
4. Target an **Accessibility score of 100**; read any flagged items.

## 5. Option D — Command line / CI (for an automated, repeatable record)

Useful if you want a saved report file or a check that runs on every deploy.
Requires Node.js installed.

```bash
# One-off scan of all three pages with pa11y (WCAG2AA ruleset):
npx pa11y --standard WCAG2AA https://thedelightstudio.com/
npx pa11y --standard WCAG2AA https://thedelightstudio.com/services.html
npx pa11y --standard WCAG2AA https://thedelightstudio.com/contact.html

# Or with the axe-core CLI (spins up headless Chrome):
npx @axe-core/cli https://thedelightstudio.com/ https://thedelightstudio.com/services.html https://thedelightstudio.com/contact.html
```

Redirect output to a file to keep a dated record, e.g.
`npx pa11y --standard WCAG2AA https://thedelightstudio.com/ > a11y-home-$(date +%F).txt`

---

## 6. What automated tools CANNOT verify (do these manually)

Automated scanners catch ~30–40% of WCAG issues. Confirm the rest by hand:

- **Keyboard-only:** unplug/ignore the mouse — can you reach and operate everything (nav, social links, all form fields, submit)? Is focus always visible? No traps?
- **Focus order** is logical (top-to-bottom, left-to-right).
- **Screen reader spot-check:** with VoiceOver (Mac: `Cmd+F5`) or NVDA (Windows, free), confirm the logo/nav/headings/form labels are announced sensibly.
- **200% zoom / 400% zoom:** browser zoom to 200% and 400% — content should reflow with no loss or horizontal scrolling.
- **Content still makes sense** with images/CSS off.

---

## 7. Baseline already built in (as of this build)

- Skip-to-content link + `<main>` landmark on every page.
- Theme-aware `:focus-visible` focus rings on all interactive elements.
- All text contrast ≥ 4.5:1 (normal) / ≥ 3:1 (large); form-field borders ≥ 3:1.
- Every form control has a `<label>`; personal fields use `autocomplete`; native
  required/email validation enabled.
- One `<h1>` per page, logical headings; decorative SVGs `aria-hidden`; logo mark named.
- `lang="en"`, unique page titles, no duplicate IDs.
- Decorative animation honors `prefers-reduced-motion`.
- Responsive with no horizontal scroll down to 320 px.

> Note: the contact form currently opens the visitor's email app (a `mailto:` link).
> When it moves to a real form backend, re-test that success/error messages are
> announced to assistive technology (WCAG 4.1.3 Status Messages).

---

## 8. Continuous integration — pa11y (already wired up)

An automated scan runs on **every push / pull request to `main`** (and on demand)
via GitHub Actions. No deployed URL is needed — the CI runner serves the static
files and scans them locally, and the job **fails** if any issue is found.

**Files involved:**

| File | Purpose |
|------|---------|
| `.github/workflows/accessibility.yml` | The GitHub Action |
| `.pa11yci` | pa11y-ci config — WCAG2AA, axe runner, the 3 page URLs |
| `package.json` | `npm run test:a11y` serves the site + runs the scan |

**Run it locally exactly as CI does** (requires Node.js):

```bash
npm install
npm run test:a11y
```

**Why `color-contrast` is excluded from the automated scan:**
`.pa11yci` contains `"ignore": ["color-contrast"]`. This is deliberate. The design
uses gradient backgrounds (the landing glow, the package cards, the form card),
and automated engines (axe, HTMLCS) **cannot read the true colour behind text on
a gradient** — they fall back to an assumed background and emit false-positive
contrast failures. Colour contrast is therefore verified **manually** (see §1–§6):
every text/background pair was checked and meets AA. **Re-verify contrast by hand**
(axe DevTools colour picker, or inspect the rendered pixels) whenever colours
change — the CI scan does not cover it.

Everything else axe checks **is** enforced by CI: ARIA usage, name/role/value,
form labels, landmarks, heading structure, duplicate IDs, image alternatives, and
more. (During setup this scan caught and we fixed one real issue — an `aria-label`
on an element whose role didn't permit it.)

> First run on GitHub: the repo must be pushed to GitHub with Actions enabled.
> The workflow triggers on push/PR to `main`; you can also run it manually from
> the repo's **Actions** tab → "Accessibility (pa11y)" → **Run workflow**.
