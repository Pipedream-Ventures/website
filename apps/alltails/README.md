# AllTails website

Current content: October 19, 2026. AllTails is in free beta on TestFlight.

- Home: `https://alltailsapp.com/`, including the `#beta` install steps.
- User manual: `https://alltailsapp.com/apps/alltails/guide.html`.
- Help center: `https://alltailsapp.com/support` and the existing `support.html` path.
- Privacy: `https://alltailsapp.com/privacy`.

These are static pages. `help.css` is shared by the manual and help center.
`help.js` searches the answers already present in `support.html`. No search
request leaves the page. All answers remain accessible without JavaScript.
Answer IDs are stable links used by the manual; keep them when editing content.
`navigation.js` adds a section picker on every screen and marks the current section.
The manual also has previous/next chapter links that work without JavaScript.
The AllTails Cloudflare Worker already passes through `/apps/alltails/*`, so
these pages and assets do not require a Worker deployment.

## Keep instructions current

Copy and visuals follow `alltails/COPY.md` and `alltails/DESIGN.md`. The guide's
app labels were checked against AllTails commit `916a496` in:

- `DogOnboardingView.swift`: setup, invitations and account restore.
- `WalkReadyPanel.swift` and `ActiveWalkPanel.swift`: starting and ending walks.
- `HistoryView.swift`, `WalkDetailView.swift`, `WalkTrimView.swift`: history and edits.
- `FamilyInviteButton.swift`, `PackInvite.swift`, `InviteCodeSheet.swift`: packs.
- `HealthImportView.swift`: the 90-day import window and permission recovery.
- `PackSettingsView.swift`, `AccountSetting.swift`, `SettingsRows.swift`: account and settings.
- `WalkShareStudioView.swift`: the current share control is named “Share”.
- `project.yml`: iOS 17 and watchOS 11 minimum versions.

During a beta, older installed builds can differ. Do not add a build number to
these instructions unless it is verified as available through the public beta.
The TestFlight join page was checked in a real browser on October 19.

## Support House follow-up

Support currently goes to `seth@pipedream.ventures` or TestFlight feedback.
The help center's primary contact link has `data-support-contact`. That is a
future integration point, not a live Support House connection. When AllTails
support intake is configured in Support House, replace or enhance this action
with the verified destination. Keep email available if that destination fails.
Do not show a pretend chat, ticket success message, or unverified response time.

Before enabling it, verify the AllTails product and support inbox, send an
approved test request, and read back the conversation in Support House. Then
update this record and the help center's contact copy.

## Release

The Render static site auto-deploys `main`. Merge is a production deployment and
needs scoped approval. The separate draft App Store launch PR #27 must keep
these manual, help and beta links when rebased. Change the public download CTA
only after the App Store app is available and that switch is approved.
