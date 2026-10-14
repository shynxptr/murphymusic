import { handleInteraction } from "../handlers/commandHandler.js";
import { handleSearchSelect } from "../handlers/searchSelectHandler.js";

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    // Handle select menu interactions
    if (interaction.isStringSelectMenu()) {
      await handleSearchSelect(interaction, client);
      return;
    }

    // Handle slash commands
    await handleInteraction(interaction, client);
  },
};
