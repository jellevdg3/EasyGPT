import axios from 'axios';
import { reactive, nextTick } from 'vue';
import vsCodeService from './VSCodeService';
import notificationSound from '../assets/system-notification-199277.mp3';
import LocalDatabaseService from './LocalDatabaseService';

const DELIMITER = '\u001e';
const audio = new Audio(notificationSound);
audio.volume = 0.5;
audio.preload = 'auto';

export const sendSimpleMessage = async (prompt, model, onMessage, playSound) => {
	try {
		const response = await axios.post('http://localhost:3000/azure/prompt/text', { prompt, model });

		if (
			response.data &&
			response.data.choices &&
			Array.isArray(response.data.choices) &&
			response.data.choices.length > 0 &&
			response.data.choices[0].message &&
			response.data.choices[0].message.content
		) {
			const parsedText = response.data.choices[0].message.content;
			if (playSound) {
				audio.play();
			}
			onMessage(parsedText);
		} else {
			throw new Error('Unexpected response format');
		}
	} catch (error) {
		let errorText = 'Unknown error';
		if (error.response && error.response.data && error.response.data.message) {
			errorText = error.response.data.message;
		} else if (error.message) {
			errorText = error.message;
		}
		throw new Error(errorText);
	}
};

export const sendMessageStreaming = async (prompt, model, onMessage, playSound) => {
	const response = await fetch('http://localhost:3000/azure/promptStream/text', {
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
				if (playSound) {
					audio.play();
				}
				onMessage(message);
				vsCodeService.sendData({ type: 'saveState', state: {} });
				return;
			}

			onMessage(message);
			vsCodeService.sendData({ type: 'saveState', state: {} });
			LocalDatabaseService.saveData(`messages_${window.panelId}`, JSON.parse(localStorage.getItem(`messages_${window.panelId}`)) || {});
		}
	}
};