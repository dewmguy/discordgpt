# DiscordGPT Description and Usage

## Description

This app integrates various services including Discord, Airtable, and OpenAI to create an advanced bot that can handle complex interactions within Discord servers. It utilizes the Discord.js library to interact with Discord's API, Airtable for storing and managing data, and OpenAI's API for processing and responding to user messages.

### OpenAI Assistants API Integration

This app is integrated with the OpenAI Assistants API, allowing the Discord bot to utilize advanced AI models for processing and responding to messages with enhanced accuracy and contextual awareness. The use of OpenAI's Assistants API significantly improves the bot's responsiveness and interaction quality, enabling more human-like conversations within Discord.

## How to Use

1. **Configure your Assistant**
   - Log into the OpenAI platform and create a new assistant and configure it with your preferred model, instructions, and other options.
   - Obtain the `Assistant ID` from the assistant settings and include it in the environment variables as `OPENAI_ASSISTANTID`.

2. **Starting the Bot:**
   - Ensure all necessary dependencies are installed by running `npm install openai discord.js dotenv airtable`
   - Start the bot with `node index.js` (assuming your main file is named `index.js`).
   - Recommend using tmux to keep the bot running in the background

3. **Interacting with the Bot:**
   - The bot listens for direct mentions in a Discord server.
   - Once mentioned, it processes the message and uses OpenAI's capabilities to generate a response based on the content.
   - The bot can handle messages sequentially by locking threads to manage multiple interactions concurrently.

4. **Handling Errors and Outputs:**
   - The bot handles errors gracefully by notifying the user of any issues encountered during the interaction.
   - Responses from the bot are split as needed to fit Discord's message length constraints. 

## Environment Variables

To function correctly, the app requires the following environment variables to be set:

- `DISCORD_TOKEN`: The token for the Discord bot, used to authenticate and connect to the Discord API.
- `AIRTABLE_APIKEY`: The API key for accessing Airtable, used to read and write data to your base.
- `AIRTABLE_BASE`: The ID of your Airtable base, which stores data such as thread identifiers and locks.
- `OPENAI_APIKEY`: The API key for OpenAI, enabling the bot to send requests to OpenAI's services.
- `OPENAI_ASSISTANTID`: The specific Assistant ID to use with OpenAI, directing requests to the correct model or assistant.

## Additional Notes

- Ensure all tokens and keys are kept secure and not hardcoded in your source files.
- The bot's functionality can be extended or modified based on specific needs or additional features provided by Discord, Airtable, and OpenAI.

This README aims to provide a comprehensive guide to setting up and using the bot effectively. For further customizations or troubleshooting, refer to the documentation of each service respectively.
