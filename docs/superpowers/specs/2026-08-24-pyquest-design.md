# PyQuest design

## Product goal

PyQuest is a browser-only coding course based on the 30 Days of Python progression. Learners write Python, run it against tests, inspect failures, and unlock the next quest. The app treats errors as teaching material: failed assertions show actual and expected values, and exceptions retain their Python traceback.

The first release has all 30 days of content, sequential progression, six boss battles, local persistence, and no server.

## Technical shape

The app uses Vite, React, and TypeScript. CodeMirror 6 supplies the editor and Python highlighting. A Web Worker owns a single Pyodide runtime loaded from the official CDN at startup. Vitest and Testing Library cover domain and interface behavior.

The worker boundary prevents learner code from blocking React. Each run has a time limit. If code does not finish, the app terminates the worker, reports a timeout, and boots a new runtime. The runtime can load a declared Pyodide package for the small number of challenges that need one, such as pandas.

The browser bundle contains test definitions. They are hidden from the normal learner interface but are not secrets against source inspection.

## Main interface

The desktop layout resembles an IDE:

- A left quest log lists all 30 days with cleared, current, and locked states.
- A compact top status strip shows runtime state, level, XP progress, and streak.
- The main pane shows the topic, a short explanation, a concrete example, and challenge tabs when a day has more than one challenge.
- The editor fills most of the working area.
- "Run tests" is the primary action. "Reset code" restores the starter without changing earned progress. "Hint" appears after two failed runs.
- A scrolling terminal panel shows runtime messages, captured output, pass or fail lines, assertion details, and tracebacks.

On narrow screens, the quest log becomes a drawer and the lesson, editor, and terminal stack vertically.

The visual system uses a near-black blue-green background, inset editor chrome, subtle scanline texture, cyan success states, amber rewards, and red failures. JetBrains Mono is the primary font with a monospace fallback. Motion stays limited to runtime boot, progress changes, and small success feedback.

## Curriculum model

Curriculum is typed static data. Each day contains:

- Day number, title, topic, explanation, and real-world example.
- One to three challenges.
- For each challenge: stable ID, prompt, starter code, one-line hint, XP reward, optional package dependencies, and hidden test cases.
- A boss flag on every fifth day.

The day order is:

1. Variables and `print`
2. Built-in functions
3. Operators
4. Strings
5. Lists and block-one boss
6. Tuples
7. Sets
8. Dictionaries
9. Conditionals
10. Loops and block-two boss
11. Functions
12. Modules
13. List comprehensions
14. Higher-order functions
15. Type errors and block-three boss
16. Dates and times
17. Exception handling
18. Regular expressions
19. File handling with in-memory text streams
20. Packages and virtual environments with a simulated package manifest boss
21. Classes and objects
22. Web scraping from supplied HTML
23. Data extraction pipelines from supplied HTML
24. Statistics
25. Pandas basics and block-five boss
26. Flask and FastAPI concepts through pure request-handler functions
27. API consumption using supplied JSON data
28. API response building
29. API routing and validation
30. Final API and data-processing boss

Boss days still teach the topic assigned to that day. Their challenge combines concepts from the current five-day block. All exercises are deterministic and require no network access.

## Test execution protocol

React sends a run request containing a unique request ID, learner source, test definitions, and declared packages. Test definitions describe the callable, arguments, expected result, and a human-readable label. They do not rely on evaluating arbitrary JavaScript.

The worker:

1. Ensures declared Pyodide packages are loaded.
2. Creates a fresh Python globals dictionary for the run.
3. Redirects stdout and stderr.
4. Executes learner code once.
5. Runs each test independently through a small Python test harness.
6. Serializes Python values into readable representations.
7. Returns captured output and one result per test.
8. Destroys temporary Python proxy objects and globals.

Result variants are explicit:

- `passed`: label and optional captured output.
- `failed`: label, expected representation, and actual representation.
- `error`: label and traceback.
- `timeout`: a run-level message produced by the main thread after worker termination.

Syntax errors and top-level exceptions return the full traceback and mark every test as blocked by that error. A worker boot error leaves the editor usable but disables test execution and offers a retry action.

## Progress and persistence

The app stores one versioned record in `localStorage`. It contains total XP, completed challenge IDs, cleared day numbers, attempt counts, code drafts, last activity date, current streak, longest streak, and the most recently viewed unlocked day.

Storage parsing validates every field. Missing, malformed, or future-version data falls back to safe defaults without crashing the app. Drafts save after a short debounce and immediately before a run.

Rules:

- A challenge awards XP only on its first passing run.
- A day clears after every challenge on that day has passed.
- Clearing a day unlocks the next day.
- Failed runs increment that challenge's attempt count.
- The hint becomes available after two failed runs.
- A successful challenge updates streak data at most once per local calendar date.
- Success today after success yesterday increments the streak.
- Success after a gap sets the streak to one.
- Level is `floor(totalXp / 300) + 1`.
- Level progress is `totalXp % 300` out of 300.

The initial release has no progress reset button because accidental data loss is worse than the small convenience. Browser storage tools can still clear development data.

## Component and module boundaries

- `curriculum`: static lesson content plus integrity validation.
- `progress`: pure progression, XP, streak, and unlock calculations.
- `storage`: validated browser persistence and draft debouncing.
- `runtime`: worker lifecycle, request timeout, reboot, and result protocol.
- `editor`: CodeMirror setup and controlled draft integration.
- `quest-log`: navigation constrained by unlock state.
- `challenge-workspace`: lesson copy, challenge selection, run controls, and hints.
- `terminal`: accessible rendering of boot, output, pass, failure, error, and timeout states.
- `app-shell`: responsive layout and coordination between the modules.

No component reads or writes `localStorage` directly. No component communicates with the worker directly. Those effects stay behind the storage and runtime modules.

## Accessibility

All controls are keyboard reachable. Status does not depend on color alone: icons and text accompany cyan, amber, and red. The runtime status uses an appropriate live region, while terminal results use a polite live region to avoid reading every keystroke. Focus moves to the result summary after a test run without trapping the learner in the terminal.

## Verification

Domain tests cover:

- XP cannot be awarded twice.
- Sequential unlock and full-day completion.
- Hint thresholds and attempt counting.
- Same-day, consecutive-day, and missed-day streak behavior.
- Level boundaries at 299, 300, and 600 XP.
- Persistence validation and fallback.
- Curriculum uniqueness, valid day ordering, boss placement, non-empty tests, and starter code.
- Runtime message parsing and timeout recovery.

Interface tests cover booting, ready, boot failure, locked navigation, draft restoration, hint reveal, successful completion, assertion failure details, and traceback display.

The final verification sequence runs the full test suite, TypeScript checking, a production build, lint diagnostics, and a browser smoke test of Day 1 through Day 3. Curriculum challenge solutions are also executed against their tests in Pyodide where practical, with pure-Python validation used for content that does not need browser APIs.

## Delivery boundaries

This release does not include accounts, cloud sync, leaderboards, social features, a backend, remote code execution, or live network exercises. Pyodide's first load requires network access to its CDN. Repeat availability depends on the browser cache.
