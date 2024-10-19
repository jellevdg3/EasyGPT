<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  modelValue: String,
  activeModels: Object,
  loadingModels: Object
});

const emit = defineEmits(['update:modelValue', 'update:activeModels']);

const toggleModel = (model) => {
  emit('update:activeModels', { model, value: !props.activeModels[model] });
};

const switchConversation = (model) => {
  emit('update:modelValue', model);
};

const showDialog = ref(false);
const dialogLoading = ref(false);
const availableModels = ref([]);

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
</script>

<template>
  <div class="model-buttons">
    <div
      v-for="model in Object.keys(activeModels)"
      :key="model"
      class="model-button-wrapper"
    >
      <button
        @click="switchConversation(model)"
        :class="{ disabled: !activeModels[model], active: modelValue === model }"
        class="model-button"
      >
        {{ model }}
      </button>
      <div class="toggle-container">
        <template v-if="loadingModels[model]">
          <div class="spinner"></div>
        </template>
        <template v-else>
          <input
            type="checkbox"
            :checked="activeModels[model]"
            @change="toggleModel(model)"
            class="model-toggle"
          />
        </template>
      </div>
    </div>
    <button class="add-button" @click="openDialog">
      +
    </button>
    <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <h3>Select a Model</h3>
        <div v-if="dialogLoading" class="dialog-spinner"></div>
        <ul v-else>
          <li
            v-for="model in availableModels"
            :key="model.id"
            @click="addModel(model)"
            class="dialog-item"
          >
            <h4>{{ model.name }}</h4>
            <p>{{ model.description }}</p>
            <p><strong>Context Length:</strong> {{ model.context_length }}</p>
            <p><strong>Pricing:</strong></p>
            <ul>
              <li>Prompt: {{ model.pricing.prompt }}</li>
              <li>Completion: {{ model.pricing.completion }}</li>
              <li>Image: {{ model.pricing.image }}</li>
              <li>Request: {{ model.pricing.request }}</li>
            </ul>
            <button class="select-button">Select</button>
          </li>
        </ul>
        <button class="close-button" @click="closeDialog">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-buttons {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: var(--button-background);
  justify-content: center;
  align-items: center;
}

.model-button-wrapper {
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
}

.add-button:hover {
  background-color: var(--active-button-color);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog h3 {
  margin-top: 0;
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
}

.dialog-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.dialog-item:hover {
  background-color: #f0f0f0;
}

.dialog-item h4 {
  margin: 0 0 5px 0;
}

.dialog-item p {
  margin: 5px 0;
  font-size: 14px;
}

.dialog-item ul {
  list-style: disc;
  margin: 5px 0 0 20px;
  padding: 0;
}

.select-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: var(--button-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--active-text-color);
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
