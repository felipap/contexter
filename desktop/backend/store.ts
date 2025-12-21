import Store from "electron-store";

export type ApiRequestLog = {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  status: "success" | "error";
  statusCode?: number;
  duration: number;
  error?: string;
};

export type AuthState = {
  sessionToken: string | null;
  userId: string | null;
  userEmail: string | null;
};

type StoreSchema = {
  serverUrl: string;
  screenCapture: {
    enabled: boolean;
    intervalMinutes: number;
  };
  requestLogs: ApiRequestLog[];
  auth: AuthState;
};

const MAX_LOGS = 100;

export const store = new Store<StoreSchema>({
  defaults: {
    serverUrl: "http://localhost:3000",
    screenCapture: {
      enabled: true,
      intervalMinutes: 5,
    },
    requestLogs: [],
    auth: {
      sessionToken: null,
      userId: null,
      userEmail: null,
    },
  },
});

export function getAuthState(): AuthState {
  return store.get("auth");
}

export function setAuthState(auth: AuthState): void {
  store.set("auth", auth);
}

export function clearAuth(): void {
  store.set("auth", {
    sessionToken: null,
    userId: null,
    userEmail: null,
  });
}

export function addRequestLog(log: Omit<ApiRequestLog, "id">): void {
  const logs = store.get("requestLogs");
  const newLog: ApiRequestLog = {
    ...log,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
  store.set("requestLogs", updatedLogs);
}

export function getRequestLogs(): ApiRequestLog[] {
  return store.get("requestLogs");
}

export function clearRequestLogs(): void {
  store.set("requestLogs", []);
}

