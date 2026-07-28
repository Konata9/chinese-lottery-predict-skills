# Changelog

## Unreleased

- Removed: Delete `lotteryPredict.js` because it relied on simulated data, which is no longer allowed by the skill policy
- Removed: Delete `references/cli-usage.md` after removing the local simulated CLI path

## v1.2.0 (2026-02-15)

- Fixed: Consider the Spring Festival market closure when calculating the next draw date
- Added: Node.js implementation (`lotteryPredict.js`)
- Added: Holiday configuration (2026 Spring Festival)
- Added: Budget-based ticket count
- Added: Multiple strategies (hot, cold, mixed)
- Enhanced: Save prediction details to a JSON file

## v1.1.0 (2026-02-06)

- Improved: Multi-step data retrieval strategy (documentation)
- Added: DuckDuckGo as an alternative search option (documentation)
- Added: Multi-source verification rules (documentation)
