# Search, compact banner and header audit

Release: 20261028-banner2. Cumulative code update from the verified final 27 October search package.

## Root causes and changes
- Old UI rejected file:// before searching. The new release loads exact verse data through classic scripts on local pages, with a worker on HTTP(S) and a main-thread fallback. No external API or network scripture source is needed.
- 153 pages used an unstyled logo link; 10 Esther pages lacked a site header. Every one of the 1,256 pages now has the same branded header and navigation. The 10 legacy Esther document titles were updated too.
- The search form is a compact banner. Optional controls are collapsed under Search options & tips; results/errors only show after searching. Opaque surfaces and explicit text colors address the low-contrast screenshot.

## Preservation
All 2,378 raw scripture blocks, all inline reading scripts, version-toggle.js, verse-link.js and scripture-search-core.js are identical to the previous final release. Both new data script objects equal the previous JSON indexes: 31,102 KJV and 31,098 WEB verses. The previous explicit source repairs remain documented in SOURCE-REPAIRS.json; no new scripture repairs were made. Original Genesis JPEG is included and hash-verified. Other paintings are retained from the existing site.

## Checks rerun
- 7,229 engine assertions; 16 deep-link DOM scenarios; 67 new loading/UI assertions.
- 1,256 pages, 66 books, 1,189 readings, 18,368 local references; identical headers and unique IDs. Available HTML anchor destinations checked.
- Local and HTTPS loading paths, actual worker code, worker errors/timeouts and postMessage failures, missing-file retry, both translations, cache, blocked storage, specific references/ranges, phrase and keyword searches, paging, filtering, copy, empty/invalid input, stale-response suppression and clear during load tested in Node VM with a DOM model.
- WeasyPrint offline approximation checked control bounds at 320, 375, 768 and 1280px; desktop banner approximately 124px tall. Browser-native controls, fonts and mobile flex layout differ in this renderer. These are not browser screenshots.

## Limitations
No installed live browser was available for this session. The exact file:// behavior and published GitHub Pages deployment still need a real browser check. No GitHub repository was modified or published by this work. Local browser policies can disable scripts. JavaScript must be enabled. This is not a fresh textual audit of every verse.

MANIFEST.sha256 covers active runtime files, including 65 paintings supplied by the existing site. The ZIP intentionally omits those 65 paintings and obsolete JSON data files. Existing obsolete files can remain harmlessly. Unpack this update last; do not apply earlier packages over it.
