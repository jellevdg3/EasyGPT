require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/prompt/text', async (req, res) => {
	const prompt = req.body.prompt;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	try {
		const response = await axios.post('https://api.openai.com/v1/chat/completions', {
			model: 'gpt-4o-mini',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 8192,
			temperature: 0.7,
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
			}
		});
		res.json(response.data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/promptStream/text', async (req, res) => {
	const prompt = req.body.prompt;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	try {
		const response = await axios.post('https://api.openai.com/v1/chat/completions', {
			model: 'gpt-4o-mini',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 8192,
			temperature: 0.7,
			stream: true
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
			},
			responseType: 'stream'
		});

		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		response.data.on('data', (data) => {
			const lines = data.toString().split('\n').filter(line => line.trim() !== '');
			for (const line of lines) {
				const message = line.replace(/^data: /, '');
				if (message === '[DONE]') {
					res.write('data: [DONE]\n\n');
					res.end();
					return;
				}
				try {
					const parsed = JSON.parse(message);
					const content = parsed.choices[0].delta.content;
					console.log(content);
					if (content) {
						res.write(`data: ${content}\n\n`);
					}
				} catch (error) {
					console.error('Error parsing message', error);
				}
			}
		});

		response.data.on('end', () => {
			res.end();
		});

		response.data.on('error', (error) => {
			res.status(500).json({ error: error.message });
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Azure TTS server is running on port ${PORT}`);
});
