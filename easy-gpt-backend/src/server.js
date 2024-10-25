require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenRouterService = require('./services/OpenRouterService');
const AzureAIService = require('./services/AzureAIService');
//const PuppeteerService = require('./services/PuppeteerService');
//const PlaywrightService = require('./services/PlaywrightService');

// https://bot.sannysoft.com/
// https://arh.antoinevastel.com/bots/areyouheadless
// https://antoinevastel.com/bots/
// https://deviceandbrowserinfo.com/are_you_a_bot
// const puppeteerService = new PuppeteerService({ url: 'https://chatgpt.com/' });
// const playwrightService = new PlaywrightService({ url: 'https://chatgpt.com/' });

const app = express();
const openRouterService = new OpenRouterService();
const azureService = new AzureAIService();

app.use(express.json());
app.use(cors());

app.post('/prompt/text', async (req, res) => {
	const prompt = req.body.prompt;
	const model = req.body.model;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	if (!model) {
		return res.status(400).json({ error: 'Model is required' });
	}
	try {
		const data = await openRouterService.promptText(prompt, model);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log(error);
	}
});

app.post('/promptStream/text', async (req, res) => {
	const prompt = req.body.prompt;
	const model = req.body.model;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	if (!model) {
		return res.status(400).json({ error: 'Model is required' });
	}
	try {
		await openRouterService.promptStreamText(res, prompt, model);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/promptBrowser/text', async (req, res) => {
	const prompt = req.body.prompt;
	const model = req.body.model;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	if (!model) {
		return res.status(400).json({ error: 'Model is required' });
	}
	try {
		await puppeteerService.promptBrowserText(res, prompt, model);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/model/list', async (req, res) => {
	try {
		const data = await openRouterService.listModels();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/azure/prompt/text', async (req, res) => {
	const prompt = req.body.prompt;
	const model = req.body.model;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	if (!model) {
		return res.status(400).json({ error: 'Model is required' });
	}
	try {
		const data = await azureService.promptTextO1(prompt);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log(error);
	}
});

app.post('/azure/promptStream/text', async (req, res) => {
	const prompt = req.body.prompt;
	const model = req.body.model;
	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}
	if (!model) {
		return res.status(400).json({ error: 'Model is required' });
	}
	try {
		await azureService.promptStreamText(res, prompt);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/azure/model/list', async (req, res) => {
	try {
		const data = await azureService.listModels();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Azure TTS server is running on port ${PORT}`);
});
