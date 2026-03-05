# CLAUDE.md - LLM NIKKE Theme Extension

## Plan Tracking (MANDATORY)

Before starting ANY implementation task:
1. Read `PLAN.md` to check current phase and progress
2. Only work on tasks within the current active phase
3. After completing each task, update PLAN.md checkbox ([ ] -> [x])
4. After completing a phase, mark the phase as done and note the next phase
5. If a task is blocked or scope changes, update PLAN.md with notes before proceeding

PLAN.md is the single source of truth for project progress.

## Workflow Protocol

### 1. Socratic Interview (MANDATORY before any implementation)

When the user requests a feature, DO NOT write code immediately.
Instead, ask 5-7 clarifying questions to define the spec first.

**No exceptions.** Even if PLAN.md has clear task items, the Socratic Interview still applies.
PLAN.md defines *what* to build, but the interview clarifies *how* — design details,
edge cases, and user expectations that task titles alone cannot capture.

Questions should cover:
- Scope: what exactly changes, what stays the same?
- Edge cases: what happens when X is missing/empty/unexpected?
- Visual: exact layout, positioning, colors, sizes
- Interaction: user actions, transitions, animations
- Data flow: where does the data come from, how does it update?
- Failure: what happens when it breaks?

Only after the user answers and confirms the spec, proceed to implementation.

Example:
  User: "VN mode streaming text"
  DO NOT: start writing vn.js immediately
  DO: ask —
    - "Streaming text appears character-by-character or chunk-by-chunk?"
    - "Code blocks in the response — show in VN dialogue or skip?"
    - "When ChatGPT finishes streaming, what visual cue indicates completion?"
    - "If the response is very long, does the dialogue box scroll or paginate?"
    - "ChatGPT original UI — hide completely or keep visible underneath?"

### 2. Tracer Bullet (smallest working proof first)

Before building any feature fully, create the smallest possible proof that the core mechanism works.

- VN streaming? First just console.log the streaming text from ChatGPT DOM.
- Chat theme? First just change one color on one element.
- Toggle? First just a button that logs "clicked".

Confirm the tracer works, THEN build the full feature on top.

### 3. Definition of Done (explicit per task)

Every task must have a concrete DoD before starting. Examples:
- "When I open ChatGPT and the extension is loaded, the last assistant message text appears in console.log in real-time as it streams."
- "When I click the toggle button, body class switches between llm-nikke-vn and llm-nikke-chatting."

If the DoD is not met, the task is NOT complete. Do not report "done" without verifying.

### 4. Failure Recovery

If something doesn't work after 2-3 attempts:
- STOP and classify the failure:
  - Context gap: missing info about ChatGPT DOM, API, etc.
  - Wrong approach: the strategy itself is flawed
  - Structural conflict: extension architecture doesn't support this
- Report the classification to the user before trying again
- Do NOT retry the same approach hoping for different results

### 5. Incremental Commits

Commit after each working milestone (every 3-5 files or each completed feature).
Never build 10+ files without a checkpoint.

## Technical Notes

- ChatGPT DOM changes frequently. Always verify selectors against actual DOM before coding.
- CSS: never override ChatGPT styles globally. Use scoped classes (body.llm-nikke-vn, body.llm-nikke-chatting) or separate overlay layers.
- VN mode is a full-screen overlay ON TOP of ChatGPT, not a modification of ChatGPT's layout.
- Chat mode only changes colors/fonts, never layout or sizing.
