<script setup>
import { ref, nextTick, reactive } from 'vue';

const messages = ref([]);
const userInput = ref('');
const messageContainer = ref(null);

const sendMessageStreaming = async () => {
	if (userInput.value.trim() === '') return;
	const userMessage = { sender: 'user', text: userInput.value };
	messages.value.push(userMessage);
	const prompt = userInput.value;
	userInput.value = '';

	const botMessage = reactive({ sender: 'bot', text: '' });
	messages.value.push(botMessage);
	nextTick(() => {
		messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
	});

	try {
		const response = await fetch('http://localhost:3000/promptStream/text', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ prompt }),
		});

		if (!response.body) {
			throw new Error('ReadableStream not supported in this browser.');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let buffer = '';

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let lines = buffer.split('\n\n');
			buffer = lines.pop();
			for (const line of lines) {
				const trimmedLine = line.trim();

				let message = '';
				if (trimmedLine.startsWith('data: ')) {
					message = trimmedLine.substring(6);
				}

				if (message === '[DONE]') {
					return;
				}

				console.log(message);
				botMessage.text += message;
				nextTick(() => {
					messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
				});
			}
		}
	} catch (error) {
		botMessage.text = 'Error: ' + (error.message || 'Unknown error');
		nextTick(() => {
			messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
		});
	}
};

const handleKeyup = (event) => {
	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		sendMessageStreaming();
	}
};
</script>

<template>
	<div id="app">
		<div id="message-container" class="message-container" ref="messageContainer">
			<div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender]">
				<span class="message-text">{{ msg.text }}</span>
			</div>
		</div>
		<div class="input-container">
			<textarea v-model="userInput" @keyup="handleKeyup" placeholder="Type a message..." rows="3"></textarea>
			<button @click="sendMessageStreaming">Send</button>
		</div>
	</div>
</template>

<style scoped>
#app {
	display: flex;
	flex-direction: column;
	background-color: var(--background-color);
	color: var(--text-color);
	width: 100vw;
	max-width: 1024px;
	margin: 0 auto;
	height: 100vh;
	overflow: hidden;
	position: relative;
}

.message-container {
	flex: 1;
	padding: 1em;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	width: 100%;
	box-sizing: border-box;
}

.message {
	max-width: 60%;
	padding: 0.5em 1em;
	margin: 0.5em 0;
	border-radius: 10px;
	background-color: var(--message-bg);
	color: var(--message-text);
	word-wrap: break-word;
}

.message-text {
	white-space: pre-wrap;
}

.user {
	align-self: flex-end;
	background-color: var(--user-bg);
	color: var(--user-text);
}

.bot {
	align-self: flex-start;
	background-color: var(--bot-bg);
	color: var(--bot-text);
}

.input-container {
	display: flex;
	width: 100%;
	padding: 1em;
	background-color: var(--input-bg);
	border-top: 1px solid var(--border-color);
	box-sizing: border-box;
}

textarea {
	flex: 1;
	padding: 0.5em;
	border: 1px solid var(--input-border);
	border-radius: 4px;
	background-color: var(--input-color);
	color: var(--input-text);
	resize: none;
}

button {
	margin-left: 0.5em;
	background-color: var(--button-bg);
	color: var(--button-text);
	border: 1px solid var(--button-border);
	width: 80px;
}
</style>
