import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Automatically detect host IP from Expo Metro bundler when running on physical phone via Expo Go
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      console.log(`📱 Expo Go detected host IP: ${ip}. Using API URL: http://${ip}:5000/api`);
      return `http://${ip}:5000/api`;
    }
  }

  // Android Studio Emulator default host loopback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_URL = getDefaultApiUrl();
