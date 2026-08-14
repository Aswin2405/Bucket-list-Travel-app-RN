import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/auth';
import { markSlowRequestStarted, markSlowRequestEnded } from '../utils/coldStartNotice';

// If a request hasn't resolved by this point, assume it's a Render cold start
// (rather than just normal network latency) and let the UI show a notice.
const COLD_START_THRESHOLD_MS = 3000;

const client = axios.create({
  baseURL: API_BASE_URL,
  // Generous timeout so the first request after the backend has been idle can
  // still succeed: Render's free tier spins the server down when inactive and a
  // cold start can take 30-60s to respond.
  timeout: 60000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const coldStart = { firedAsSlow: false };
  coldStart.timer = setTimeout(() => {
    coldStart.firedAsSlow = true;
    markSlowRequestStarted();
  }, COLD_START_THRESHOLD_MS);
  config.__coldStart = coldStart;

  return config;
});

function settleColdStart(config) {
  const coldStart = config?.__coldStart;
  if (!coldStart) return;
  clearTimeout(coldStart.timer);
  if (coldStart.firedAsSlow) markSlowRequestEnded();
}

client.interceptors.response.use(
  (response) => {
    settleColdStart(response.config);
    return response;
  },
  (error) => {
    settleColdStart(error.config);
    return Promise.reject(error);
  }
);

export default client;
