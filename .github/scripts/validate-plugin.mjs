#!/usr/bin/env node
// Validates the Claude Code plugin + marketplace files before a release.
// When TAG is set (release runs), also asserts the plugin/marketplace
// versions match the tag — the plugin is git-distributed, so a stale
// version in the tagged commit would ship to users.

import { readFileSync, existsSync } from "node:fs";

const tag = (process.env.TAG || "").trim();

function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

function readJson(path) {
  if (!existsSync(path)) fail("missing " + path);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail("invalid JSON: " + path + " — " + e.message);
  }
}

const marketplace = readJson(".claude-plugin/marketplace.json");
const manifest = readJson("plugin/.claude-plugin/plugin.json");

if (manifest.name !== "sdlc-workflow") {
  fail('plugin.json "name" expected "sdlc-workflow", got "' + manifest.name + '"');
}
if (!Array.isArray(marketplace.plugins)) {
  fail('marketplace.json "plugins" must be an array');
}
const entry = marketplace.plugins.find((p) => p.name === "sdlc-workflow");
if (!entry) fail('marketplace.json must list a plugin named "sdlc-workflow"');
if (entry.source !== "./plugin") {
  fail('marketplace.json sdlc-workflow "source" expected "./plugin", got "' + entry.source + '"');
}

for (const f of [
  "plugin/skills/workflow/SKILL.md",
  "plugin/skills/workflow/reference.md",
  "plugin/skills/scaffold/SKILL.md",
]) {
  if (!existsSync(f)) fail("missing plugin component: " + f);
}

if (tag) {
  if (manifest.version !== tag) {
    fail(
      "plugin.json version " + manifest.version + " != tag " + tag +
        " — run `npx sdlc-workflow plugin` and commit before tagging"
    );
  }
  if (entry.version !== tag) {
    fail("marketplace.json sdlc-workflow version " + entry.version + " != tag " + tag);
  }
}

console.log("✓ plugin & marketplace valid" + (tag ? " (version " + tag + ")" : ""));
