class AIServiceInterface {
	async promptText(prompt, model = 'gpt-4o-mini', maxTokens = 8192, temperature = 0.7) {
		throw new Error('Not implemented');
	}

	async promptStreamText(res, prompt, model = 'gpt-4o-mini', maxTokens = 8192, temperature = 0.7) {
		throw new Error('Not implemented');
	}

	async listModels() {
		throw new Error('Not implemented');
	}
};

module.exports = AIServiceInterface;