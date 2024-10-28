const axios = require('axios');
const AIServiceInterface = require('./AIServiceInterface');
const fs = require('fs');
const path = require('path');

class OpenRouterService extends AIServiceInterface {
	constructor() {
		super();
		this.cacheDir = path.join(__dirname, '../../cache');
		this.cacheFile = path.join(this.cacheDir, 'openrouter_models.json');
		this.ensureCacheDir();
	}

	ensureCacheDir() {
		if (!fs.existsSync(this.cacheDir)) {
			fs.mkdirSync(this.cacheDir, { recursive: true });
		}
	}

	async promptText(prompt, model = 'gpt-4o-mini', maxTokens = 8192, temperature = 0.7) {
		const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
			model: model,
			messages: [{ role: 'user', content: prompt }],
			max_tokens: maxTokens,
			temperature: temperature,
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY} `,
				'X-App-Name': 'Easy GPT'
			}
		});
		return response.data;
	}

	async promptStreamText(res, prompt, model = 'gpt-4o-mini', maxTokens = 8192, temperature = 0.7) {
		const DELIMITER = '\u001e';
		const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
			model: model,
			messages: [{ role: 'user', content: prompt }],
			max_tokens: maxTokens,
			temperature: temperature,
			stream: true
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY} `,
				'X-App-Name': 'Easy GPT'
			},
			responseType: 'stream'
		});

		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		let buffer = '';

		response.data.on('data', (data) => {
			buffer += data.toString();
			let boundary = buffer.indexOf('\n\n');
			while (boundary !== -1) {
				const chunk = buffer.slice(0, boundary);
				buffer = buffer.slice(boundary + 2);
				const lines = chunk.split('\n').filter(line => line.trim() !== '');
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const message = line.replace(/^data: /, '');
						if (message === '[DONE]') {
							res.write(`data: [DONE]${DELIMITER} `);
							res.end();
							return;
						}
						try {
							const parsed = JSON.parse(message);
							const content = parsed.choices[0].delta.content;
							if (content) {
								res.write(`data: ${content}${DELIMITER} `);
							}
						} catch (error) {
							console.error('Error parsing message', error);
						}
					}
				}
				boundary = buffer.indexOf('\n\n');
			}
		});

		response.data.on('end', () => {
			res.end();
		});

		response.data.on('error', (error) => {
			res.status(500).json({ error: error.message });
		});
	}

	async listModels() {
		const now = Date.now();
		const oneDay = 24 * 60 * 60 * 1000;
		let cachedData = null;
		if (fs.existsSync(this.cacheFile)) {
			try {
				const fileContent = fs.readFileSync(this.cacheFile, 'utf-8');
				const parsed = JSON.parse(fileContent);
				cachedData = parsed.data;
				const lastFetched = parsed.timestamp;
				if (now - lastFetched > oneDay) {
					this.refreshCache();
				}
			} catch (error) {
				console.error('Error reading cache:', error);
			}
		} else {
			this.refreshCache();
		}
		return cachedData || await this.fetchAndCacheModels();
	}

	async fetchAndCacheModels() {
		try {
			const response = await axios.get('https://openrouter.ai/api/v1/models', {
				headers: {
					'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY} `,
					'X-App-Name': 'Easy GPT'
				}
			});
			const data = response.data;
			fs.writeFileSync(this.cacheFile, JSON.stringify({ data, timestamp: Date.now() }), 'utf-8');
			return data;
		} catch (error) {
			console.error('Error in listModels:', error.response ? error.response.data : error.message);
			throw error;
		}
	}

	async refreshCache() {
		this.fetchAndCacheModels().catch(error => {
			console.error('Error refreshing cache:', error);
		});
	}
};

module.exports = OpenRouterService;
