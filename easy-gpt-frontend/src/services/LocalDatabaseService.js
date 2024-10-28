class LocalDatabaseService {
	loadData(key) {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : null;
	}

	saveData(key, data) {
		localStorage.setItem(key, JSON.stringify(data));
	}
}

const instance = new LocalDatabaseService();
export default instance;