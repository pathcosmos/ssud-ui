# SSUD UI design guide

## Design intent

SSUD UI was deliberately guided to feel as little like a generic AI-generated interface as possible. Carry that intent into reuse by making each layout, control, and label serve the workspace's actual tasks.

- Build the hierarchy around the current path, file operations, search results, and storage state. Use tables or compact groups where users need to compare data; reserve cards for information that benefits from a separate container.
- Keep decoration restrained. Avoid ornamental gradients, glow effects, oversized headings, excessive rounding, and repeated cards that add no useful grouping. Use emphasis to identify actions, state, and navigation.
- Write direct labels and specific feedback: Upload, Back to results, or a transfer's filename and progress. Avoid promotional headings, filler descriptions, and exaggerated success messages in routine workflows.
- Follow the host product's terminology and interaction conventions. Judge additions against realistic file tasks and data, including long names, empty results, and recoverable failures.

## Layout and visual hierarchy

Use a dark utility workspace with system fonts, light neutral text, muted metadata, blue actions, thin borders, and 3–4 px radii. Use 14 px for file rows and controls, 12 px for supporting labels, and an 18 px page heading. Keep copy functional. Let the workspace title, current path, and primary action orient the user.

On desktop, use a 190 px sidebar and one flexible workspace column. Put location, home folder, and storage information in the sidebar. Put the heading and common actions above search and its filters. Keep the table as the main surface, with a sticky header and its own scroll area. Use about 35 px for ordinary rows. A search result can add a second line for its parent path. Let search wrap on tablets. At phone widths keep the filename, size and row action together, with the full location and secondary metadata available on demand.

## Browse and search

- Show a breadcrumb rooted at Home. In subfolders, provide Home and Up one level above file rows. Keep filenames readable with truncation and retain the full name for inspection.
- Group the search field, file type, extensions, and Clear. Give a short example for matching all words and quoted phrases. Enter and meaningful filter changes should apply the current controls.
- Offer a location jump from a search result. Highlight the matching row in its folder. Preserve the query, filters, ordering, and result position on return. Keep Back to results adjacent to the breadcrumb.
- Use a sortable Size column for file bytes and recursive folder totals. Give unknown or still-calculating sizes explicit state. Keep numbers aligned and actual sort direction accessible.

## Status and actions

- Label location total, used, available, and quota explicitly. Pair bar colors with text and show home-folder file totals independently of account limits.
- Put indexing state next to Search. Show Updating with a short status label and an optional spinner that respects reduced motion. Use indeterminate progress when the total is unknown. Keep available search results usable while updating.
- Keep one primary action per action group. Use native modal dialogs for transfer confirmation with name, size and destination or source. Put initial focus on a safe control and restore focus on close. Show transfer status separately. For actual downloads, offer a browser fallback if there is no save picker.
- Where row menus exist, expose a visible keyboard-accessible trigger alongside right-click. Preserve the open menu during unrelated status updates and confirm destructive actions.

## Text and accessibility

Default to English and use the host localization system for all user-facing strings, including control names and status messages. Check Korean and long names at narrow widths. Use CSS truncation for visual density and text APIs for filenames. For search/display, normalize to NFC as appropriate and preserve the application's raw identifiers for file operations. Keep status legible without color or motion.

## Reuse in another workspace

Load [tokens.css](../assets/tokens.css) and [components.css](../assets/components.css), then put the `ssud-ui` class on the workspace root. Use the [component catalogue](../assets/kit/index.html) for copyable markup, state notes and keyboard behavior. Component-specific demo scripts show how interactive states are wired. Keep host application logic in the host.

- [Files](../assets/example/index.html) shows list density, filtering, sorting, pagination, row actions and return to search results.
- [Settings](../assets/kit/settings.html) links an error summary to invalid inputs and validates again on submission.
- [Transfers](../assets/kit/transfers.html) confirms the selection, shows progress, and lets the user recover from a simulated failure.

Check regular text and button states at 4.5:1, control boundaries that identify inputs at 3:1, and focus visibility against adjacent surfaces. Provide an accessible name and at least a 24 px pointer target for compact icon buttons. Fit the file list within 320 px. Reserve an internal horizontal scroll region for data sets whose columns must be compared side by side. Use short functional copy and verify Korean content, truncation, and mobile wrapping.

## Responsive workspace

Load the shared [disclosure script](../assets/disclosures.js) with `defer` alongside the tokens and components stylesheet. The [file example](../assets/example/index.html) has the complete markup.

