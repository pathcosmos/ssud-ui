---
name: ssud-ui
description: Design, implement, or review compact file managers and workspace interfaces using SSUD patterns for navigation, search and filters, dense file lists, capacity, indexing, and transfer confirmation. Use when the user requests the SSUD style or a workspace based on its patterns.
---

# SSUD UI

Read [the design guide](references/DESIGN.md) for the requested area. Apply its visual and interaction patterns to the host project's own components, permissions, and data model.

- Use [the CSS tokens](assets/tokens.css) as the palette and density baseline. Map them to the host theme when it already has a token system.
- Open the [component catalogue](assets/kit/index.html) for copyable HTML, state guidance, and live previews. Load [components.css](assets/components.css) after the tokens and scope both to an `ssud-ui` root.
- Open the [file workspace](assets/example/index.html), [settings form](assets/kit/settings.html), or [transfer queue](assets/kit/transfers.html) directly in a browser to inspect a complete flow. The examples use local sample data.
- Copy the entire `ssud-ui` skill directory into Codex's `.agents/skills/` or Claude Code's `.claude/skills/` under the project, or under the home directory for personal use.
- Match the requested scope. For example, a download dialog change can adopt the dialog pattern without changing the file table.
- For adaptive navigation, filters, row actions and dialogs, use the [responsive workspace patterns](references/DESIGN.md#responsive-workspace).
- Verify the affected flow at desktop and narrow widths. For filename or control changes, check keyboard access, a long filename, Korean text, and focus after a dialog or navigation.
