# PyQuest iOS workspace redesign

## Goal

Redesign PyQuest as a bright, focused workspace that borrows the restraint, spacing, composition, and polish of Framer.com without copying its branding, content, layout, or assets. The result should feel native to iOS: system typography, frosted sidebars, soft depth, familiar controls, and direct instructional copy.

This is a presentation refactor. Preserve the 30-day course, lesson data, editor, tests, coach behavior, progress rules, local persistence, runtime, responsive course drawer, accessibility semantics, and tested content order.

## Architecture

Keep the existing React, TypeScript, CodeMirror, Pyodide, domain, runtime, and storage boundaries. Do not change curriculum data or progression rules.

`App` remains the state and coordination boundary. Move its rendered sections into these presentation components:

- `WorkspaceHeader` owns the mobile course trigger, product title, runtime state, level, XP, and streak presentation.
- `LessonPanel` renders the lesson in the existing order: lesson identity, rationale, lesson notes, example, key terms, then worked example.
- `ChallengePanel` renders the challenge prompt, actions, conditional hint and answer, then the editor.
- `ResultsPanel` restyles the current terminal output without changing result data or live-region behavior.
- `QuestLog` remains course navigation and the drawer body.
- `CoachRail` remains the dedicated coach area and keeps local and AI states, suggestions, composer, privacy copy, and conversation reset rules.

Presentation components receive data and callbacks through props. They must not read storage, call the runtime, or duplicate progress logic. Existing domain tests remain the source of truth for XP, unlocks, attempts, hints, answers, and streaks.

## Layout and visual system

Use a three-column desktop workspace above 1240px:

- Course sidebar: `280px`.
- Main workspace: `minmax(560px, 1fr)`, capped at `920px` for readable lesson content.
- Coach sidebar: `360px`.

The page background is a quiet cool gray. Both sidebars remain visible and sticky at desktop sizes. They use translucent white fills and backdrop blur. The main column scrolls as one document. Cards sit on the page rather than forming a dark IDE frame.

Use these tokens as CSS custom properties:

