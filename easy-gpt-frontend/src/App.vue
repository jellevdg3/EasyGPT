<template>
	<div id="app">
		<div class="header">
			<ModelSelector v-model="currentModel" :active-models="activeModels" :loading-models="loadingModels"
				@update:activeModels="updateActiveModel" @removeModel="removeActiveModel" />
			<v-btn icon @click="openSettings" class="settings-button elevation-0"
				style="background-color: transparent;">
				<v-icon>mdi-cog</v-icon>
			</v-btn>
		</div>
		<MessageContainer :messages="currentModel ? messages[currentModel] : []" />
		<InputContainer v-model="userInput" @send="initiateSendMessageStreaming" @clear="clearMessages" />
		<SettingsDialog v-model="settingsDialog" :appendCode="appendCode" :playSound="playSound" :clearChat="clearChat"
			@update:appendCode="updateAppendCode" @update:playSound="updatePlaySound"
			@update:clearChat="updateClearChat" />
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { sendMessageStreaming, sendSimpleMessage } from './services/PromptService';
import { getModels, updateModelStatus } from './services/ModelService';
import MessageContainer from './components/MessageContainer.vue';
import InputContainer from './components/InputContainer.vue';
import ModelSelector from './components/ModelSelector.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import { VBtn, VIcon, VSpacer } from 'vuetify/components';
import LocalDatabaseService from './services/LocalDatabaseService';
import VSCodeService from './services/VSCodeService';

const messages = reactive({});
const models = getModels();
const activeModels = reactive(Object.fromEntries(models.map(model => [model.id, model.active])));
const loadingModels = reactive(Object.fromEntries(models.map(model => [model.id, false])));

const currentModel = ref(models[0].id);
const userInput = ref('');
const panelId = ref(null);

const appendCode = ref(false);
const playSound = ref(true);
const clearChat = ref(true);

const settingsDialog = ref(false);

const updateActiveModel = ({ model, value }) => {
	updateModelStatus(model, value);
	activeModels[model] = value;
	saveState();
};

const removeActiveModel = (model) => {
	updateModelStatus(model, false);
	delete activeModels[model];
	if (currentModel.value === model) {
		const remainingModels = Object.keys(activeModels);
		currentModel.value = remainingModels.length > 0 ? remainingModels[0] : null;
	}
	saveState();
};

const updateAppendCode = (val) => {
	appendCode.value = val;
	saveSettings();
};

const updatePlaySound = (val) => {
	playSound.value = val;
	saveSettings();
};

const updateClearChat = (val) => {
	clearChat.value = val;
	saveSettings();
};

const handleSendSimpleMessage = async (model, prompt, botMessage) => {
	try {
		await sendSimpleMessage(prompt, model, (response) => {
			botMessage.text = response;
		}, playSound.value);
	} catch (error) {
		botMessage.text = 'Error: ' + (error.message || 'Unknown error');
	} finally {
		loadingModels[model] = false;
		saveState();
	}
};

const handleSendStreamingMessage = async (model, prompt, botMessage) => {
	try {
		await sendSimpleMessage(prompt, model, (message) => {
				if (message.startsWith('data: ')) {
					message = message.substring(6);
				}

				if (message === '[DONE]') {
					loadingModels[model] = false;
					saveState();
					return;
				}

				botMessage.text += message;
				saveState();
			}, playSound.value).catch(error => {
				botMessage.text = 'Error: ' + (error.message || 'Unknown error');
				loadingModels[model] = false;
				saveState();
			});
		}
		catch (error) {
			botMessage.text = 'Error: ' + (error.message || 'Unknown error');
			loadingModels[model] = false;
			saveState();
		}
};

const initiateSendMessageStreaming = async () => {
	if (clearChat.value) {
		clearMessages();
	}
	if (userInput.value.trim() === '') return;

	let prompt = userInput.value;
	userInput.value = '';

	const userMessage = { sender: 'user', text: prompt };
	const modelsToSend = Object.keys(activeModels).filter(model => activeModels[model]);

	for (const model of modelsToSend) {
		if (!messages[model]) {
			messages[model] = [];
		}
		messages[model].push({ ...userMessage });

		const botMessage = reactive({ sender: 'bot', text: '' });
		messages[model].push(botMessage);
		loadingModels[model] = true;

		if (VSCodeService.IsInVSCode && appendCode.value) {
			await new Promise((resolve) => {
				VSCodeService.getData('generatePrompt', null, (response) => {
					if (response.code) {
						prompt = response.code + '\n' + prompt;
					}
					resolve();
				});
			});
		}

		let simpleMessage = true;
		if (simpleMessage) {
			handleSendSimpleMessage(model, prompt, botMessage);
		}
		else {
			handleSendStreamingMessage(model, prompt, botMessage);
		}
	}

	saveState();
};

const clearMessages = () => {
	for (const key in messages) {
		if (messages.hasOwnProperty(key)) {
			messages[key] = [];
		}
	}
	saveState();
};

const saveState = () => {
	if (panelId.value) {
		LocalDatabaseService.saveData(`messages_${panelId.value}`, messages);
		saveSettings();
	}
};

const loadState = () => {
	if (panelId.value) {
		const savedMessages = LocalDatabaseService.loadData(`messages_${panelId.value}`);
		if (savedMessages) {
			Object.keys(savedMessages).forEach(model => {
				messages[model] = reactive(savedMessages[model]);
			});
		}
	}

	const savedSettings = LocalDatabaseService.loadData(`settings`);
	if (savedSettings) {
		appendCode.value = savedSettings.appendCode;
		playSound.value = savedSettings.playSound;
		clearChat.value = savedSettings.clearChat;
	}
};

const saveSettings = () => {
	LocalDatabaseService.saveData(`settings`, {
		appendCode: appendCode.value,
		playSound: playSound.value,
		clearChat: clearChat.value
	});
};

onMounted(() => {
	if (window.panelId) {
		panelId.value = window.panelId;
	}

	loadState();
});

watch(panelId, () => {
	loadState();
});

const openSettings = () => {
	settingsDialog.value = true;
};
</script>

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

.panel-id {
	padding: 10px;
}

.header {
	display: flex;
	justify-content: space-between;
}

@media (min-width: 768px) {
	#app {
		max-width: 80vw;
	}
}

.settings-button {
	margin-left: auto;
}
</style>