# Nebula Knife — Feature Build Plan

Two features built across 8 reviewable steps: a menu search box with category filtering, and a contact form with inline validation and success state.

---

## Files changed

| File | Changes |
|---|---|
| `menu.html` | Search section, clear button, empty state, category dropdown |
| `contact.html` | `novalidate`, `aria-describedby`, error spans, success div |
| `script.js` | All filtering, validation, and submit logic |
| `styles.css` | Search, validation, and success state styles appended |

---

## Step 1 — Search input UI
**Files:** `menu.html`, `styles.css`

Added a styled search input above the menu categories with a magnifying glass icon. No behaviour yet — UI only.

- `<input type="search" id="menu-search">` inserted between `.menu-intro` and `.menu-section`
- Custom arrow, cyan focus ring, and dark card background matching existing form inputs
- `.visually-hidden` label for screen readers
- Browser-native cancel button hidden via `::-webkit-search-cancel-button`

**Test:** Input renders correctly on desktop and mobile with no layout shift.

---

## Step 2 — Wire input to state
**Files:** `script.js`

Introduced `searchQuery` as the single in-memory variable holding the current query. Temporary `debugEl` paragraph displayed the live value below the input for verification.

**Test:** Typing updates the cyan debug line on every keystroke; clearing the input removes it.

---

## Step 3 — Filter items by query
**Files:** `script.js`

Replaced the debug display with `filterMenu()`. On each keystroke, loops over all `.menu-item` elements and hides any whose `.menu-item-name` or `.menu-item-desc` doesn't match the lowercased query.

**Test:** `scallop` → one result; `chocolate` → one result; clearing restores all items; case-insensitive.

---

## Step 4 — Empty state + clear button
**Files:** `menu.html`, `styles.css`, `script.js`

- Added `<button id="search-clear">` with an × icon inside `.search-input-group`
- Added `<p id="search-empty" aria-live="polite">` below the input group
- `filterMenu` now tracks `visibleCount` and toggles both elements accordingly
- Escape key clears the input and resets filter

**Test:** `zzz` → empty state appears with query echoed in cyan; clicking × clears and restores; Escape key works.

---

## Step 5 — Contact form markup scaffold
**Files:** `contact.html`, `styles.css`

Prepared the form for JS validation without changing visible behaviour.

- `novalidate` added to `<form>` — disables all browser-native validation
- `required` removed from all inputs
- `aria-describedby` added to each input pointing to a sibling `<span class="field-error">`
- Error spans are empty and invisible; `min-height` reserved so layout doesn't jump
- `.is-invalid` and `.is-valid` CSS classes defined (red/green border + glow)

**Test:** Page renders identically to before; no layout shift; error spans invisible.

---

## Step 6 — Inline validation logic
**Files:** `script.js`

Replaced the original `alert()`-based handler with per-field validation.

- `showError(id, message)` — adds `.is-invalid`, sets `aria-invalid="true"`, writes error text
- `showValid(id)` — adds `.is-valid`, sets `aria-invalid="false"`, clears error text
- `validateField(id)` — rules per field:
  - **name:** required, min 2 characters
  - **email:** required, regex `/^[^\s@]+@[^\s@]+\.[^\s@.][^\s@]*$/` (blocks double-dots)
  - **message:** required, min 10 characters
- `blur` triggers validation on first interaction; `input` re-validates live once a field has errored
- Submit validates all fields, blocks if any fail, focuses the first invalid field

**Test:** Tab through empty fields → errors appear per field; fix a field → error clears live; bad email format → correct message; submit blocked until all valid.

---

## Step 7 — Submit simulation + success state
**Files:** `contact.html`, `script.js`, `styles.css`

- Submit button disables and reads "Sending…" for 1.5s
- After delay: form hides, `#form-success` shows with a green checkmark, focus moves to "Send Another Message"
- "Send Another Message" button reverses the swap and returns focus to the name field
- Form resets silently in the background (values, classes, error text, button state)

**Test:** Valid submit → button disables → success card slides in; click reset → blank form reappears; second submit works cleanly.

---

## Step 8 — QA + edge case fixes

Three bugs found and fixed:

### Fix 1 — Whitespace-only search query (`script.js`)
`"   "` (spaces only) correctly produced an empty `searchQuery` after `.trim()` but left whitespace visible in the input. Added `searchInput.value = query.trimStart()` inside `filterMenu` to keep the visible value in sync.

### Fix 2 — `aria-live` double-announcement (`contact.html`)
`aria-live="polite"` on the `.field-error` spans caused screen readers to announce errors twice — once from the live region firing, once when focus landed on the field and read `aria-describedby`. Removed `aria-live` from all three spans; `aria-describedby` alone is the correct pattern for field-bound errors.

### Fix 3 — Hoisted declarations (`script.js`)
`formSuccess` and `formResetBtn` were declared after the submit listener. Moved both to the top of the `if (contactForm)` block so a missing `#form-success` element produces an immediate, obvious error on page load rather than a silent failure at submit time.

---

## Step 9 — Category dropdown filter
**Files:** `menu.html`, `styles.css`, `script.js`

Added a `<select>` dropdown left of the search input filtering by category: All, Small Plates, Mains, Desserts, Drinks.

- Each `.menu-category` got a `data-category` attribute (`small-plates`, `mains`, `desserts`, `drinks`)
- `activeCategory` state variable introduced alongside `searchQuery`
- `filterMenu` runs in two passes: first hides/shows whole categories by dropdown value, then filters `.menu-item` elements within visible categories by query
- Selecting a new category resets the search input and re-runs the filter
- On mobile (< 480px) the dropdown stacks above the search input full-width

**Interaction model:** dropdown narrows the scope first; search narrows within that scope.

**Test:** Select "Mains" → other sections hide; type "ramen" → only Orbit Ramen visible; select "All Categories" → everything restored.

---

## Validation rules reference

| Field | Rule | Error message |
|---|---|---|
| Full Name | Required | "Full name is required." |
| Full Name | Min 2 chars | "Name must be at least 2 characters." |
| Email | Required | "Email address is required." |
| Email | Valid format | "Please enter a valid email address." |
| Message | Required | "Please write us a message before sending." |
| Message | Min 10 chars | "Message must be at least 10 characters." |
