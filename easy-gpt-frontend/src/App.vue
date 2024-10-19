<script setup>
import { ref, reactive, watch } from 'vue';
import { sendMessageStreaming } from './services/PromptService';
import MessageContainer from './components/MessageContainer.vue';
import InputContainer from './components/InputContainer.vue';

const models = reactive({
  'openai/gpt-4o': false,
  'openai/gpt-4o-mini': true,
  'openai/o1-mini': false,
  'anthropic/claude-3.5-sonnet': false,
});

const messages = reactive({});
Object.keys(models).forEach(model => {
  messages[model] = [];
});

const currentModel = ref('openai/gpt-4o-mini');

const switchConversation = (model) => {
  currentModel.value = model;
};

const userInput = ref('');

const initiateSendMessageStreaming = async () => {
  if (userInput.value.trim() === '') return;
  const prompt = userInput.value;
  const userMessage = { sender: 'user', text: prompt };
  const activeModels = Object.keys(models).filter(model => models[model]);

  activeModels.forEach(model => {
    messages[model].push({ ...userMessage });
    userInput.value = '';

    const botMessage = reactive({ sender: 'bot', text: '' });
    messages[model].push(botMessage);

    sendMessageStreaming(prompt, model, (message) => {
      if (message.startsWith('data: ')) {
        message = message.substring(6);
      }

      if (message === '[DONE]') {
        return;
      }

      botMessage.text += message;
    }).catch(error => {
      botMessage.text = 'Error: ' + (error.message || 'Unknown error');
    });
  });
};

watch(models, (newModels) => {
  if (!newModels[currentModel.value]) {
    const activeModels = Object.keys(newModels).filter(m => newModels[m]);
    currentModel.value = activeModels.length > 0 ? activeModels[0] : null;
  }
}, { deep: true });
</script>

<template>
  <div id="app">
    <div class="model-buttons">
      <div
        v-for="model in Object.keys(models)"
        :key="model"
        class="model-button-wrapper"
      >
        <button
          @click="switchConversation(model)"
          :class="{ disabled: !models[model], active: currentModel === model }"
          class="model-button"
        >
          {{ model }}
        </button>
        <input
          type="checkbox"
          v-model="models[model]"
          class="model-toggle"
        />
      </div>
    </div>
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

.model-buttons {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: var(--button-background);
  justify-content: center;
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

@media (min-width: 768px) {
  #app {
    max-width: 80vw;
  }
}
</style>