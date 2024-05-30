// get_vision.js

require('dotenv').config();

//openai
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

const get_vision = async ({ prompt, imageURLs }) => {
  try {
    console.log(`get_vision function was called`);

    const content = [
      { type: "text", text: prompt },
      ...imageURLs.map(url => ({ type: "image_url", image_url: { url: url } }))
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: content
      }]
    });
    console.log(response.choices[0]);
    const result = response.choices[0].message.content;
    return result;
  }
  catch (error) {
    console.error("Error in get_vision:", error);
    return { error: error.message };
  }
};

module.exports = { get_vision };

/* function call
{
  "name": "get_vision",
  "description": "This function will connect you to the ChatGPT API for image analysis.",
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The query the user has about the given images."
      },
      "imageURLs": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "The URLs associated with the images the user attached to their discord message."
      }
    },
    "required": [
      "prompt",
      "imageURLs"
    ]
  }
}
*/