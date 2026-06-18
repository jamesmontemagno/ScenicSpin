# Switch History

- 2026-06-17: Seeded as Tester for the Peloton scenic-rides project. Initial context: validate playback paths, UI behavior, and device constraints for use during Peloton rides.
- 2026-06-17: Inspected repo for scenic-rides MVP validation. No application source, package manifest, build script, or test framework exists yet, so no automated tests were added and no build/test command was available to run.

## Scenic Rides MVP Validation Checklist

Use this as the first-pass manual validation suite once Trinity/Tank land the MVP app slice.

### Route catalog and static data

- Catalog renders all seeded routes with title, location, duration/distance/elevation where available, difficulty, tags/terrain, and scenic thumbnail/placeholder.
- Static route records have stable unique IDs; detail links and selection survive refresh/deep-link.
- Missing optional fields degrade gracefully without broken cards, `undefined`, or layout collapse.
- Empty data state is explicit and useful.

### Filters and search

- Text search matches route title, location, region/country, tags, and terrain case-insensitively.
- Search trims leading/trailing spaces and handles no-match results with a clear reset path.
- Difficulty, duration/distance, terrain/tag, and location filters can combine predictably.
- Clearing one filter preserves the others; clearing all restores the full catalog.
- Filter count/results summary updates immediately and remains keyboard/screen-reader discoverable.

### Route detail and selection

- Opening a route detail page shows the same selected route as the catalog card.
- Back navigation returns to the previous filtered catalog state.
- Selecting/start-ride from detail loads the intended route in ride mode.
- Invalid/unknown route IDs show a safe not-found state with a path back to catalog.

### Fullscreen ride mode/player state

- Ride mode enters fullscreen when supported and still works when fullscreen is denied.
- Play/pause, mute/unmute, restart/exit, and selected-route metadata remain visible/usable on a Peloton-sized browser.
- Exiting ride mode returns to the selected route detail or catalog without losing state.
- Browser refresh while in ride mode either restores the selected ride or fails safely with a clear route-selection path.
- Keyboard/touch controls work without hover-only affordances.

### Riding/device edge cases

- Layout is usable in landscape, high-DPI, and constrained browser chrome.
- Main ride controls are large enough for sweaty/touch interaction and do not require precise clicks.
- Slow image/video loads show placeholders/loading states and never block navigation.
- Network/video failure surfaces a retry or alternate action.
- No copyrighted Peloton content is embedded unless explicitly licensed/allowed.

- 2026-06-18: Cleaned promoted backlog metadata in `routes/candidate-backlog.json` so promoted items no longer imply pending human review.
