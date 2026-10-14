import "dotenv/config";
import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { pathToFileURL } from "url";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function deployCommands() {
  const commands = [];
  const commandsPath = join(__dirname, "commands");
  const files = readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const filePath = pathToFileURL(join(commandsPath, file)).href;
    const command = await import(filePath);
    const cmd = command.default || command;
    if (cmd.data) {
      commands.push(cmd.data.toJSON());
    }
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`Deploying ${commands.length} slash commands...`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ Successfully deployed ${data.length} slash commands!`);
    console.log("\nCommands:");
    for (const cmd of data) {
      console.log(`  /${cmd.name} - ${cmd.description}`);
    }
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
}

deployCommands();
