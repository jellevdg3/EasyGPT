<template>
	<div class="input-container-wrapper">
		<button class="toggle-button" @click="toggleExpand">
			<svg v-if="!expanded" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
				viewBox="0 0 24 24">
				<path d="M12 8l6 6H6z" />
			</svg>
			<svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
				viewBox="0 0 24 24">
				<path d="M12 16l-6-6h12z" />
			</svg>
		</button>
		<div :class="['input-container', { expanded: expanded }]">
			<button class="clear-button mr-2" @click="handleClear">
				<v-icon>mdi-trash-can</v-icon>
			</button>
			<textarea :value="modelValue" @input="updateValue" @keyup="handleKeyup" placeholder="Type a message..."
				:class="{ expanded: expanded }"></textarea>
			<div class="button-group ml-2">
				<button class="input-button" @click="handleSend">Send</button>
				<button class="input-button" @click="handleNewChat">New Chat</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import VSCodeService from '../services/VSCodeService';

const props = defineProps({
	modelValue: String
});

const emit = defineEmits(['update:modelValue', 'send', 'clear']);

const expanded = ref(false);

const handleKeyup = (event) => {
	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		emit('send');
	}
};

const updateValue = (event) => {
	emit('update:modelValue', event.target.value);
};

const handleSend = () => {
	emit('send');
};

const handleClear = () => {
	emit('clear');
};

const toggleExpand = () => {
	expanded.value = !expanded.value;
};

const handleNewChat = () => {
	VSCodeService.postData('openNewChat', '');
};
</script>

<style scoped>
.input-container-wrapper {
	position: relative;
	width: 100%;
	padding-top: 20px;
}

.toggle-button {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.input-container {
	display: flex;
	align-items: center;
	width: 100%;
	padding: 1em 0.5em 1em 0.5em;
	background-color: var(--input-bg);
	border-top: 1px solid var(--border-color);
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.input-container.expanded {
	padding: 1em 0.5em 1em 0.5em;
}

.clear-button {
	background: none;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	margin: 0px 0px 0px 0px;
	padding: 0px;
}

textarea {
	flex: 1;
	padding: 0.5em;
	border: 1px solid var(--input-border);
	border-radius: 4px;
	background-color: var(--input-color);
	color: var(--input-text);
	resize: none;
	transition: height 0.3s ease;
	height: 100px;
}

textarea.expanded {
	height: 320px;
}

.button-group {
	display: flex;
	flex-direction: column;
}

.button-group button {
	margin-left: 0;
	margin-top: 0.5em;
	background-color: var(--button-bg);
	color: var(--button-text);
	border: 1px solid var(--button-border);
	width: 80px;
	cursor: pointer;
}

.input-button {
	width: 110px !important;
}
</style>