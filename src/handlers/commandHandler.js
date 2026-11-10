import { readdirSync } from "fs";
import { pathToFileURL } from "url";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getPrefix } from "../utils/prefixManager.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load all prefix commands and aliases from the commands directory
 */
export async function loadCommands(client) {
  client.commands = new Map();
  client.aliases = new Map();
  const commandsPath = join(__dirname, "..", "commands");

  try {
    const files = readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    for (const file of files) {
      const filePath = pathToFileURL(join(commandsPath, file)).href;
      const command = await import(filePath);
      const cmd = command.default || command;

      if (cmd.name && cmd.execute) {
        const cmdName = cmd.name.toLowerCase();
        client.commands.set(cmdName, cmd);

        if (Array.isArray(cmd.aliases)) {
          for (const alias of cmd.aliases) {
            client.aliases.set(alias.toLowerCase(), cmdName);
          }
        }
        const aliasText = cmd.aliases?.length ? ` (aliases: ${cmd.aliases.join(", ")})` : "";
        console.log(`✅ Loaded command: ${cmdName}${aliasText}`);
      } else {
        console.warn(`⚠️ Invalid command structure in ${file}`);
      }
    }

    console.log(`Loaded ${client.commands.size} commands`);
  } catch (error) {
    console.error("Error loading commands:", error);
  }
}

/**
 * Handle prefix command messages
 */
export async function handleMessageCommand(message, client) {
  if (!message.guild || message.author.bot) return;

  const prefix = getPrefix(message.guild.id);
  const content = message.content.trim();

  // Check if user just mentioned the bot to ask for the prefix
  const mentionRegex = new RegExp(`^<@!?${client.user.id}>$`);
  if (mentionRegex.test(content)) {
    return message.reply(
      `👋 Halo! Prefix di server ini adalah \`${prefix}\`\n` +
      `Coba ketik \`${prefix}p <judul lagu>\` untuk memutar musik atau \`${prefix}help\` untuk daftar command.`
    );
  }

  // Case-insensitive prefix check (e.g., "f!p" or "F!p" or "f! p")
  if (!content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const withoutPrefix = content.slice(prefix.length).trim();
  if (!withoutPrefix) return;

  const args = withoutPrefix.split(/\s+/);
  const commandName = args.shift().toLowerCase();

  // Resolve command by name or alias
  const resolvedName = client.commands.has(commandName)
    ? commandName
    : client.aliases.get(commandName);

  if (!resolvedName) return;

  const command = client.commands.get(resolvedName);
  if (!command) return;

  try {
    await command.execute(message, args, client, prefix);
  } catch (error) {
    console.error(`Error executing command ${resolvedName}:`, error);
    await message.reply("❌ Terjadi error saat menjalankan command!").catch(() => {});
  }
}
