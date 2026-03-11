# Report Page Plan

## Goal
Build the first usable annual-style report page from the existing imported and filtered DCTimer data.

## Scope (V1)
- New `/report` page
- Read from current analyzer store
- Show overview cards
- Show simple distribution blocks
- Show key findings
- Show session list

## Modules
1. Overview
   - Selected year
   - Session count
   - Solve count
   - Valid solves
   - DNF count
   - First / last record

2. Distribution
   - Sessions by solve count (Top 5)
   - Puzzle types by solve count
   - Year distribution

3. Key findings
   - Most active session
   - Most active puzzle type
   - Year with most solves
   - Latest active session

4. Session list
   - Session name
   - Puzzle type
   - Solve count
   - First / last record

## Notes
- Keep the page card-based and text-first
- No complex charts in V1
- Tone should stay restrained and product-like
- Reuse existing layout and styling where possible
