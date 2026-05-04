import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axios from "axios";

// Add /api at the end of base URL
function withApiPath(url: string) {
    const trimmed = url.replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

// Decide backend base URL
function resolveApiBaseUrl() {
    const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (envBaseUrl) {
        return withApiPath(envBaseUrl);
    }

    const hostUri = Constants.expoConfig?.hostUri || "";
    const host = hostUri.split(":")[0];

    if (host) {
        return withApiPath(`http://${host}:5000`);
    }

    if (Platform.OS === "android") {
        return withApiPath("http://10.0.2.2:5000");
    }

    return withApiPath("http://127.0.0.1:5000");
}
// Main API URL
const API_BASE_URL = resolveApiBaseUrl();

// Expo development host
const DEV_HOST = (Constants.expoConfig?.hostUri || "").split(":")[0];

// Backup API URLs
const FALLBACK_BASE_URLS = [
    process.env.EXPO_PUBLIC_API_FALLBACK_BASE_URL,
    DEV_HOST ? `http://${DEV_HOST}:5000` : undefined,
    Platform.OS === "android" ? "http://10.0.2.2:5000" : undefined,
    "http://127.0.0.1:5000",
]
    .filter(Boolean)
    .map((url) => withApiPath(url as string))
    .filter((url, index, self) => self.indexOf(url) === index);

// Axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true",
    },
});

console.log("API Base URL initialized as:", API_BASE_URL);

// Add token in every request
apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("authToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle API failure and retry with backup URL
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config as any;
        const status = error?.response?.status;
        const isNetworkFailure = !error?.response;
        const canRetry = !originalRequest?._baseUrlFailoverTried;

        if (!canRetry || (!isNetworkFailure && status !== 503)) {
            throw error;
        }

        const currentBaseUrl = originalRequest?.baseURL || apiClient.defaults.baseURL;
        const nextBaseUrl = FALLBACK_BASE_URLS.find((url) => url !== currentBaseUrl);

        if (!nextBaseUrl) {
            throw error;
        }

        originalRequest._baseUrlFailoverTried = true;
        originalRequest.baseURL = nextBaseUrl;
        apiClient.defaults.baseURL = nextBaseUrl;
        console.log("API failover switched base URL to:", nextBaseUrl);

        return apiClient.request(originalRequest);
    }
);
