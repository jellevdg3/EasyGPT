// src/services/VSCodeService.js
class VSCodeService {
	constructor() {
		if (VSCodeService.instance) {
			return VSCodeService.instance;
		}
		this.IsInVSCode = typeof acquireVsCodeApi !== 'undefined';

		if (this.IsInVSCode && window.vscode) {
			this.vscodeApi = window.vscode;
		}
		else {
			this.vscodeApi = this.IsInVSCode ? acquireVsCodeApi() : null;
		}
		VSCodeService.instance = this;
	}

	sendData(data) {
		if (this.IsInVSCode && this.vscodeApi) {
			this.vscodeApi.postMessage(data);
		}
	}

	receiveData(callback) {
		if (this.IsInVSCode) {
			window.addEventListener('message', (event) => {
				callback(event.data);
			});
		}
	}

	initializeState(callback) {
		if (this.IsInVSCode) {
			window.addEventListener('message', (event) => {
				if (event.data.type === 'initialize') {
					callback(event.data);
				}
			});
		}
	}
}

const instance = new VSCodeService();
export default instance;
