<template>
	<div :class="['message', message.sender]">
		<div v-if="hasMessage()">
			<span class="message-text" v-html="formatMessage(message.text)"></span>
			<div class="button-group">
				<v-btn v-if="VSCodeService.IsInVSCode" icon tile size="x-small" @click="writeCode"
					class="menu-button elevation-0" style="background-color: transparent; right: 48px;">
					<v-icon color="white">mdi-check-bold</v-icon>
				</v-btn>
				<v-btn icon tile size="x-small" @click="copyText" class="menu-button elevation-0"
					style="background-color: transparent; right: 24px;">
					<v-icon color="white">mdi-content-copy</v-icon>
				</v-btn>
				<v-btn icon tile size="x-small" @click="copyMessage" class="menu-button elevation-0"
					style="background-color: transparent;">
					<v-icon color="white">mdi-code-block-parentheses</v-icon>
				</v-btn>
			</div>
		</div>
		<div v-else class="typing">
			<span></span><span></span><span></span>
		</div>
	</div>
</template>

<script setup>
import { marked } from 'marked';
import VSCodeService from '../services/VSCodeService';

const props = defineProps({
	message: Object
});

const formatMessage = (text) => {
	return marked.parse(text);
}

const hasMessage = () => props.message.text && props.message.text !== '';

const copyMessage = () => {
	navigator.clipboard.writeText(props.message.text);
}

const writeCode = () => {
	VSCodeService.postData('writeCode', props.message.text);
}

const copyText = () => {
	const formattedHtml = formatMessage(props.message.text);
	const tempElement = document.createElement('div');
	tempElement.innerHTML = formattedHtml;
	const plainText = tempElement.innerText;
	navigator.clipboard.writeText(plainText);
}
</script>

<style>
ol {
	padding: 0em 1em !important;
}

ul {
	padding: 0em 1em !important;
}
</style>

<style scoped>
.message {
	min-width: 30%;
	max-width: 100%;
	padding: 0.5em 1em;
	margin: 0.5em 0;
	border-radius: 10px;
	background-color: var(--message-bg);
	color: var(--message-text);
	word-wrap: break-word;
	position: relative;
}

@media (min-width: 768px) {
	.message {
		max-width: 60%;
	}
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

.message-text {
	white-space: pre-wrap;
}

.message-text li {
	word-wrap: break-word;
}

.typing {
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.typing span {
	width: 8px;
	height: 8px;
	margin: 2px 2px;
	background-color: var(--message-text);
	border-radius: 50%;
	animation: typing 1s infinite;
}

.typing span:nth-child(2) {
	animation-delay: 0.2s;
}

.typing span:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes typing {
	0% {
		opacity: 0.2;
		transform: translateY(0);
	}

	20% {
		opacity: 1;
		transform: translateY(-5px);
	}

	100% {
		opacity: 0.2;
		transform: translateY(0);
	}
}

.menu-button {
	position: absolute;
	bottom: 0px;
	right: 0px;
	padding: 0px;
	margin: 0px;
}

.button-group {
	display: flex;
	gap: 4px;
}
</style>