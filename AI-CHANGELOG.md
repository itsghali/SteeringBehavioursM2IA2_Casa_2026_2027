# AI Change Log
Append-only record of AI-made changes. Never edit or delete past entries.
Newest entries at the top, directly under this header.

## 2026-10-13 18:00 — Fix music startup and render organic snakes
**Scope:** bugfix | feature
**Files:** `3-Arrival/index.html`, `3-Arrival/GameMusic.js`, `3-Arrival/Snake.js`, `3-Arrival/SnakeHead.js`, `3-Arrival/AnneauSnake.js`, `3-Arrival/sketch.js`, `3-Arrival/tests/arrival-game.test.mjs` (modified).
**What:** Space now adds a snake, replacing A. Snakes use varied natural palettes, tapered bodies, connected segments, articulated scales, belly markings, vertical pupils, nostrils, and forked tongues. Removed the visible `ARRIVAL / SNAKE` subtitle and browser title wording. Music now raises WebAudiox master volume from 0.075 to 0.22 and waits for a suspended AudioContext to resume successfully before scheduling notes.
**Why:** User requested Space-based spawning, more realistic snakes, removal of the subtitle, and reported inaudible music. The audio path previously scheduled immediately after calling `resume()` and used a very low effective master level.
**Verified:** `node --test 3-Arrival/tests/*.test.mjs`: 10 passed, 0 failed. Regression test starts from a suspended AudioContext and verifies resumed WebAudiox output; scene smoke test renders organic snake primitives and adds a snake with Space. All JavaScript passes `node --check`; `git diff --check` passes; `3-Arrival/vehicle.js` remains unchanged.
**Revert:** Restore previous versions of the seven modified game files and tests. Preserve this append-only journal.

## 2026-10-13 17:50 — Integrate WebAudiox and interactive text dispersion
**Scope:** feature | dependency
**Files:** `3-Arrival/index.html`, `3-Arrival/GameMusic.js`, `3-Arrival/TextPixel.js`, `3-Arrival/pixelText.js`, `3-Arrival/sketch.js`, `3-Arrival/tests/arrival-game.test.mjs` (modified); `3-Arrival/libraries/webaudiox.js`, `3-Arrival/libraries/webaudiox-MIT-LICENSE.txt`, `3-Arrival/libraries/webaudiox-SOURCE.md` (added).
**What:** Vendored WebAudiox at commit `17149a37e2fd36bc11c03d3a9764b86d9ba8952f` and routed the procedural orchard melody through `WebAudiox.LineOut` for master volume, mute, and page-visibility handling. Increased text pixel maxSpeed to 11 and maxForce to 0.65 with a 500 ms minimum intro, while keeping exact Arrival completion as the Start gate. Added prioritized local mouse repulsion within 72 px: only hovered text pixels scatter, then return through Arrival.
**Why:** User requested the specified WebAudiox repository, faster text formation, and localized cursor dispersion.
**Verified:** `node --test 3-Arrival/tests/*.test.mjs`: 10 passed, 0 failed. Tests exercise real vendored `WebAudiox.LineOut`, local/far cursor behavior, Arrival restoration, formation, keyboard controls, and scene smoke frames. All JavaScript passes `node --check`; vendored bundle SHA-256 is `FC6FC1072D05862A0FAAF1F9D48DF5F0904D49A777B3E39598686580F10ED7F9`; `git diff --check` passes; `3-Arrival/vehicle.js` remains unchanged.
**Revert:** Restore prior game files and tests; remove the three vendored WebAudiox files. Preserve this append-only journal.

## 2026-10-13 17:45 — Complete text formation before play and revise speed keys
**Scope:** feature
**Files:** `3-Arrival/sketch.js`, `3-Arrival/pixelText.js`, `3-Arrival/tests/arrival-game.test.mjs` (modified).
**What:** Intro text now begins its Arrival formation automatically before gameplay. Start remains disabled for at least 3.5 seconds and until every visible text pixel is within 8 px of its glyph target. B increases speed and S decreases it within the 1–12 bounds; Space no longer changes speed. Intro and footer instructions reflect the controls. Background music remains an original Web Audio oscillator composition using orchard-style pentatonic melody, bass, and light chiptune accents.
**Why:** User clarified text must finish forming before Start and reassigned speed controls to B and S.
**Verified:** `node --test 3-Arrival/tests/*.test.mjs`: 9 passed, 0 failed. Tests cover incomplete/complete glyph formation, disabled intro Start, B/S speed changes, Web Audio music, added snakes, and full ready/playing frames. All JavaScript passes `node --check`; `git diff --check` passes; `3-Arrival/vehicle.js` remains unchanged.
**Revert:** Restore previous `sketch.js`, `pixelText.js`, and test contents. Preserve this append-only journal.

