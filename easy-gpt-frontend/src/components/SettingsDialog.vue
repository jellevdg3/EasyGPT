<template>
	<v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px" eager
		transition="dialog-bottom-transition" style="z-index: 10000;">
		<v-card dark color="grey darken-3">
			<v-card-title class="text-white">
				Settings
				<v-spacer></v-spacer>
			</v-card-title>
			<v-card-text class="text-white">
				<v-switch label="Append code automatically" :model-value="localAppendCode"
					@update:model-value="updateAppendCodeLocal"></v-switch>
				<v-switch label="Play sound upon completion" :model-value="localPlaySound"
					@update:model-value="updatePlaySoundLocal"></v-switch>
				<v-switch label="Clear chat on every new request" :model-value="localClearChat"
					@update:model-value="updateClearChatLocal"></v-switch>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text color="white" @click="close">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import { VDialog, VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VSwitch } from 'vuetify/components';

const props = defineProps({
	modelValue: {
		type: Boolean,
		required: true
	},
	appendCode: {
		type: Boolean,
		default: false
	},
	playSound: {
		type: Boolean,
		default: false
	},
	clearChat: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['update:modelValue', 'update:appendCode', 'update:playSound', 'update:clearChat']);

const localAppendCode = ref(props.appendCode);
const localPlaySound = ref(props.playSound);
const localClearChat = ref(props.clearChat);

watch(() => props.appendCode, (newVal) => {
	localAppendCode.value = newVal;
});

watch(() => props.playSound, (newVal) => {
	localPlaySound.value = newVal;
});

watch(() => props.clearChat, (newVal) => {
	localClearChat.value = newVal;
});

const updateAppendCodeLocal = (val) => {
	localAppendCode.value = val;
	emit('update:appendCode', val);
};

const updatePlaySoundLocal = (val) => {
	localPlaySound.value = val;
	emit('update:playSound', val);
};

const updateClearChatLocal = (val) => {
	localClearChat.value = val;
	emit('update:clearChat', val);
};

const close = () => {
	emit('update:modelValue', false);
};
</script>

<style scoped></style>