require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenRouterService = require('./services/OpenRouterService');

const app = express();
const service = new OpenRouterService();

app.use(express.json());
app.use(cors());

app.post('/prompt/text', async (req, res) => {
	const prompt = req.body.prompt;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	try {
		const data = await service.promptText(prompt);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log(error);
	}
});

app.post('/promptStream/text', async (req, res) => {
	const prompt = req.body.prompt;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	try {
		await service.promptStreamText(prompt, res);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Azure TTS server is running on port ${PORT}`);
});