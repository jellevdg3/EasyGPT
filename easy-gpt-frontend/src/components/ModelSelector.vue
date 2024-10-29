<template>
	<div class="model-buttons">
		<div v-for="model in Object.keys(activeModels)" :key="model" class="model-button-wrapper">
			<div class="model-button-row">
				<div class="toggle-container">
					<template v-if="loadingModels[model]">
						<div class="spinner"></div>
					</template>
					<template v-else>
						<input type="checkbox" :checked="activeModels[model]" @change="toggleModel(model)"
							class="model-toggle" />
					</template>
				</div>
				<button @click="switchConversation(model)"
					:class="{ disabled: !activeModels[model], active: modelValue === model }" class="model-button"
					:data-model="model">
					{{ modelMap[model] || model }}
				</button>
				<button class="close-icon" @click="removeModel(model)">
					<i class="mdi mdi-close"></i>
				</button>
			</div>
		</div>
		<button class="add-button" @click="openDialog">
			<i class="mdi mdi-plus"></i>
		</button>
		<div class="active-line" :class="{ 'transition-enabled': isTransitionEnabled }"
			:style="{ left: `${activeLinePosition}px`, width: `${activeLineWidth}px`, top: `${activeLineTop}px` }">
		</div>
		<teleport to="body">
			<transition name="fade">
				<div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
					<div class="dialog">
						<div class="dialog-header">
							<h3>Select a Model ({{ availableModels.length }})</h3>
							<input type="text" v-model="searchQuery" placeholder="Search models..."
								class="search-bar" />
						</div>
						<div class="dialog-content">
							<div v-if="dialogLoading" class="dialog-spinner"></div>
							<ul v-else>
								<li v-for="model in filteredModels" :key="model.id" class="dialog-item">
									<div class="model-item-header">
										<h2>{{ model.name || model.id }}</h2>
										<button class="select-button" @click="addModel(model)">Select</button>
									</div>
									<div class="model-details">
										<p>{{ model.description }}</p>
										<br>
										<p><strong>Creation Date:</strong> {{ formatDate(model.created) }}</p>
										<p><strong>Context Length:</strong> {{ model.context_length }}</p>
										<p><strong>Moderated:</strong> {{ model.top_provider.is_moderated ? 'Yes' : 'No'
											}}
										</p>
										<ul>
											<li><strong>Input:</strong> ${{ formatPrice(model.pricing.prompt) }} per
												million
												tokens
											</li>
											<li><strong>Output:</strong> ${{ formatPrice(model.pricing.completion) }}
												per
												million
												tokens</li>
										</ul>
									</div>
								</li>
							</ul>
						</div>
						<button class="close-button" @click="closeDialog">Close</button>
					</div>
				</div>
			</transition>
		</teleport>
	</div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { getModels } from '../services/ModelService';

const props = defineProps({
	modelValue: String,
	activeModels: Object,
	loadingModels: Object
});

const emit = defineEmits(['update:modelValue', 'update:activeModels', 'removeModel']);

const toggleModel = (model) => {
	emit('update:activeModels', { model, value: !props.activeModels[model] });
};

const switchConversation = (model) => {
	emit('update:modelValue', model);
};

const removeModel = (model) => {
	emit('removeModel', model);
};

const showDialog = ref(false);
const dialogLoading = ref(false);
const availableModels = ref([]);
const searchQuery = ref('');
const foldouts = ref({});

const openDialog = async () => {
	showDialog.value = true;
	dialogLoading.value = true;
	try {
		const response = await fetch('http://localhost:3000/model/list');
		const data = await response.json();
		availableModels.value = data.data;
	} catch (error) {
		availableModels.value = [];
	} finally {
		dialogLoading.value = false;
	}
};

const closeDialog = () => {
	showDialog.value = false;
};

const addModel = (model) => {
	emit('update:activeModels', { model: model.id, value: true });
	closeDialog();
};

const toggleFoldout = (modelId) => {
	foldouts.value[modelId] = !foldouts.value[modelId];
};

const filteredModels = computed(() => {
	if (!searchQuery.value) {
		return availableModels.value;
	}
	const query = searchQuery.value.toLowerCase();
	return availableModels.value.filter(model =>
		(model.name && model.name.toLowerCase().includes(query)) ||
		(model.id && model.id.toLowerCase().includes(query)) ||
		(model.description && model.description.toLowerCase().includes(query))
	);
});

const activeLinePosition = ref(0);
const activeLineWidth = ref(0);
const activeLineTop = ref(0);
const isTransitionEnabled = ref(false);

