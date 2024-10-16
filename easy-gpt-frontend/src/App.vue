<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const userInput = ref('')

const sendMessage = () => {
	if (userInput.value.trim() === '') return
	messages.value.push({ sender: 'user', text: userInput.value })
	userInput.value = ''
	nextTick(() => {
		window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
	})
	const reply = { sender: 'bot', text: 'This is a placeholder response.' }
	setTimeout(() => {
		messages.value.push(reply)
		nextTick(() => {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
		})
	}, 500)
}
</script>

<template>
	<div id="app">
		<div id="message-container" class="message-container">
			<div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender]">
				{{ msg.text }}
			</div>
		</div>
		<div class="input-container">
			<input v-model="userInput" @keyup.enter="sendMessage" placeholder="Type a message..." />
			<button @click="sendMessage">Send</button>
		</div>
	</div>
</template>

<style scoped>
#app {
	display: flex;
	flex-direction: column;
	background-color: var(--background-color);
	color: var(--text-color);
	width: 100%;
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
	position: fixed;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	width: 100%;
	max-width: 1024px;
	padding: 1em;
	background-color: var(--input-bg);
	border-top: 1px solid var(--border-color);
	box-sizing: border-box;
}

input {
	flex: 1;
	padding: 0.5em;
	border: 1px solid var(--input-border);
	border-radius: 4px;
	background-color: var(--input-color);
	color: var(--input-text);
}

button {
	margin-left: 0.5em;
	background-color: var(--button-bg);
	color: var(--button-text);
	border: 1px solid var(--button-border);
	width: 80px;
}
</style>