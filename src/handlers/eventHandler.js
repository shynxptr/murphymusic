import { readdirSync } from "fs";
import { pathToFileURL } from "url";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
        if (evt.once) {
          client.once(evt.name, (...args) => evt.execute(...args, client));
        } else {
          client.on(evt.name, (...args) => evt.execute(...args, client));
        }
        console.log(`✅ Loaded event: ${evt.name}`);
      }
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
}
