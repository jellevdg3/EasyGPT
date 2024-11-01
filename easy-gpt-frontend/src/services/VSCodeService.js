class VSCodeService {
	constructor() {
		if (VSCodeService.instance) {
			return VSCodeService.instance;
		}
		this.IsInVSCode = typeof acquireVsCodeApi !== 'undefined';

		if (this.IsInVSCode && window.vscode) {
			this.vscodeApi = window.vscode;
		} else {
			this.vscodeApi = this.IsInVSCode ? acquireVsCodeApi() : null;
		}
		VSCodeService.instance = this;

		this.listeners = [];
		this.pendingCallbacks = {};
		window.addEventListener('message', this._handleMessage.bind(this));
	}

	sendData(data) {
		if (this.IsInVSCode && this.vscodeApi) {
			this.vscodeApi.postMessage(data);
		}
	}

	onMessage(callback) {
		this.listeners.push(callback);
	}

	getData(type, stringData, callback) {
		const id = this._generateId();
		this.pendingCallbacks[id] = callback;
		this.sendData({ id, type, stringData });
	}

	_handleMessage(event) {
		const message = event.data;
		if (message.id && this.pendingCallbacks[message.id]) {
			this.pendingCallbacks[message.id](message);
			delete this.pendingCallbacks[message.id];
		} else {
			this.listeners.forEach(callback => callback(message));
		}
	}

	_generateId() {
		return '_' + Math.random().toString(36).substr(2, 9);
	}

	logData(data) {
		console.log(data);
		if (this.IsInVSCode && this.vscodeApi) {
			this.vscodeApi.postMessage({ type: 'log', data });
		}
	}
}

const instance = new VSCodeService();
export default instance;