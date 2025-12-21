export interface State {
	apiKey?: string;
}

export type SharedIpcMethods = {
	getState: () => Promise<State>;
	setPartialState: (state: Partial<State>) => Promise<void>;
	store: {
		get: <T>(key: string) => Promise<T>;
		set: (key: string, value: any) => Promise<void>;
	};
};

export type ExposedElectronAPI = SharedIpcMethods & {
	onStateChange: (callback: (state: State) => void) => () => void;
	onIpcEvent: (
		channel: string,
		callback: (...args: any[]) => void
	) => () => void;
};
