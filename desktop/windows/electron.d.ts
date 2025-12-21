export interface ApiRequestLog {
	id: string;
	timestamp: number;
	method: string;
	path: string;
	status: 'success' | 'error';
	statusCode?: number;
	duration: number;
	error?: string;
}

export interface ScreenCaptureConfig {
	enabled: boolean;
	intervalMinutes: number;
}

export interface DeviceStatus {
	deviceId: string;
	registered: boolean;
	approved: boolean;
	error?: string;
}

interface ElectronAPI {
	platform: string;
	getRequestLogs: () => Promise<ApiRequestLog[]>;
	clearRequestLogs: () => Promise<void>;
	getScreenCaptureConfig: () => Promise<ScreenCaptureConfig>;
	setScreenCaptureConfig: (config: Partial<ScreenCaptureConfig>) => Promise<void>;
	getServerUrl: () => Promise<string>;
	setServerUrl: (url: string) => Promise<void>;
	getDeviceId: () => Promise<string>;
	registerDevice: () => Promise<DeviceStatus>;
}

declare global {
	interface Window {
		electron: ElectronAPI;
	}
}
