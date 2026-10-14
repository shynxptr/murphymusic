import { readdirSync } from "fs";
import { pathToFileURL } from "url";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Events } from "discord.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Map our event file names to discord.js Events enum
// This avoids deprecation warnings and ensures correct event names
const EVENT_NAME_MAP = {
  ready: Events.ClientReady,
  raw: "raw",
  interactionCreate: Events.InteractionCreate,
  voiceStateUpdate: Events.VoiceStateUpdate,
};

/**
 * Load and register all event handlers from the events directory
 */
export async function loadEvents(client) {
  const eventsPath = join(__dirname, "..", "events");
  
  try {
    const files = readdirSync(eventsPath).filter(f => f.endsWith(".js"));
    
    for (const file of files) {
      const filePath = pathToFileURL(join(eventsPath, file)).href;
      const event = await import(filePath);
      const evt = event.default || event;
      
      if (evt.name && evt.execute) {
        // Use mapped event name if available, otherwise use the file's name
        const eventName = EVENT_NAME_MAP[evt.name] || evt.name;
        
        if (evt.once) {
          client.once(eventName, (...args) => evt.execute(...args, client));
        } else {
          client.on(eventName, (...args) => evt.execute(...args, client));
        }
        console.log(`✅ Loaded event: ${evt.name} -> ${eventName}`);
      }
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
}
