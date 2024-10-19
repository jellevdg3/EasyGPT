<script setup>
import { ref, nextTick, watch } from 'vue';
import MessageItem from './MessageItem.vue';

const props = defineProps({
  messages: Array
});

const messageContainer = ref(null);

watch(() => props.messages, () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}, { deep: true });
</script>

<template>
  <div id="message-container" class="message-container" ref="messageContainer">
    <div class="message-item-wrapper" v-for="(msg, index) in messages" :key="index">
      <MessageItem :message="msg" />
    </div>
  </div>
</template>

<style scoped>
.message-container {
  flex: 1;
  padding: 1em;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.message-item-wrapper {
  display: flex;
  flex-direction: column;
}
</style>