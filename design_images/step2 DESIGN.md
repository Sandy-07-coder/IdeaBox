```markdown
# Design System Specification: The Incubator Paradigm

## 1. Overview & Creative North Star: "The Digital Greenhouse"

This design system is built to transition "Idea-Box" from a simple repository to a high-velocity launchpad. Our Creative North Star is **"The Digital Greenhouse."** Just as a greenhouse provides a structured, clear, and nurturing environment for growth, this system uses high-clarity layouts, deep tonal layering, and sophisticated transparency to foster trust and professional momentum.

We move beyond the "SaaS-standard" by embracing **Editorial Fluidity**. We reject the rigid, boxed-in grids of the early 2010s in favor of asymmetric breathing room and "Ghost Borders." The aesthetic is professional yet vibrant—using our primary Indigo not just as a color, but as a light source that illuminates the path to conversion.

---

## 2. Colors & The Surface Philosophy

Our palette is anchored in `Primary (#4a40e0)` and `Background (#f5f7f9)`. However, the sophistication lies in how we layer them.

### The "No-Line" Rule
**Borders are a relic of the past.** In this system, 1px solid lines for sectioning are strictly prohibited. Boundaries must be defined through background shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to define its territory.

### Surface Hierarchy & Nesting
Think of the UI as physical layers of fine paper or frosted glass. 
- **Base Layer:** `surface` (#f5f7f9)
- **Secondary Sectioning:** `surface-container-low` (#eef1f3)
- **Interactive/Content Containers:** `surface-container-lowest` (#ffffff) for maximum "pop" and elevation.

### The Glass & Gradient Rule
To achieve a "vibrant" tech feel, use **Glassmorphism** for floating elements (e.g., Navbars, Hover Cards).
- **Token Application:** Use `surface` with 70% opacity + `backdrop-blur: 20px`.
- **Signature Gradients:** For high-conversion CTAs, utilize a linear gradient from `primary` (#4a40e0) to `primary-container` (#9795ff). This adds "soul" and prevents the flat, utilitarian look of standard buttons.

---

## 3. Typography: Editorial Authority

We use **Inter** not as a default, but as a precision tool. The hierarchy is designed to guide the eye toward conversion points.

- **Display (lg/md/sm):** Used for "Big Ideas." Set with tight letter-spacing (-0.02em) to create an authoritative, editorial look.
- **Headline & Title:** These are your "Trust Anchors." Use `headline-lg` (2rem) for section starters to give the brand a premium, established feel.
- **Body (lg/md/sm):** The workhorse. Always ensure `on-surface-variant` (#595c5e) is used for secondary body text to maintain a soft, legible contrast that doesn't strain the eye.

**The Identity Logic:** By pairing a massive `display-lg` headline with a nimble `label-md` uppercase tag, we create a "Scale Gap." This asymmetry is the hallmark of high-end startup design.

---

## 4. Elevation & Depth: Tonal Layering

We do not use drop shadows to create "fake" depth; we use **Tonal Stacking**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift from `#ffffff` to `#eef1f3` provides a sophisticated lift that is felt rather than seen.
*   **Ambient Shadows:** If an element must float (like a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 50px rgba(74, 64, 224, 0.05)`. Note the indigo tint—never use pure black for shadows.
*   **The "Ghost Border":** If accessibility requires a stroke, use `outline-variant` (#abadaf) at **15% opacity**. It should be a suggestion of a border, not a hard stop.

---

## 5. Components

### Buttons (The Conversion Engines)
*   **Primary:** Gradient from `primary` to `primary-dim`. Corner radius: `xl` (12px). No border.
*   **Secondary:** `secondary-container` background with `on-secondary-container` text. Use for "Low-friction" actions.
*   **States:** On hover, primary buttons should scale slightly (1.02x) and increase shadow diffusion, rather than just changing color.

### Cards & Lists
*   **Rule:** **No Dividers.** Separate list items using `8` (2rem) vertical spacing or a subtle `surface-container` background hover state. 
*   **Incubator Cards:** Use `surface-container-lowest` with a 12px `xl` corner. Add a `primary-fixed` top-accent (2px) for "featured" startup ideas.

### Input Fields
*   **Style:** Minimalist. `surface-container-low` background, no border, `xl` corners. 
*   **Focus State:** A 2px "Ghost Border" of `primary` at 40% opacity. Avoid heavy glow effects.

### Additional Signature Component: The "Growth Chip"
For startup stages (e.g., "Seed," "Series A"), use a `tertiary-container` chip with `on-tertiary-container` text. This provides a vibrant pop of color that contrasts against the Indigo, signaling energy and movement.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical padding (e.g., more padding at the top of a section than the bottom) to create an editorial flow.
*   **Do** use `primary-container` for subtle backgrounds of highlighted text.
*   **Do** allow elements to overlap (e.g., an image "bleeding" out of a container) to break the "template" feel.

### Don’t:
*   **Don’t** use 100% black (#000000) for text. Use `on-surface` (#2c2f31) to maintain the premium "slate" feel.
*   **Don’t** use the `DEFAULT` (0.5rem) corner radius for main containers; always opt for `xl` (12px) to maintain the "Idea-Box" brand signature.
*   **Don’t** use horizontal rules (`<hr>`). Use white space (`spacing.12` or `spacing.16`) to define shifts in thought.

---

**Director’s Final Note:** This design system is not a set of constraints; it is a philosophy of space. Use the Indigo sparingly as a "high-conversion light," and let the slate-white surfaces provide the "professional air" that startups need to feel trusted.```