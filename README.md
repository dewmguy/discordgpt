# Node.js Discord Bot

## Overview

This Node.js application is a Discord bot that leverages several third-party services to enhance its capabilities. The bot connects to Discord, Airtable, and OpenAI to provide a range of functionalities, including handling user messages, storing data in Airtable, and responding with AI-generated content. It also uses Axios for making HTTP requests.

## Features

- **Discord and OpenAI Integration**: The bot uses the `discord.js` library to interact with Discord servers, allowing it to listen and respond to user messages in real-time. It connects to OpenAI's Assistant using the Assistant API, leveraging the latest ChatGPT models to generate intelligent, context-aware responses. This integration turns the bot into an interactive assistant capable of holding meaningful conversations, answering questions, and providing helpful information directly within the chat, enhancing the user experience significantly.
- **Airtable Support**: The bot stores information in Airtable, including tracking threads, managing locks, and managing file uploads.
  - **Tracked Threads**: The bot maintains a record of active threads in a Discord server, allowing it to track ongoing discussions or projects effectively.
  - **Thread Locks**: Airtable is used to manage thread locks, which helps prevent multiple users from overwhelming the bot by making requests at the same time in the same thread. By locking a thread, the bot ensures that only one request is processed at a time, making interactions smoother and more orderly.
  - **File Uploads**: The bot extracts useful information from uploaded files, such as documents and spreadsheets, and saves this data into a vector store unique to the channel or thread. This allows for easy access in the future, while keeping information organized and ensuring that all relevant content is available within the proper context. The vector store helps maintain a structured way to retrieve and use the information when needed.
- **Function Calling**: The bot also comes with a couple dozen pre-made function calls ready for use, including features like Google search, weather information retrieval, DALL-E 3 image generation, OpenAI Vision for image analysis, and web page summarization. These function calls can greatly extend the bot's capabilities, but they need to be enabled by providing your own API keys and configuring the relevant services.

## Dependencies

- **discord.js**: A popular library used to easily interact with the Discord API. It allows developers to build bots that can connect to Discord servers, send and receive messages, and handle events like user interactions.
- **dotenv**: A module that loads environment variables from a `.env` file into `process.env`. This makes it easier to manage sensitive configuration data, like API keys, without hardcoding them directly in the code.
- **airtable**: A client library for connecting to Airtable's API. Airtable is a service that combines the simplicity of a spreadsheet with the power of a database, and this library makes it easy to interact with and manipulate Airtable records programmatically.
- **openai**: A library that provides access to OpenAI's API, allowing developers to interact with various AI models, including those for natural language understanding and response generation. This helps create more dynamic, conversational bots.
- **axios**: A popular promise-based HTTP client used for making requests to external APIs. It is known for its simplicity and flexibility in handling HTTP methods, and is often used for connecting with third-party services.