const updateActiveLine = async (animate = true) => {
	await nextTick();
	const modelButton = document.querySelector(`[data-model="${props.modelValue}"]`);
	if (modelButton) {
		if (animate) {
			isTransitionEnabled.value = true;
		}

		activeLinePosition.value = modelButton.offsetLeft;
		activeLineWidth.value = modelButton.offsetWidth;
		activeLineTop.value = modelButton.offsetTop + modelButton.offsetHeight - 2;
	}
};

onMounted(async () => {
	await updateActiveLine(false);
	window.addEventListener('resize', onResize);
});

onUnmounted(() => {
	window.removeEventListener('resize', onResize);
});

const onResize = () => {
	updateActiveLine(false);
};

watch(
	() => props.modelValue,
	() => {
		updateActiveLine();
	}
);

const models = getModels();
const modelMap = Object.fromEntries(models.map(model => [model.id, model.name]));

const formatDate = (timestamp) => {
	const date = new Date(timestamp * 1000);
	return date.toLocaleDateString();
};

const formatPrice = (priceStr) => {
	const price = parseFloat(priceStr);
	if (isNaN(price)) return 'N/A';
	return (price * 1000000).toFixed(2);
};
</script>

<style scoped>
.model-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	padding: 10px;
	background-color: var(--button-background);
	justify-content: center;
	align-items: center;
	position: relative;
}

.model-button-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.model-button-row {
	display: flex;
	align-items: center;
}

.model-button {
	padding: 5px 10px;
	background-color: var(--button-color);
	border: none;
	border-radius: 4px;
	cursor: pointer;
	color: darkgray;
	margin-right: 5px;
	transition: background-color 0.3s, color 0.3s, text-decoration 0.3s;
}

.model-button.disabled {
	color: darkgray;
	text-decoration: line-through;
}

.model-button.active {
	background-color: var(--active-button-color);
	color: var(--active-text-color);
}

.model-toggle {
	cursor: pointer;
}

.toggle-container {
	width: 20px;
	height: 20px;
	position: relative;
}

.spinner {
	width: 16px;
	height: 16px;
	border: 2px solid var(--spinner-color, #ccc);
	border-top: 2px solid var(--spinner-active-color, #333);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.add-button {
	width: 24px;
	height: 24px;
	background-color: var(--button-color);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	font-size: 18px;
	line-height: 24px;
	text-align: center;
	color: var(--active-text-color);
	transition: background-color 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
}

.add-button:hover {
	background-color: var(--active-button-color);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.dialog-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.dialog {
	background-color: #2c2c2c;
	padding: 20px;
	border-radius: 8px;
	width: 1024px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	color: #ffffff;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.dialog-header {
	flex: none;
	margin-bottom: 10px;
}

.dialog-header h3 {
	margin: 0 0 10px 0;
	color: #ffffff;
}

.search-bar {
	width: 100%;
	padding: 8px;
	margin-bottom: 0;
	border: 1px solid #444;
	border-radius: 4px;
	background-color: #3a3a3a;
	color: #fff;
	box-sizing: border-box;
}

.dialog-content {
	flex: 1;
	overflow-y: auto;
}

.dialog-spinner {
	width: 32px;
	height: 32px;
	border: 4px solid var(--spinner-color, #ccc);
	border-top: 4px solid var(--spinner-active-color, #333);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 20px auto;
}

.dialog ul {
	list-style: none;
	padding: 0;
	margin: 0;
}

.dialog-item {
	padding: 10px;
	border-bottom: 1px solid #444;
}

.model-item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.select-button {
	padding: 5px 10px;
	background-color: var(--button-color);
	border: none;
	border-radius: 4px;
	cursor: pointer;
	color: var(--active-text-color);
}

.foldout-button {
	margin-top: 5px;
	padding: 3px 6px;
	background-color: transparent;
	border: none;
	color: #00aced;
	cursor: pointer;
	font-size: 14px;
}

.model-details {
	margin-top: 10px;
}

.close-button {
	margin-top: 10px;
	padding: 5px 10px;
	background-color: var(--button-color);
	border: none;
	border-radius: 4px;
	cursor: pointer;
	color: var(--active-text-color);
}

.active-line {
	position: absolute;
	height: 2px;
	background-color: white;
}

.active-line.transition-enabled {
	transition: left 0.3s ease, width 0.3s ease, top 0.3s ease;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.close-icon {
	background: none;
	border: none;
	cursor: pointer;
	padding: 0 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--active-text-color);
}

.close-icon:hover {
	color: red;
}
</style>