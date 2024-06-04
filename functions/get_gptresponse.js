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
  catch (error) {
    console.error("Error in get_gptresponse:", error);
    return { error: error.message };
  }
}

module.exports = { get_gptresponse };

// not a function call