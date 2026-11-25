---
name: ssud-ui
description: Design, implement, or review compact file managers and workspace interfaces using SSUD patterns for navigation, search and filters, dense file lists, capacity, indexing, and transfer confirmation. Use when the user requests the SSUD style or a workspace based on its patterns.
---

# SSUD UI

Read [the design guide](references/DESIGN.md) for the requested area. Apply its visual and interaction patterns to the host project's own components, permissions, and data model.

- Use [the CSS tokens](assets/tokens.css) as the palette and density baseline. Map them to the host theme when it already has a token system.
- Use the [interactive example](assets/example/index.html) to inspect the layout and state transitions. Open it directly in a browser. The example uses synthetic paths and in-memory transfer state.
- Match the requested scope. For example, a download dialog change can adopt the dialog pattern without changing the file table.
- Verify the affected flow at desktop and narrow widths. For filename or control changes, check keyboard access, a long filename, Korean text, and focus after a dialog or navigation.
