const axios = require('axios');
const AIServiceInterface = require('./AIServiceInterface');

class AzureAIService extends AIServiceInterface {
	constructor() {
		super();
		this.apiKey = process.env.AZURE_API_KEY;
		this.endpoint = process.env.AZURE_API_ENDPOINT;
		this.deploymentName = process.env.AZURE_DEPLOYMENT_NAME;
		this.apiVersion = process.env.AZURE_API_VERSION || '2023-03-15-preview';

		if (!this.apiKey || !this.endpoint || !this.deploymentName) {
			throw new Error('Missing required Azure OpenAI environment variables: AZURE_API_KEY, AZURE_API_ENDPOINT, AZURE_DEPLOYMENT_NAME.');
		}
	}

	async promptText(prompt, maxTokens = 800, temperature = 0.7) {
		const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
		try {
			const response = await axios.post(url, {
				messages: [
					{
						role: 'system',
						content: [
							{
								type: 'text',
								text: 'You are an AI assistant that helps people find information.'
							}
						]
					},
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: prompt
							}
						]
					}
				],
				max_tokens: maxTokens,
				temperature: temperature,
				top_p: 0.95
			}, {
				headers: {
					'Content-Type': 'application/json',
					'api-key': this.apiKey
				}
			});
			return response.data;
		} catch (error) {
			console.error('Error in promptText:', error.response ? error.response.data : error.message);
			throw error;
		}
	}

	async promptTextO1(prompt) {
		const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
		try {
			const response = await axios.post(url, {
				messages: [
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: prompt
							}
						]
					}
				],
			}, {
				headers: {
					'Content-Type': 'application/json',
					'api-key': this.apiKey
				}
			});
			return response.data;
		} catch (error) {
			console.error('Error in promptText:', error.response ? error.response.data : error.message);
			throw error;
		}
	}

	async promptStreamText(res, prompt, maxTokens = 800, temperature = 0.7) {
		const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
		try {
			const response = await axios.post(url, {
				messages: [
					{
						role: 'system',
						content: [
							{
								type: 'text',
								text: 'You are an AI assistant that helps people find information.'
							}
						]
					},
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: prompt
							}
						]
					}
				],
				max_tokens: maxTokens,
				temperature: temperature,
				top_p: 0.95,
				stream: true
			}, {
				headers: {
					'Content-Type': 'application/json',
					'api-key': this.apiKey
				},
				responseType: 'stream'
			});

			res.setHeader('Content-Type', 'text/event-stream');
			res.setHeader('Cache-Control', 'no-cache');
			res.setHeader('Connection', 'keep-alive');

			let buffer = '';

			response.data.on('data', (chunk) => {
				buffer += chunk.toString();
				let boundary = buffer.indexOf('\n\n');
				while (boundary !== -1) {
					const chunkData = buffer.slice(0, boundary);
					buffer = buffer.slice(boundary + 2);
					const lines = chunkData.split('\n').filter(line => line.trim() !== '');
					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const message = line.replace(/^data: /, '');
							if (message === '[DONE]') {
								res.write(`data: [DONE]\n\n`);
								res.end();
								return;
							}
							try {
								const parsed = JSON.parse(message);
								const content = parsed.choices?.[0]?.delta?.content;
								if (content) {
									res.write(`data: ${content}\n\n`);
								}
							} catch (error) {
								console.error('Error parsing message:', error);
							}
						}
					}
					boundary = buffer.indexOf('\n\n');
				}
			});

			response.data.on('end', () => {
				if (!res.writableEnded) {
					res.end();
				}
			});

			response.data.on('error', (error) => {
				console.error('Stream error:', error);
				if (!res.headersSent) {
					res.status(500).json({ error: error.message });
				} else {
					res.end();
				}
			});

			response.data.on('close', () => {
				if (!res.writableEnded) {
					res.end();
				}
			});
		} catch (error) {
			console.error('Error in promptStreamText:', error.response ? error.response.data : error.message);
			res.status(500).json({ error: error.message });
		}
	}

	async listModels() {
		const url = `${this.endpoint}/openai/models?api-version=${this.apiVersion}`;
		try {
			const response = await axios.get(url, {
				headers: {
					'api-key': this.apiKey
				}
			});
			return response.data;
		} catch (error) {
			console.error('Error in listModels:', error.response ? error.response.data : error.message);
			throw error;
		}
	}
}

module.exports = AzureAIService;
