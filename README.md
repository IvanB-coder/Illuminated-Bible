# Illuminated Word

**Read the Bible. Explore its books. Find a verse.**

Illuminated Word brings together all 66 books of the Bible, classical-style artwork, book summaries, and chapter-by-chapter reading in the **King James Version (KJV)** and **Classic World English Bible (WEB)**.

Built with plain HTML, CSS, and JavaScript, the site offers a quiet reading experience with a parchment-inspired design, clear navigation, and scripture search.

[Visit the website](https://ivanbarties-coder.github.io/Illuminated-Bible/) · [Browse the repository](https://github.com/ivanbarties-coder/Illuminated-Bible)

## Features

- **66 books and 1,189 chapters** with individual chapter reading pages.
- **KJV / WEB translation toggle**, with your preference remembered when browser storage is available.
- **Book summaries and artwork**, with chapter grids for quick navigation.
- **Scripture search** by reference, keywords, or exact phrase.
- **Specific verse results**, showing the reference, translation, and verse text.
- **Read in chapter** links that open and highlight the selected verse in the correct translation.
- **Copy verse**, paginated results, and shareable search links.
- **Compact, rounded search banner**, with additional filters under “Search options & tips”.
- Responsive layouts, keyboard focus indicators, and consistent site navigation.
- No account, API key, database, or build step required.

## Find a verse

Enter a reference, remembered phrase, or keywords in the homepage search banner. Choose **KJV** or **WEB**, then select **Search verses**.

| Search type | Example |
| --- | --- |
| Specific verse | `John 3:16` |
| Abbreviated reference | `Jn 3:16` |
| Verse range within a chapter | `1 Cor 13:4-7` |
| Whole chapter | `Psalm 23` |
| Exact phrase | `"be still"` |
| Keywords | `love enemies` |

Open **Search options & tips** to filter by book or testament, choose all words, any word, or an exact phrase, and sort by text match or Bible order. Results appear in pages of 20 verses.

Search results reproduce the selected translation. Keyword search matches words in the text; it does not automatically expand synonyms or correct spelling. If a search returns no results, try fewer words, another translation, or a different match option.

**Keyboard shortcut:** press `/` when you are not typing in another field to focus the search box.

## Run locally

The website is static. You do not need Node.js or a package installation.

1. Clone this repository, or download and extract its ZIP.
2. Keep the HTML, CSS, JavaScript, verse data, and painting files together in the project root.
3. Open `index.html` in a modern browser.

The current search implementation supports locally opened pages through bundled verse-data scripts. If your browser restricts local scripts, use a local web server instead.

### Recommended development preview

With Python 3 installed, run this command from the website folder:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows, you can use:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Then open **http://localhost:8000/**. Stop the server with `Ctrl+C`.

JavaScript is required for search and translation switching. The stylesheet requests Google Fonts; fallback fonts are used when those fonts are unavailable.

## Project structure

The website uses a **flat file structure**. Keep relative filenames and links intact.

| File or pattern | Purpose |
| --- | --- |
| `index.html` | Homepage, book directory, search, and About section |
| `styles.css` | Shared styling for the homepage, summaries, and reading pages |
| `{book}.html` | Book summary and chapter grid |
| `{book}-read.html` | First chapter of a book |
| `{book}-read-N.html` | Later chapters, where `N` is the chapter number |
| `{book}-painting.png` / `.jpg` | Book artwork; use the filename referenced by its page |
| `version-toggle.js` | Shared translation switching for Template A pages |
| `scripture-search.css` | Search banner and results styling |
| `scripture-search.js` | Search interface and data loading |
| `scripture-search-core.js` | Reference parsing, matching, filtering, sorting, and pagination |
| `scripture-search-worker.js` | Background search worker for HTTP(S) pages |
| `search-data-kjv-20261028.js` | Bundled KJV search index |
| `search-data-web-20261028.js` | Bundled WEB search index |
| `verse-link.js` | Translation-aware links and exact-verse highlighting |

The first search loads the selected translation’s index and keeps it in memory for subsequent searches on that page. HTTP(S) pages use a Web Worker where available, with a main-thread fallback. Locally opened pages use the main-thread loader.

## Publish with GitHub Pages

Website address: **https://ivanbarties-coder.github.io/Illuminated-Bible/**

Keep `index.html` and its supporting files in the configured GitHub Pages publishing location. Commit and push the **extracted website files**, rather than uploading a deployment ZIP as the website.

For a branch-based setup, select the branch containing the site and its root folder under the repository’s **Settings → Pages**. If the repository already uses a deployment workflow, retain that workflow unless you intend to change the publishing setup.

After deployment:

- Refresh the homepage without cache.
- Search for `John 3:16` in both translations.
- Test a phrase, a keyword search, filters, and pagination.
- Open a result using **Read in chapter**.
- Check translation switching, chapter navigation, artwork, and mobile layout.

When applying an update package, follow its installation notes. Some updates contain only changed files and depend on the existing website. Keep existing paintings and verse-data files unless the update explicitly replaces them, and do not overwrite a newer release with an older patch.

## Translation notes

The site uses **KJV** and **Classic WEB** scripture text. Translation sources used by the project are available through [eBible.org](https://ebible.org/), including its [KJV text](https://ebible.org/kjv/) and [Classic WEB text](https://ebible.org/eng-web/).

Verse numbering can differ between translations. The project preserves those differences rather than inserting KJV wording into WEB to force matching verse counts. For example, some numbered verses in Acts and Luke are absent from the Classic WEB text used here, and the Romans doxology appears in a different location.

## Maintenance and contributions

**Read `PROGRESS.md` in full before changing project files.** It records the current implementation, release order, known issues, and validation history. Use its newest checkpoint rather than older notes inside archived packages.

Two reading-page templates remain in use:

- **Template A:** `verses-kjv` / `verses-web` blocks, the `hidden` attribute, and the shared `version-toggle.js` script. Used by Esther’s reading pages in the current implementation.
- **Template B:** `text-kjv` / `text-web` blocks, the `is-hidden` class, and an inline `showTranslation()` function. Used by the other reading pages in the current implementation.

Both use the preference key `illuminated-word-version`. Inspect the actual page before editing; the two toggle implementations are not interchangeable.

When contributing:

1. Preserve scripture wording, translation attribution, and verse numbering.
2. Verify proposed text corrections against the relevant translation source.
3. Keep search indexes consistent with the reading-page text whenever scripture changes.
4. Check local links, unique HTML IDs, both translations, and chapter navigation.
5. Test search and layout in a browser on desktop and mobile-sized screens.
6. Update the progress record and relevant validation documentation.

Report problems through the repository’s Issues tab, if enabled. Include the page or verse reference, selected translation, browser, and steps to reproduce the issue. Screenshots are helpful for layout problems.

## Credits and reuse

Scripture text, website code, summaries, and artwork may have different reuse terms. Consult the relevant source notices and any repository license before redistributing material. Inclusion in this repository should not be treated as a blanket license for every asset; contact the repository owner if permission is unclear.
