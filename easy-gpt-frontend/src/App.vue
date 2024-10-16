<script setup>
import { ref, nextTick, reactive } from 'vue';
import { marked } from 'marked';
import { sendMessageStreaming } from './services/PromptService';
import MessageContainer from './components/MessageContainer.vue';
import InputContainer from './components/InputContainer.vue';

const messages = ref([]);
const userInput = ref('');

const initiateSendMessageStreaming = async () => {
	if (userInput.value.trim() === '') return;
	const prompt = userInput.value;
	const userMessage = { sender: 'user', text: prompt };
	messages.value.push(userMessage);
	userInput.value = '';

	const botMessage = reactive({ sender: 'bot', text: '' });
	messages.value.push(botMessage);

	try {
		await sendMessageStreaming(prompt, (message) => {
			if (message.startsWith('data: ')) {
				message = message.substring(6);
			}

			if (message === '[DONE]') {
				return;
			}

			botMessage.text += message;
		});
	} catch (error) {
		botMessage.text = 'Error: ' + (error.message || 'Unknown error');
	}
};

const formatMessage = (text) => {
	return marked.parse(text);
};
</script>

<template>
	<div id="app">
		<MessageContainer :messages="messages" :formatMessage="formatMessage" />
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