## 2026-10-13 17:39 — Add staged text formation, extra snakes, speed key, and music
**Scope:** feature
**Files:** `3-Arrival/index.html`, `3-Arrival/sketch.js`, `3-Arrival/TextPixel.js`, `3-Arrival/pixelText.js`, `3-Arrival/tests/arrival-game.test.mjs` (modified); `3-Arrival/GameMusic.js` (added).
**What:** Text pixels now begin dispersed across the viewport and start a slower Arrival formation only after Start is clicked. Space increases every snake's speed up to 12; A adds another independently steered snake up to 8. Added an original procedural orchard chiptune with melody, bass, percussion accent, and mouse/keyboard mute control. Fruit is attracted to the closest snake head and every snake can collect it.
**Why:** User requested longer text formation, scattered starting pixels, Space speed boosts, A-created snakes, and thematic background music.
**Verified:** `node --test 3-Arrival/tests/*.test.mjs`: 9 passed, 0 failed. Tests cover delayed text formation, music scheduling/mute, speed increase, extra snake creation, and complete ready/playing frames. All JavaScript passes `node --check`; `git diff --check` passes; `3-Arrival/vehicle.js` remains unchanged.
**Revert:** Restore previous `index.html`, `sketch.js`, `TextPixel.js`, `pixelText.js`, and test contents; remove `GameMusic.js`. Preserve this append-only journal.

## 2026-10-13 17:25 — Build Arrival snake game
**Scope:** feature
**Files:** `3-Arrival/index.html`, `3-Arrival/sketch.js`, `3-Arrival/style.css` (modified); `3-Arrival/arrivalBehaviors.js`, `3-Arrival/Snake.js`, `3-Arrival/SnakeHead.js`, `3-Arrival/AnneauSnake.js`, `3-Arrival/Food.js`, `3-Arrival/TextPixel.js`, `3-Arrival/pixelText.js`, `3-Arrival/gameState.js`, `3-Arrival/tests/arrival-game.test.mjs` (added).
**What:** Added a responsive 60-second mouse-guided snake game. Snake head, rings, fruit, and text pixels extend Vehicle. Arrival forces guide the head, followers, attracted fruit, and every occupied text pixel. Added animated fruit, score and persistent best score, pause/reset/start states, accessible controls, and adjustable speed, length, and width.
**Why:** User requested a polished Arrival example built as a snake game with Vehicle subclasses and animated pixel text.
**Verified:** `node --test 3-Arrival/tests/*.test.mjs`: 7 passed, 0 failed. All JavaScript files pass `node --check`; `git diff --check` passes; `git diff --exit-code -- 3-Arrival/vehicle.js` passes. Browser visual capture was unavailable because local `file:` URLs are blocked by browser security policy.
**Revert:** Restore `3-Arrival/index.html`, `3-Arrival/sketch.js`, and `3-Arrival/style.css`; remove the added `3-Arrival` classes, behavior modules, and tests. Preserve this append-only journal.

