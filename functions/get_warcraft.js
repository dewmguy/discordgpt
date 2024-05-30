// get_warcraft.js

const fetch = require('node-fetch');

const get_warcraft = async ({ location }) => {
  console.log("get_warcraft function was called");

  try {
    //main logic
    return 'this function is not working at the moment.';
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_warcraft };

/*
{
  "name": "get_warcraft",
  "parameters": {
    "type": "object",
    "properties": {
      "infoType": {
        "type": "string",
        "description": "The type of in-game information the player is requesting.",
        "enum": [
          "item",
          "npc",
          "quest",
          "object",
          "achievement",
          "spells"
        ]
      },
      "playerName": {
        "type": "string",
        "description": "The name of the player's character. Useful for database references that may be able to provide orientation or directions."
      },
      "infoData": {
        "type": "string",
        "description": "The ID of the infoType in question. ID numbers can be referenced from the knowledge base or vector store."
      }
    },
    "required": [
      "infoType"
    ]
  },
  "description": "This function connects to a database that will pull queries from the azerothcore database in order to provide accurate and relevant information regarding the player's query."
}
*/