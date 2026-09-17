import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDefaultApiUrl = (): string => {
  // Check for explicit env override first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In Expo Go, the dev server host IP is exposed via expoConfig.hostUri
  // This is the most reliable way to get the LAN IP when running on a physical device
  try {
    const expoConfig = Constants.expoConfig;
    const hostUri: string | undefined =
      (expoConfig as any)?.hostUri ||
      (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        const apiUrl = `http://${ip}:5000/api`;
        console.log(`📱 Expo Go detected host IP: ${ip}. API URL: ${apiUrl}`);
        return apiUrl;
      }
    }
  } catch (e) {
    // ignore - fall through to defaults
  }

  // Android Emulator routes 10.0.2.2 to host machine localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // iOS Simulator / web fallback
  return 'http://localhost:5000/api';
};

export const API_URL = getDefaultApiUrl();
