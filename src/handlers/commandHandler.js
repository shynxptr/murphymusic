import { readdirSync } from "fs";
import { pathToFileURL } from "url";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load all slash commands from the commands directory
 * Similar to Jockie Music's modular command structure
 */
export async function loadCommands(client) {
  client.commands = new Map();
  const commandsPath = join(__dirname, "..", "commands");
  
  try {
    const files = readdirSync(commandsPath).filter(f => f.endsWith(".js"));
    
    for (const file of files) {
      const filePath = pathToFileURL(join(commandsPath, file)).href;
      const command = await import(filePath);
      const cmd = command.default || command;
      
      if (cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
        console.log(`✅ Loaded command: ${cmd.data.name}`);
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
 * Handle slash command interactions
 */
export async function handleInteraction(interaction, client) {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    
    const reply = {
      content: "❌ Terjadi error saat menjalankan command!",
      ephemeral: true,
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}
