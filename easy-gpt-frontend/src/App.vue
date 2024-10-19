<script setup>
import { ref, reactive } from 'vue';
import { sendMessageStreaming } from './services/PromptService';
import MessageContainer from './components/MessageContainer.vue';
import InputContainer from './components/InputContainer.vue';

const messages = ref([]);
const userInput = ref('');

const models = reactive({
  'gpt-4o': false,
  'gpt-4o-mini': false,
  'o1-mini': false,
  'claude-3.5': false,
});

const toggleModel = (model) => {
  models[model] = !models[model];
};

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
</script>

<template>
  <div id="app">
    <div class="model-buttons">
      <button
        v-for="model in Object.keys(models)"
        :key="model"
        :class="{ active: models[model] }"
        @click="toggleModel(model)"
      >
        <input type="checkbox" v-model="models[model]" />
        {{ model }}
      </button>
    </div>
    <MessageContainer :messages="messages" />
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

.model-buttons button {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background-color: var(--button-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.model-buttons button.active {
  background-color: var(--button-active-color);
}

.model-buttons input {
  margin-right: 5px;
}

@media (min-width: 768px) {
  #app {
    max-width: 80vw;
  }
}
</style>