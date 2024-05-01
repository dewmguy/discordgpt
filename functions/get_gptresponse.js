// get_gptresponse.js

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

// This function can be used to generate a response from the OpenAI GPT model based on a custom prompt.
const get_gptresponse = async (directive,data) => {
	console.log("get_gptresponse was called");
    console.log(directive);
    console.log(data);
	try {
		const completion = await openai.chat.completions.create({
			messages: [
				{ "role": "system", "content": directive },
				{ "role": "user", "content": data }
			],
			model: "gpt-4-turbo",
		});
        console.log(completion.choices[0]?.message?.content);
		return completion.choices[0]?.message?.content;
	}
	catch (error) { return { error: error.message }; }
}

module.exports = { get_gptresponse };