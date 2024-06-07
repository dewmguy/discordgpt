// get_dalle.js

const axios = require('axios');
const ImageKit = require("imagekit");
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

async function generateImage(prompt, orientation) {
  try {
    let resolution = '1792x1024'
    if(orientation === 'portrait') { resolution = '1024x1792'; }
    const image = await openai.images.generate({ prompt: prompt, model: "dall-e-3", quality: `hd`, size: resolution });
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

const get_dalle = async ({ prompt, orientation }) => {
  console.log("get_dalle_image function was called");
  console.log(`generating an image: ${prompt}`);
  try {
    const startTime = Date.now();
    const image = await generateImage(prompt, orientation);
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
    console.error("Error in get_dalle:", error);
    return { error: error.message };
  }
};

module.exports = { get_dalle };

/*
{
  "name": "get_dalle",
  "description": "Retrieves generated images from the most current Dall-e API. Useful when asked to generate an image. Do not exclude or alter the output.",
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The image description."
      },
      "orientation": {
        "type": "string",
        "description": "The image orientation.",
        "enum": ["landscape", "portrait"]
      }
    },
    "required": [
      "prompt",
      "orientation"
    ]
  }
}
*/