| Available width | Navigation | Search and file list |
| --- | --- | --- |
| Up to 650 px | Workspace opens an in-flow panel above the list. Keep the current breadcrumb and Upload visible with the panel closed. | Keep search and Filters together. Show the active filter count. Wrap long names, retain Size sorting and use the row action for modified date and full name. |
| 651–1100 px | Use a side column when expanded. Default to closed below 900 px and open from 900 px. Allow either layout with the Workspace toggle. | Show filters and the full table. Let controls wrap to fit portrait or landscape. |
| Above 1100 px | Show the rail alongside the workspace. | Keep the dense four-column table, sticky headers and independent list scroll. |

### Markup and state

Use one DOM subtree for each panel. The button's `data-disclosure` value is the greatest width at which it can collapse. Optional `data-expand-at` sets the initial expanded width within that range. Above the collapsible range the panel is visible. The helper updates `hidden` and `aria-expanded` and remembers manual choices while the page is open.

```html
<main class="workspace-shell">
  <nav class="workspace-links" aria-label="Examples">…</nav>
  <header class="workspace-heading">
    <button type="button" class="disclosure-toggle secondary"
      aria-controls="locations" aria-expanded="true"
      data-disclosure="1100" data-expand-at="900">Workspace</button>
  </header>
  <aside class="workspace-rail" id="locations">…</aside>
  <div class="workspace-content">
    <form role="search">
      <input type="search" aria-label="Search files">
      <button type="button" class="disclosure-toggle secondary"
        aria-controls="filters" aria-expanded="true" data-disclosure="650">Filters</button>
      <div class="filter-fields" id="filters">…</div>
    </form>
  </div>
</main>
```

- Apply `responsive-list` to a native table. Put `row-title` on the name, `size-column` and `action-column` on those columns, and `optional-column` on each secondary column's col, header and body cells. Match spanning navigation cells to the visible column count. Keep the sort controls in the same headers at every width.
- Use a visible, named `icon-button` in each action cell. Show its `action-list row-actions` popover beside the trigger. Include a `row-details` block with the complete name, parent path and any hidden metadata. Reposition an open popover on resize or list scroll. Use `responsive-dialog` on a native dialog for a centered desktop confirmation and a bottom-aligned phone confirmation with safe-area padding.
- Keep the folder, sort and result page in application state and the live query and filters in their original controls. Save the origin folder, result item, page, sort and scroll offset before jumping to a location. Restore the snapshot and focus its result link on return. Breakpoint listeners update presentation and spanning cells only.

### Browser verification

The file example ran directly from disk in Chromium at 320×640, 390×844, 430×932, 768×1024, 1024×768, 1280×800 and 1440×900. Emulated touch and desktop keyboard runs exercised search, combined type/extension filters, size sorting, row details, download confirmation, location jumps and return to results. Resizing with the destination folder open preserved the breadcrumb, query, filters, sort and return focus. A separate test restored the second result page and origin folder after rotation and a folder sort change.

At phone widths the page and list fit horizontally, including long Korean names. At 320×640 the subfolder rows span the available width and the footer fits. Tablet runs checked both rail states and desktop runs checked sticky headers and the Modified column. These observations cover browser emulation.

## Responsive forms, queues and catalogue

Use `adaptive-page` for page padding that includes the viewport safe area. Use `adaptive-columns` to stack sections up to 650 px and `adaptive-wide` for content that spans both columns. Keep the source order meaningful in both layouts.

- In [Settings](../assets/kit/settings.html), keep the error summary above the fields, link each error to its input and keep Save in the form's normal scroll flow. Coarse pointers get larger controls and 16 px field text.
- In [Transfers](../assets/kit/transfers.html), place file selection before the queue in reading order. Use the shared `responsive-dialog` for confirmation and return focus to the file input or sample button when it closes. Make Retry reachable next to its failed item even when its filename wraps.
- In the [catalogue](../assets/kit/index.html), open **Responsive layout** for working markup that uses `adaptive-columns`, `disclosure-toggle`, and `filter-fields` together. Its controls retain their values on resize. The disclosure requires [disclosures.js](../assets/disclosures.js).

### Cross-browser verification

Chromium 151 and Playwright WebKit 27.2 opened all four pages directly from disk at 320×640, 390×844, 430×932, 768×1024, 1024×768, and 1280×800. The runs used touch emulation on phone and tablet sizes and keyboard activation on desktop. They covered page width, file search and result return, settings error links and successful save, file selection and transfer retry, dialog focus return, and catalogue disclosure values across resizing. The file index spinner stayed static with reduced motion enabled.

A 390×350 Chromium viewport also kept the settings form operable and the confirmation button reachable after selecting 12 files with long names. This is a reduced-height layout check. Native software-keyboard overlays and nonzero hardware safe-area insets still require a physical device.
