import axios from 'axios';
import { ref, nextTick, reactive } from 'vue';
import notificationSound from '../assets/system-notification-199277.mp3';

const DELIMITER = '\u001e';

export const sendMessage = async (prompt) => {
	const response = await axios.post('http://localhost:3000/prompt/text', { prompt });
	const botText = response.data.choices[0].message.content;
	return botText;
};

export const sendSimpleMessage = async () => {
	if (userInput.value.trim() === '') return;
	const prompt = userInput.value;
	const userMessage = { sender: 'user', text: prompt };
	messages.value.push(userMessage);
	userInput.value = '';

	const botMessage = reactive({ sender: 'bot', text: '' });
	messages.value.push(botMessage);
	nextTick(() => {
		messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
	});

	try {
		const botText = await sendMessage(prompt);
		botMessage.text = botText;
		const audio = new Audio(notificationSound);
		audio.volume = 0.5;
		audio.play();
		nextTick(() => {
			messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
		});
	} catch (error) {
		botMessage.text = 'Error: ' + (error.message || 'Unknown error');
		const audio = new Audio(notificationSound);
		audio.volume = 0.5;
		audio.play();
		nextTick(() => {
			messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
		});
	}
};

export const sendMessageStreaming = async (prompt, model, onMessage) => {
	const response = await fetch('http://localhost:3000/promptStream/text', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ prompt, model }),
	});

	if (!response.ok) {
		let errorText = `HTTP Error ${response.status}: ${response.statusText} `;
		try {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				const errorData = await response.json();
				errorText = errorData.message || errorText;
			} else {
				const text = await response.text();
				errorText = text || errorText;
			}
		} catch (e) { }
		throw new Error(errorText);
	}

	if (!response.body) {
		throw new Error('ReadableStream not supported in this browser.');
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		let parts = buffer.split(DELIMITER);
		buffer = parts.pop();
		for (const part of parts) {
			let message = part;
			if (message.startsWith('data: ')) {
				message = message.substring(6);
			}

			if (message === '[DONE]') {
				const audio = new Audio(notificationSound);
				audio.volume = 0.5;
				audio.play();
				return;
			}

			onMessage(message);
		}
	}
};