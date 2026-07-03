import { Platform } from 'react-native';

// Point this at your machine's LAN IP when testing on a physical device or
// the Android emulator (10.0.2.2 maps to the host machine on Android).
// iOS simulator and web can use localhost directly.
const LAN_IP = '192.168.1.100'; // <-- replace with your computer's local IP
const PORT = 5001;

function resolveBaseUrl() {
  if (Platform.OS === 'android') return `http://10.0.2.2:${PORT}/api`;
  if (Platform.OS === 'web') return `http://localhost:${PORT}/api`;
  return `http://${LAN_IP}:${PORT}/api`;
}

export const API_BASE_URL = resolveBaseUrl();
