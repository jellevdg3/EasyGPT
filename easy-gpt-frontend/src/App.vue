<script setup>
import { ref, reactive, computed } from 'vue';
import { sendMessageStreaming } from './services/PromptService';
import { getModels, updateModelStatus } from './services/ModelService';
import MessageContainer from './components/MessageContainer.vue';
import InputContainer from './components/InputContainer.vue';
import ModelSelector from './components/ModelSelector.vue';

const messages = reactive({});

const models = getModels();
const activeModels = reactive(Object.fromEntries(models.map(model => [model.id, model.active])));
const loadingModels = reactive(Object.fromEntries(models.map(model => [model.id, false])));

const currentModel = ref('openai/gpt-4o-mini');
const userInput = ref('');

const updateActiveModel = ({ model, value }) => {
	updateModelStatus(model, value);
	activeModels[model] = value;
};

const initiateSendMessageStreaming = async () => {
	if (userInput.value.trim() === '') return;
	const prompt = userInput.value;
	const userMessage = { sender: 'user', text: prompt };
	const modelsToSend = Object.keys(activeModels).filter(model => activeModels[model]);

	modelsToSend.forEach(model => {
		if (!messages[model]) {
			messages[model] = [];
		}
		messages[model].push({ ...userMessage });

		const botMessage = reactive({ sender: 'bot', text: '' });
		messages[model].push(botMessage);
		loadingModels[model] = true;

		sendMessageStreaming(prompt, model, (message) => {
			if (message.startsWith('data: ')) {
				message = message.substring(6);
			}

			if (message === '[DONE]') {
				loadingModels[model] = false;
				return;
			}

			botMessage.text += message;
		}).catch(error => {
			botMessage.text = 'Error: ' + (error.message || 'Unknown error');
			loadingModels[model] = false;
		});
	});

	userInput.value = '';
};
</script>

<template>
	<div id="app">
		<ModelSelector 
			v-model="currentModel" 
			:active-models="activeModels" 
			:loading-models="loadingModels"
			@update:activeModels="updateActiveModel" 
		/>
		<MessageContainer :messages="currentModel ? messages[currentModel] : []" />
		<InputContainer v-model="userInput" @send="initiateSendMessageStreaming" />
	</div>
</template>

<style scoped>
#app {
	display: flex;
	flex-direction: column;
	background-color: var(--background-color);
	color: var(--text-color);
	width: 100vw;
	margin: 0 auto;
	height: 100vh;
	overflow: hidden;
	position: relative;
}

@media (min-width: 768px) {
	#app {
		max-width: 80vw;
	}
}
</style>