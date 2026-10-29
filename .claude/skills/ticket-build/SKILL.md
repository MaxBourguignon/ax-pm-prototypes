---
name: ticket-build
description: Use this skill to turn a feature idea, topic, or piece of content into short, dev-ready engineering tickets for Arenametrix's Build project (Monday.com, repos walnut/backend and tigerlily/frontend). Trigger on "write a ticket," "draft a ticket," "spec out a ticket for dev," "turn this into a Build ticket," or any feature/page/component/webservice/bug description meant for engineers to pick up — even without the word "ticket." Also use for rough notes, Slack threads, or meeting recaps to turn into tickets. Interactive skill — given just a topic, it first proposes a ticket plan (how many tickets, titles, repo per ticket, one-line scope) and pushes back/asks questions to pressure-test the split with the PM before writing anything; only once confirmed does it draft, and it keeps tickets short and non-technical (CONTEXT, EXPECTED BEHAVIOR, REQUIREMENTS) rather than long technical specs.
---

# Writing Build tickets

Arenametrix's Build tickets (tracked on Monday.com, repos **walnut** for backend and
**tigerlily** for frontend) are meant to be read and understood in seconds by a
developer — not treated as a full technical spec. The PM's job here is to make sure
engineering understands the *what* and the *why*; the *how* is the engineer's job.
When in doubt, cut detail rather than add it.

This skill runs in two phases: first agree on the plan (how many tickets, what they're
called, which repo), then draft. Don't skip straight to writing tickets from a topic —
the planning conversation is where the real thinking happens, and it's much cheaper to
argue about a one-line title than to rewrite a fully drafted ticket.

## Phase 1 — Propose and align on the plan

Given a topic, feature, or piece of content, work out how it should be split into
tickets and propose that plan before drafting anything. For each proposed ticket, give:

- **Title** — short and specific
- **Repository** — walnut, tigerlily, or both (see below for how to figure this out)
- **One-line description** — just enough to convey scope, not the full spec

Present this as a short numbered list, e.g.:

```
1. Duplicate-email detection service (walnut) — backend check that flags a new
   contact's email against existing contacts.
2. Merge prompt on contact creation (tigerlily) — show a merge-or-create-anyway
   prompt when the backend flags a duplicate.
```

Then **challenge the plan** the way a sharp engineering lead would before signing off —
don't just present it and wait. Ask the questions that would actually change the split:
does this need to be broken down further, does one of these hide real complexity that
deserves its own ticket (like a "merge" step often does), is the repo assignment right,
is there a dependency between tickets that matters. Say what you're unsure about rather
than picking silently. The PM will push back or approve — treat the plan as a draft
until they've confirmed it, and revise the plan itself (not full tickets) in response to
their feedback. Only move to Phase 2 once the plan is confirmed.

If the user gives you something that's already obviously one ticket, or explicitly says
how many tickets they want, you can propose a one-item plan and confirm the repo/title
quickly rather than manufacturing a debate — the point is alignment, not process for its
own sake.

## Figuring out the repository

Arenametrix's two main repos are **walnut** (backend) and **tigerlily** (frontend). A
ticket about webservices, data, or matching/detection logic is walnut; a ticket about a
page, component, or UI copy is tigerlily. Some tickets are both (e.g. "wire the export
button into the UI" is tigerlily, "build the export endpoint" is walnut — often two
separate tickets for exactly this reason).

If you have access to the actual codebases (or a related prototype — an
`ax-prototype`-style checkout, or whatever the `design-prototypes` skill can see is a
good source of real component names), check them to confirm the split and pull accurate
names for the CONTEXT section. If you don't have access, ask the PM directly which
repo(s) are relevant — don't guess and don't skip the question.

## Phase 2 — Draft each ticket

Once the plan is confirmed, write each ticket with this structure. Keep every section
tight — if a section is running long, that's a sign to cut, not to reorganize.

**Title** — carried over from the confirmed plan, as the ticket's top-level heading.

Each of the three sections below is a markdown H2 (`## CONTEXT`, `## EXPECTED BEHAVIOR`,
`## REQUIREMENTS`) — not bold text, not all-caps inline labels. This is a formatting
requirement, not a style preference: it's what makes tickets scannable in Monday.com.

## CONTEXT (4–5 lines, no more)
What exists today and why this ticket exists — just enough for someone who wasn't in
the room to understand the "why" before reading the rest. If it's part of a larger
epic or follows another ticket, add a link: `EPIC : [name](url)` or
`Following this ticket: url`. Only include links you actually have; use a placeholder
like `[link the EPIC here]` rather than inventing one.

## EXPECTED BEHAVIOR
Describe the workflow or customer journey in plain language: what the user does, what
the product does in response, step by step. This is the heart of the ticket — write it
the way you'd explain the flow to someone verbally. When the flow branches (success vs.
error, a multi-step decision), a tiny diagram often communicates it faster than a
paragraph. Keep it to a handful of nodes, e.g.:

```
contact created → email matches existing? 
  → yes → show merge prompt → user confirms → merge
  → no  → contact created normally
```

Don't reach for a diagram when the flow is linear and short — plain sentences are fine.

## REQUIREMENTS
The handful of things that actually need to happen for this ticket to be done — not an
exhaustive checklist of every edge case, error state, and nice-to-have you can think of.
Ask yourself: what's the smallest list of bullets an engineer needs to build this
correctly? If there's a genuinely important constraint or edge case, give it one bullet;
resist turning this into a QA test plan. If the ticket introduces new user-facing copy,
include the English text as one bullet — don't inline a full multi-language table, just
note that translations will be needed.

## Don't cite your sources inside the ticket

When you've grounded a ticket in an existing codebase, prototype, or Figma file, the
ticket should read as a plain description of current/expected behavior — never mention
*how* you know it (no "as seen in the prototype," "the current mock," "this is
simulated today," etc.). State facts about what exists and what should change as if
you'd always known them. This isn't about hiding information — every real detail you
found (component names, existing flows, field lists) belongs in the ticket — it's about
not cluttering a ticket meant for engineers with meta-commentary about your research
process.

## When something's still missing

If a real gap remains after the planning conversation (a detail the PM doesn't have
either), flag it briefly inline — `[confirm: ...]` — rather than leaving it out
silently or padding the ticket with your own guess dressed up as a requirement.

## Batch requests

If the PM pastes multiple already-distinct items (a bug triage list, a backlog dump),
Phase 1 is quick — the plan is close to "one ticket per item," so just confirm titles
and repos rather than debating the split. Then draft each ticket in the three-section
format, clearly separated (e.g. a `---` divider with the title as a heading).

## Reference

`references/example-tickets.md` has real Arenametrix tickets showing component naming
conventions and tone. They predate this shorter format (they're longer and more
exhaustive than what you should write now) — use them for naming/voice, not as a length
or structure template. `references/example-tickets.md` also includes a short example in
the current CONTEXT / EXPECTED BEHAVIOR / REQUIREMENTS format at the bottom.
