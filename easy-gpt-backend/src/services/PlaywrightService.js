const playwright = require('playwright-extra');
const fs = require('fs');
const path = require('path');

class PlaywrightService {
	constructor({ url, screenshotDir = 'screenshots', screenshotInterval = 5000 }) {
		this.url = url;
		this.screenshotDir = screenshotDir;
		this.screenshotInterval = screenshotInterval;
		this.browser = null;
		this.context = null;
		this.page = null;
		this.screenshotTimer = null;
	}

	async initBrowser() {
		this.browser = await playwright.chromium.launch({
			headless: false,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-infobars',
				'--window-position=0,0',
				'--ignore-certificate-errors',
				'--ignore-certificate-errors-spki-list',
				'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
				'AppleWebKit/537.36 (KHTML, like Gecko) ' +
				'Chrome/114.0.0.0 Safari/537.36',
				'--disable-blink-features=AutomationControlled',
				'--enable-features=NetworkService,NetworkServiceInProcess',
				'--disable-dev-shm-usage',
			],
			viewport: null,
		});

		this.context = await this.browser.newContext({
			viewport: { width: 1366, height: 768 },
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
				'AppleWebKit/537.36 (KHTML, like Gecko) ' +
				'Chrome/114.0.0.0 Safari/537.36',
			javaScriptEnabled: true,
			bypassCSP: true,
			locale: 'en-US',
			permissions: ['clipboard-read', 'clipboard-write'],
		});

		this.page = await this.context.newPage();

		await this.page.addInitScript(() => {
			Object.defineProperty(navigator, 'webdriver', {
				get: () => undefined,
			});
			window.chrome = {
				runtime: {},
				loadedExtensions: [],
				c: {},
				commands: {},
				extension: {},
				language: 'en-US',
				loadTimes: () => { },
				browser: 'Chrome',
				app: {
					installState: {},
				},
			};
			const originalQuery = window.navigator.permissions.query;
			window.navigator.permissions.query = (parameters) =>
				parameters.name === 'notifications'
					? Promise.resolve({ state: Notification.permission })
					: originalQuery(parameters);
			Object.defineProperty(navigator, 'languages', {
				get: () => ['en-US', 'en'],
			});
			Object.defineProperty(navigator, 'platform', {
				get: () => 'Win32',
			});
			window.navigator.chrome = window.chrome;
			window.navigator.chrome.webstore = {};
			window.navigator.chrome.runtime = {};
			window.navigator.clipboard = {
				writeText: () => { },
				readText: () => { },
			};
			window.navigator.getBattery = () =>
				Promise.resolve({
					charging: true,
					level: 1,
					onchargingchange: null,
					onchargingtimechange: null,
					onlevelchange: null,
					ondischargingtimechange: null,
				});
			delete window.csw;
			delete window.__cf_bm;
			delete window.__CF_USER_AGENT;
			const getParameter = WebGLRenderingContext.prototype.getParameter;
			WebGLRenderingContext.prototype.getParameter = function (parameter) {
				if (parameter === 37445) {
					return 'Intel Inc.';
				}
				if (parameter === 37446) {
					return 'Intel Iris OpenGL Engine';
				}
				return getParameter.apply(this, arguments);
			};
		});

		this.page.on('dialog', async (dialog) => {
			await dialog.dismiss();
		});

		await this.page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US,en;q=0.9',
			'Referer': this.url,
		});
	}

	async navigate() {
		if (!this.page) {
			throw new Error('Browser is not initialized.');
		}
		await this.page.goto(this.url, { waitUntil: 'networkidle' });
	}

	startScreenshotInterval() {
		if (!this.page) {
			throw new Error('Browser is not initialized.');
		}
		if (!fs.existsSync(this.screenshotDir)) {
			fs.mkdirSync(this.screenshotDir, { recursive: true });
		}
		this.screenshotTimer = setInterval(async () => {
			try {
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				const filePath = path.join(this.screenshotDir, `screenshot-${timestamp}.png`);
				await this.page.screenshot({ path: filePath, fullPage: true });
				console.log(`Screenshot saved: ${filePath}`);
			} catch (error) {
				console.error('Error taking screenshot:', error);
			}
		}, this.screenshotInterval);
	}

	stopScreenshotInterval() {
		if (this.screenshotTimer) {
			clearInterval(this.screenshotTimer);
			this.screenshotTimer = null;
		}
	}

	async closeBrowser() {
		this.stopScreenshotInterval();
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
			this.context = null;
			this.page = null;
		}
	}

	async promptBrowserText(res, prompt, model) {
		if (!this.page) {
			throw new Error('Browser is not initialized.');
		}
		// Implement the logic to interact with the browser for prompting text
		// This is a placeholder and should be replaced with actual implementation
		try {
			// Example: Navigate to a specific page, enter prompt, and retrieve response
			await this.page.evaluate((promptText) => {
				// Example interaction with the page
				document.querySelector('textarea').value = promptText;
				document.querySelector('button.submit').click();
			}, prompt);

			// Wait for response and send it back
			this.page.on('response', async (response) => {
				if (response.url().includes('desired-endpoint') && response.status() === 200) {
					const data = await response.json();
					res.json(data);
				}
			});
		} catch (error) {
			throw error;
		}
	}

	async start() {
		try {
			await this.initBrowser();
			await this.navigate();
			//this.startScreenshotInterval();
			console.log('Playwright service started. Press Ctrl+C to exit.');
			process.on('SIGINT', async () => {
				console.log('\nShutting down Playwright service...');
				await this.closeBrowser();
				process.exit(0);
			});
		} catch (error) {
			console.error('Error starting Playwright service:', error);
			await this.closeBrowser();
		}
	}
}

module.exports = PlaywrightService;
