import { app, BrowserWindow, ipcMain } from 'electron';
import { createMainWindow } from './windows/settings';
import { initTray, destroyTray } from './tray';
import { startScreenCapture, stopScreenCapture, restartScreenCapture } from './screen-capture';
import { store, getRequestLogs, clearRequestLogs, getDeviceId } from './store';

export type DeviceStatus = {
	deviceId: string;
	registered: boolean;
	approved: boolean;
	error?: string;
};

async function registerDevice(): Promise<DeviceStatus> {
	const serverUrl = store.get('serverUrl');
	const deviceId = getDeviceId();

	let response: Response;
	try {
		response = await fetch(`${serverUrl}/api/devices/register`, {
			method: 'POST',
			headers: {
				'x-device-id': deviceId,
				'x-device-name': `Context Desktop (${process.platform})`,
			},
		});
	} catch (error) {
		return {
			deviceId,
			registered: false,
			approved: false,
			error: error instanceof Error ? error.message : 'Network error',
		};
	}

	if (!response.ok) {
		return {
			deviceId,
			registered: false,
			approved: false,
			error: `Server returned ${response.status}`,
		};
	}

	const data = await response.json();
	return {
		deviceId,
		registered: data.registered,
		approved: data.approved,
	};
}

function registerIpcHandlers(): void {
	ipcMain.handle('get-request-logs', () => {
		return getRequestLogs();
	});

	ipcMain.handle('clear-request-logs', () => {
		clearRequestLogs();
	});

	ipcMain.handle('get-screen-capture-config', () => {
		return store.get('screenCapture');
	});

	ipcMain.handle('set-screen-capture-config', (_event, config: { enabled?: boolean; intervalMinutes?: number }) => {
		const current = store.get('screenCapture');
		store.set('screenCapture', { ...current, ...config });
		restartScreenCapture();
	});

	ipcMain.handle('get-server-url', () => {
		return store.get('serverUrl');
	});

	ipcMain.handle('set-server-url', (_event, url: string) => {
		store.set('serverUrl', url);
	});

	ipcMain.handle('get-device-id', () => {
		return getDeviceId();
	});

	ipcMain.handle('register-device', async () => {
		return registerDevice();
	});
}

app.on('ready', () => {
	registerIpcHandlers();
	createMainWindow();
	initTray();
	startScreenCapture();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});

app.on('before-quit', () => {
	stopScreenCapture();
	destroyTray();
});