```css
--color-canvas: #F4F6F8;
--color-surface: rgba(255, 255, 255, 0.86);
--color-surface-solid: #FFFFFF;
--color-surface-muted: #F0F2F5;
--color-border: rgba(15, 23, 42, 0.10);
--color-border-strong: rgba(15, 23, 42, 0.18);
--color-text: #111827;
--color-text-muted: #667085;
--color-accent: #0A84FF;
--color-accent-pressed: #0066CC;
--color-success: #248A3D;
--color-warning: #B54708;
--color-danger: #D92D20;
--color-code-bg: #111318;
--color-code-text: #F5F7FA;
--blur-sidebar: 24px;
--radius-control: 10px;
--radius-card: 18px;
--radius-panel: 22px;
--shadow-card: 0 1px 2px rgba(15, 23, 42, 0.05), 0 10px 30px rgba(15, 23, 42, 0.07);
--shadow-overlay: 0 18px 50px rgba(15, 23, 42, 0.18);
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

Use `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif` for interface and lesson text. Use `ui-monospace, "SFMono-Regular", "Cascadia Code", Consolas, monospace` only for code, terminal output, filenames, and values where alignment matters. Do not load a web font.

Body text is 15 to 17px with a 1.55 to 1.65 line height. The lesson title uses `clamp(28px, 4vw, 44px)`, weight 700, and tight but readable tracking. Labels use 12 to 13px, weight 600. Avoid all-caps labels except established runtime tokens such as PASS and FAIL.

## Component decisions

### Course sidebar

Use a frosted white panel with a thin right border. Replace the tilted game badge with a simple 32px rounded-square `Py` mark. The subtitle becomes "30 days of Python".

Each day is a 44px minimum-height row. Selected days use a pale blue fill and a blue leading indicator. Completed days use a checkmark plus text. Locked days remain disabled and show a lock icon or the word "Locked", not an `×`. Keep the current accessible day name, selected state, disabled state, and 30-day scroll.

### Workspace header

Combine runtime and progress into one compact header. Use plain labels:

- "Starting Python", "Python ready", or "Python unavailable".
- "Level {n}", "{xp} XP", and "{streak} day streak".

The level progress bar remains a labeled progressbar with the existing 0 to 300 range. Runtime state must include text and an icon, not color alone.

### Lesson panel

Use one white panel with 32 to 40px desktop padding. Keep the tested document order unchanged. Present lesson notes as a real list. Render the example as a quiet inset callout, key terms as a definition list, and the worked example as a dark code block with a small "Python" label.

Boss and completion states use compact native-style status capsules. They are secondary to the lesson title.

### Challenge and editor

Use a separate white panel beneath the lesson. Keep challenge title, XP reward, prompt, run controls, conditional hint and answer, then editor in that DOM order. Keep the controls sticky within the main column above 620px. Reserve their height in layout so they do not cover content.

"Run tests" is the filled blue primary button. "Reset" is a bordered secondary button. "Show hint", "Show answer", and "Retry Python" are text or tinted buttons. All controls have a 44px minimum touch target. Disabled controls remain readable and expose their disabled state.

Keep the editor dark for contrast and familiarity. Replace the imported One Dark theme with a local CodeMirror theme based on the code tokens above. The local theme must preserve Python highlighting, selection, gutters, cursor, focus, and disabled states. The editor frame uses a 14px radius and a simple header with `solution.py` and `Python`.

### Results

Rename the visible panel heading from "Test output" to "Results" while keeping its accessible purpose clear. The empty state says "Run your code to see the results." Running, passed, failed, traceback, stdout, stderr, and runtime errors retain their current data and order.

Use a dark output area. Pass, fail, and error rows pair icons with text. Do not rely on green or red alone. Long tracebacks scroll horizontally or wrap at safe boundaries without expanding the page.

### Coach sidebar

Keep the coach as a dedicated right rail on wide screens. Use the same frosted treatment as the course sidebar. Remove the decorative `PQ` initials. Show "Built-in coach" first, then the current source label, either "Local" or "AI · Haiku".

Messages use restrained rounded bubbles. Learner messages use a pale blue fill. Coach messages use solid white with a border. Keep the conversation log, polite announcements, suggested questions, input label, Send action, AI fallback, and privacy note. On desktop, the rail fills the viewport and the composer stays sticky at its bottom. In the stacked layout, the composer follows the message log in normal document flow.

## Responsive behavior

At `1240px` and below, hide the course sidebar off-canvas and expose a "Course" button in the workspace header. The drawer is at most `320px` wide and `calc(100vw - 32px)`. It uses the same course content, traps focus while open, closes on Escape, closes after selecting a day, restores focus to the trigger, and has a labeled close control. The scrim blocks background interaction.

At `900px` and below, move the coach below the results as a full-width panel. The document order becomes header, lesson, challenge and editor, results, coach, footer. Do not create a second coach instance.

At `620px` and below:

- Use 12px page gutters and 20px card padding.
- Stack progress details without truncating runtime text.
- Let action buttons wrap, with "Run tests" taking the first full row.
- Keep every control at least 44 by 44px.
- Keep the editor at least 320px tall.
- Avoid horizontal page scrolling at 320px viewport width.

Apply `env(safe-area-inset-top)`, `env(safe-area-inset-right)`, `env(safe-area-inset-bottom)`, and `env(safe-area-inset-left)` to the matching edges of the fixed drawer. Apply bottom safe-area padding to the desktop coach composer and the mobile page footer.

## Copy policy

Use direct instructional language. Name the action or state:

- "Run tests", not "Launch your solution".
- "Python unavailable", not "Runtime offline".
- "Try this after two failed runs", not "A hint has been unlocked".
- "Compare this solution with yours", not motivational filler.

Preserve curriculum text and tested labels unless a label change is named in this spec. Do not add slogans, game lore, claims about speed or intelligence, or generic encouragement. Keep technical terms when they teach Python. Explain unfamiliar terms in the existing key-term section.

Framer.com is a reference for restraint, spacing, composition, and polish only. Do not copy its product copy, logos, illustrations, navigation, exact page structure, or distinctive branded effects.

## Motion and accessibility

Use motion only to explain state changes:

- Drawer: 200ms ease-out slide with a simultaneous scrim fade.
- Buttons: 120ms color and shadow change, with no bounce or large translation.
- New results and coach messages: 160ms fade with 4px vertical movement.

Honor `prefers-reduced-motion` by removing movement and reducing fades to near-instant state changes. Do not autoplay decorative animation.

Keep semantic headings, lists, definition lists, navigation, complementary regions, forms, progressbar attributes, `aria-current`, `aria-expanded`, and live regions. Focus indicators use a 2px blue ring with a 2px offset and must remain visible against light and dark surfaces. Text and meaningful icons meet WCAG 2.2 AA contrast. Normal text needs at least 4.5:1, large text and control boundaries at least 3:1. Color never carries status alone.

After a run, the Results polite live region announces the update while focus stays on the control that started the run. Keep the previous failure visible during a rerun.

## Runtime, error, and empty states

The editor remains usable while Python starts or fails. Disable only actions that require a ready runtime.

- Starting: show "Starting Python" and disable "Run tests".
- Ready: show "Python ready" and enable "Run tests".
- Runtime failure: show "Python unavailable", the existing error detail in Results, and "Retry Python".
- Running: change the primary label to "Running...", keep the last result visible, and disable editing, reset, and duplicate runs as they are today.
- Test failure: show expected and received values and send the diagnosis to the coach.
- Python exception: show the full traceback.
- AI failure: replace the pending AI response with the local response and show "AI unavailable. Using the local coach."
- Invalid or missing progress: continue with safe default progress using the existing storage behavior.

No visual state may hide a retry path, traceback, assertion detail, saved draft, or progress status.

## Testing and acceptance

Keep all current domain and interface tests passing. Update selectors only when visible labels intentionally change in this spec. Add or extend interface tests for:

- The lesson order remains notes, example, key terms, worked example, challenge.
- Run controls remain before the editor.
- Desktop sidebars and responsive coach placement use one instance of each region.
- The course drawer opens, closes by button, scrim, and Escape, restores focus, and closes after day selection.
- Runtime labels and disabled actions match starting, ready, running, and unavailable states.
- Hint after two failures and answer after four failures remain unchanged.
- Previous failure details remain visible during reruns.
- Coach local, AI, thinking, and fallback states remain available.
- Status never relies on color alone.

Run the full Vitest suite, TypeScript checking, and production build. Test keyboard navigation and visible focus at desktop, 900px, 620px, and 320px widths. Check light-surface and dark-code contrast, reduced motion, 200% zoom, long lesson titles, long tracebacks, and a full 30-day sidebar.

The redesign is accepted when the interface matches this spec without changing curriculum content, progression, saved data, runtime requests, coach answers, test result detail, or the tested content order.

## Out of scope

- Curriculum rewrites, new lessons, new challenges, or changed answers.
- Changes to XP, levels, streaks, unlocks, hint thresholds, or answer thresholds.
- Accounts, cloud sync, backend persistence, analytics, payments, or social features.
- Runtime, worker protocol, Pyodide package loading, timeout, or test harness changes.
- Coach model, prompt, escalation, privacy, or API changes.
- A dark mode, theme picker, custom icon package, web font, illustration system, or Framer asset.
- New navigation routes, onboarding, settings, certificates, or progress reset.
- Broad refactors outside the presentation components needed for this redesign.
