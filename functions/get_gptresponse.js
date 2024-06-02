// get_gptresponse.js

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

const get_gptresponse = async (directive, data) => {
	try {
		console.log(`get_gptresponse function was called`);
		const completion = await openai.chat.completions.create({
			messages: [
				{ "role": "system", "content": directive },
				{ "role": "user", "content": data }
			],
			model: "gpt-4o",
		});
    const response = completion.choices[0]?.message?.content;
		console.log(`the response was: ${response}`);
		return response;
	}
	catch (error) { return { error: error.message }; }
}

module.exports = { get_gptresponse };

// not a function call

/**
 * This function is an async function that takes two parameters: directive and data.
 * It uses the OpenAI API to create a chatbot with the given directive and data.
 * The function returns the response from the chatbot.
 * 
 * @async
 * @param {string} directive - The system message that the chatbot will use as a guide.
 * @param {string} data - The user message that the chatbot will use as input.
 * @returns {Promise<string|object>} - A Promise that resolves to the response from the chatbot as a string or an error object.
 */