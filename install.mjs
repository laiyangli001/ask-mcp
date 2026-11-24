#!/usr/bin/env node
// ask-mcp installer: installs deps, builds each service, and registers MCP servers in ~/.claude.json
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));

const SERVICES = [
  { dir: "chatgpt-mirror", mcpName: "chatgpt-mirror" },
  { dir: "chatgpt-official", mcpName: "chatgpt-official" },
  { dir: "claude-mirror", mcpName: "claude-mirror" },
  { dir: "deepseek", mcpName: "deepseek" },
  { dir: "doubao", mcpName: "doubao" },
];

function run(cmd, args, cwd) {
  const where = cwd || PROJECT_ROOT;
  console.log(`\n> ${cmd} ${args.join(" ")}  (in ${where})`);
  const res = spawnSync(cmd, args, {
    cwd: where,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    console.error(`\n✗ command failed: ${cmd} ${args.join(" ")}`);
    process.exit(res.status ?? 1);
  }
}

function main() {
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 18) {
    console.error(`✗ Node.js >= 18 required, current: ${process.version}`);
    process.exit(1);
  }

  console.log("ask-mcp installer\n");

  // 1. install deps (postinstall fetches chromium) + compile each service
  for (const svc of SERVICES) {
    const dir = join(PROJECT_ROOT, svc.dir);
    if (!existsSync(join(dir, "package.json"))) {
      console.error(`✗ missing package.json in ${svc.dir}`);
      process.exit(1);
    }
    run("npm", ["install"], dir);
    run("npm", ["run", "build"], dir);
  }

  // 2. register all servers in ~/.claude.json
  registerMcp();

  console.log("\n✓ ask-mcp installed successfully.");
  console.log("  Reload Window (Ctrl+Shift+P → Developer: Reload Window) to activate the MCP servers.");
}

function registerMcp() {
  const configPath = join(homedir(), ".claude.json");
  if (!existsSync(configPath)) {
    console.warn(`\n! ${configPath} not found — skipping MCP registration.`);
    console.warn("  Register each service manually, or create ~/.claude.json first and re-run.");
    return;
  }

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8"));
  } catch (e) {
    console.error(`\n✗ failed to parse ${configPath}: ${e.message}`);
    process.exit(1);
  }

  config.mcpServers = config.mcpServers || {};
  for (const svc of SERVICES) {
    const entry = join(PROJECT_ROOT, svc.dir, "dist", "index.js");
    config.mcpServers[svc.mcpName] = {
      type: "stdio",
      command: "node",
      args: [entry],
    };
    console.log(`  + registered ${svc.mcpName} → ${entry}`);
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  console.log(`\n✓ updated ${configPath}`);
}

main();
