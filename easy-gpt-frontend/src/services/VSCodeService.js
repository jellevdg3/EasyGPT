export const IsInVSCode = typeof acquireVsCodeApi !== 'undefined';

const vscode = IsInVSCode ? acquireVsCodeApi() : null;

export const sendData = (data) => {
	if (IsInVSCode && vscode) {
		vscode.postMessage(data);
	}
};

export const receiveData = (callback) => {
	if (IsInVSCode) {
		window.addEventListener('message', event => {
			callback(event.data);
		});
	}
};