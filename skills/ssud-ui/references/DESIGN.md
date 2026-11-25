# SSUD UI design guide

## Layout and visual hierarchy

Use a dark utility workspace with system fonts, light neutral text, muted metadata, blue actions, thin borders, and 3–4 px radii. Use 14 px for file rows and controls, 12 px for supporting labels, and an 18 px page heading. Keep copy functional. Let the workspace title, current path, and primary action orient the user.

On desktop, use a 190 px sidebar and one flexible workspace column. Put location, home folder, and storage information in the sidebar. Put the heading and common actions above search and its filters. Keep the table as the main surface, with a sticky header and its own scroll area. Use about 35 px for ordinary rows. A search result can add a second line for its parent path. Around 850 px, let search take a full row. Around 650 px, move the sidebar above the workspace and contain wide-table scrolling inside the file panel.

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
