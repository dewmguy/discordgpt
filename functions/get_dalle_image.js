// get_dalle_image.js

require('dotenv').config();

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

const axios = require('axios');

const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function generateImage(prompt) {
  try {
    const image = await openai.images.generate({ prompt: prompt, model: "dall-e-3", quality: `hd`, size: `1792x1024` });
    return image.data[0];
  }
  catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

async function uploadToImageKit(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const uploadResponse = await imagekit.upload({
      file: imageBuffer,
      fileName: "dalle_image.jpg"
    });
    return uploadResponse.url;
  } catch (error) {
    console.error("Error uploading to ImageKit:", error);
    return null;
  }
}

const get_dalle_image = async ({ prompt }) => {
  console.log("get_dalle_image function was called");
  console.log(`generating an image: ${prompt}`);
  try {
    const startTime = Date.now();
    const image = await generateImage(prompt);
    const imageKitUrl = await uploadToImageKit(image.url);
    const endTime = (Date.now() - startTime) / 1000;
    const duration = `Generated Image (${endTime} seconds):`;
    const revisedPrompt = `Optimized prompt: ${image.revised_prompt}`;
    console.log(duration);
    console.log(revisedPrompt);
    console.log(image.url);
    console.log(imageKitUrl);

    return {
      duration,
      revisedPrompt,
      imageUrl: imageKitUrl
    };
  }
  catch (error) {
    console.error("Error in get_dalle_image:", error);
    return { error: error.message };
  }
};

module.exports = { get_dalle_image };

/*
{
  "name": "get_dalle_image",
  "description": "This function will connect you to Dalle 3 API for image generation. Feel free to format, but do not exclude or alter the data provided by the function.",
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The description of the image to be created by Dall-e 3"
      }
    },
    "required": [
      "prompt"
    ]
  }
}
*/

/**
 * This function will connect you to Dalle 3 API for image generation. It takes a prompt as a string, which is the description of the image to be created by Dall-e 3. The function will then return an object with the following properties:
 * - `duration`: a string describing the duration of the image generation process.
 * - `revisedPrompt`: a string describing the optimized prompt used by Dall-e 3.
 * - `imageUrl`: a string representing the URL of the generated image.
 * If there is an error during the image generation process, the function will return an object with an `error` property containing the error message.
 */