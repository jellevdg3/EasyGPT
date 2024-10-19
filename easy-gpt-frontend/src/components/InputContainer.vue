<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
	modelValue: String
});

const emit = defineEmits(['update:modelValue', 'send']);

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

const toggleExpand = () => {
	expanded.value = !expanded.value;
};
</script>

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
			<textarea :value="modelValue" @input="updateValue" @keyup="handleKeyup" placeholder="Type a message..."
				:class="{ expanded: expanded }"></textarea>
			<button @click="handleSend">Send</button>
		</div>
	</div>
</template>

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
	width: 100%;
	padding: 1em;
	background-color: var(--input-bg);
	border-top: 1px solid var(--border-color);
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.input-container.expanded {
	padding: 1em 1em 1em 1em;
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
	height: 72px;
}

textarea.expanded {
	height: 240px;
}

button {
	margin-left: 0.5em;
	background-color: var(--button-bg);
	color: var(--button-text);
	border: 1px solid var(--button-border);
	width: 80px;
	cursor: pointer;
}
</style>