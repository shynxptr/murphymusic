import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");
const PREFIX_FILE = join(DATA_DIR, "prefixes.json");

export const DEFAULT_PREFIX = process.env.PREFIX || "f!";

// In-memory cache of guildId -> prefix
let prefixCache = new Map();

function loadPrefixes() {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    if (existsSync(PREFIX_FILE)) {
      const raw = readFileSync(PREFIX_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      prefixCache = new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error("Failed to load prefixes.json:", error);
  }
}

function savePrefixes() {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj = Object.fromEntries(prefixCache.entries());
    writeFileSync(PREFIX_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save prefixes.json:", error);
  }
}

// Initialize on import
loadPrefixes();

/**
 * Get the prefix for a guild (falls back to DEFAULT_PREFIX "f!")
 */
export function getPrefix(guildId) {
  if (!guildId) return DEFAULT_PREFIX;
  return prefixCache.get(guildId) || DEFAULT_PREFIX;
}

/**
 * Set a custom prefix for a guild
 */
export function setPrefix(guildId, newPrefix) {
  if (!newPrefix || newPrefix === DEFAULT_PREFIX) {
    prefixCache.delete(guildId);
  } else {
    prefixCache.set(guildId, newPrefix);
  }
  savePrefixes();
}

/**
 * Reset guild prefix back to default ("f!")
 */
export function resetPrefix(guildId) {
  prefixCache.delete(guildId);
  savePrefixes();
}

