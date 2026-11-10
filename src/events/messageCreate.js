import { handleMessageCommand } from "../handlers/commandHandler.js";

export default {
  name: "messageCreate",
  async execute(message, client) {
    await handleMessageCommand(message, client);
  },
};