## 2026-10-13 — Make Flee escape visible and introduce Ship inheritance
**Scope:** bugfix
**Files:** `1-Seek/ship.js` (added); `1-Seek/sketch.js`, `1-Seek/index.html`, `1-Seek/tests/population.test.mjs`, `1-Seek/README.md` (modified).
**What:** The scene now creates Ship instances extending Vehicle. Ship selects independent Flee forces or inherited Seek while keeping inherited drawing and locomotion. Default ship maxSpeed is 14 and maxForce is 0.6, giving desired Flee speed 7–14 against targets capped at 6. Detection still ranges from 0 to 300 px.
**Why:** User reported ships did not escape and required inheritance. Reproduction with the previous defaults (maxSpeed 4, desired Flee speed 2–4) and a target moving at 6 reduced a 150 px gap to 63.987 px in 30 frames. Introduced by accelerating targets in the preceding entry without updating the slower ship defaults.
**Verified:** `node --test 1-Seek/tests/*.test.mjs`: 24 passed, 0 failed. Regression test reads actual HTML defaults and verifies escape beyond 300 px from a mobile target; scene test invokes draw and confirms Flee movement. Ship inherits Vehicle.update/show. `git diff --check` passed; vehicle.js matches 8c2ffc5. Browser rendering not checked.
**Revert:** Remove ship.js and its script tag, restore direct Vehicle creation and controller steering, and restore maxSpeed 4/maxForce 0.1 defaults. Preserve journal entries.

## 2026-10-13 — Restrict detection to 0–300 px and accelerate targets
**Scope:** feature
**Files:** `1-Seek/targetAcceleration.js` (added); `1-Seek/fleeControls.js`, `1-Seek/flee.js`, `1-Seek/target.js`, `1-Seek/index.html`, `1-Seek/tests/population.test.mjs`, `1-Seek/README.md` (modified).
**What:** Detection slider and validation now accept 0–300 px. Zero disables Flee detection, including overlap. Targets automatically accelerate in their current direction using desired velocity minus current velocity, limited to maxForce; applyForce and inherited Vehicle.update keep speed capped at 6 px/frame. A stopped target uses +x as its direction. The safety distance remains 300 px.
**Why:** User corrected detection bounds and requested automatic target speed increases.
**Verified:** `node --test 1-Seek/tests/*.test.mjs`: 22 passed, 0 failed. Covered target acceleration and speed cap, stopped targets, zero force/speed, zero detection, HTML bounds and slider interactions. `git diff --check` and comparison of vehicle.js with 8c2ffc5 passed.
**Revert:** Restore previous 300–1000 radius bounds, remove the target acceleration call and script reference, and remove targetAcceleration.js. Preserve prior journal entries.

## 2026-10-13 — Add adjustable Flee detection and populations
**Scope:** feature
**Files:** `1-Seek/fleeControls.js` (added); `1-Seek/flee.js`, `1-Seek/target.js`, `1-Seek/sketch.js`, `1-Seek/index.html`, `1-Seek/style.css`, `1-Seek/README.md`, `1-Seek/tests/population.test.mjs` (modified).
**What:** Flee starts by default. Detection radius slider ranges from 300 to 1000 px; target count from 1 to 20; vehicle count remains adjustable from 1 to 200 in both Flee modes. Desired escape speed increases from half maxSpeed at 300 px to maxSpeed at overlap. Target forces combine within maxForce. Detection and safety circles reflect the settings. Switching modes preserves populations. vehicle.js unchanged.
**Why:** User requested accelerating escape within a 300 px safety zone and sliders for target detection, ships and Flee targets.
**Verified:** `node --test 1-Seek/tests/*.test.mjs`: 20 passed, 0 failed. Tests include force/speed bounds, overlap, detection boundaries, multi-target composition and simulated DOM slider interactions. `git diff --check` passed. No browser visual verification.
**Revert:** Restore these 1-Seek files to 8c2ffc5 and remove fleeControls.js; preserve this append-only journal.

## 2026-10-13 — Restore 1-Seek to 8c2ffc5
**Scope:** removal
**Files:** `1-Seek/README.md`, `1-Seek/flee.js`, `1-Seek/index.html`, `1-Seek/sketch.js`, `1-Seek/style.css`, `1-Seek/target.js`, `1-Seek/tests/population.test.mjs` (restored).
**What:** Restored 1-Seek working-tree files from commit 8c2ffc5. No new behavior. vehicle.js content unchanged.
**Why:** User requested this version for 1-Seek.
**Verified:** `git diff --exit-code 8c2ffc5 -- 1-Seek` passed; `node --test 1-Seek/tests/population.test.mjs`: 16 passed, 0 failed.
**Revert:** Previous directory saved at `C:\Users\ghali\AppData\Local\Temp\1-Seek-before-8c2ffc5-70ded03c34b64fcaa728bf0f1c4a18ed`.
