const models = [
	{ id: 'openai/gpt-4o-mini', displayName: 'gpt-4o-mini', active: true },
	{ id: 'openai/gpt-4o', displayName: 'gpt-4o', active: false },
	{ id: 'openai/o1-mini', displayName: 'o1-mini', active: false },
	{ id: 'anthropic/claude-3.5-sonnet', displayName: 'claude-3.5', active: false }
];

const getModels = () => {
	return models;
};

const updateModelStatus = (modelId, value) => {
	const model = models.find(model => model.id === modelId);
	if (model) {
		model.active = value;
	}
};

export { getModels, updateModelStatus };
