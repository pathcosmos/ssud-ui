# SSUD UI

A portable Agent Skill based on the compact file workspace in Samba Search, Upload & Download.

## Use the skill

Clone this private repository with an authorized GitHub account.

```sh
git clone --branch v0.1.0 https://github.com/pathcosmos/ssud-ui.git
```

Copy the entire [skills/ssud-ui](skills/ssud-ui) directory into your agent's skill directory. For Codex, use `~/.agents/skills/` for all projects on this device or `.agents/skills/` in a project root. For example, from the directory where you ran the clone command:

```sh
mkdir -p ~/.agents/skills
cp -R ssud-ui/skills/ssud-ui ~/.agents/skills/
```

In Codex, invoke it with `$ssud-ui`. For another Agent Skills client, register the same folder using its installation instructions. In a client that accepts files as context, attach the [design guide](skills/ssud-ui/references/DESIGN.md), [CSS tokens](skills/ssud-ui/assets/tokens.css), and any relevant example files.

## Preview

Open [index.html](skills/ssud-ui/assets/example/index.html) directly in your browser. Keep the folder structure intact so the example can load the shared tokens. Try `"final report"` or `회의` in search, go to a result's folder, and return to the results. Upload and download confirmations simulate transfers with in-memory data. Reload to reset the example.

The initial design baseline is SSUD commit `7392b71`.
