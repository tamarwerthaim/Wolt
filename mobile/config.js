import { Platform, NativeModules } from 'react-native';

const devApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Dynamically retrieve the IP address of the machine running the Metro bundler.
// This allows different developers to run the app without changing the IP address manually.
let packagerIp = '';

if (__DEV__) {
  const scriptURL = NativeModules.SourceCode?.scriptURL || '';
  const ipAddressMatch = scriptURL.match(/:\/\/([^\/:]+)/);
  if (ipAddressMatch && ipAddressMatch[1]) {
    packagerIp = ipAddressMatch[1];
  }
}

// If we resolved the packager IP dynamically, use it. Otherwise, fall back to the env var / localhost.
export const API_BASE_URL = (packagerIp && packagerIp !== 'localhost')
  ? `http://${packagerIp}:3000`
  : devApiUrl;

export const ROUNDED_FONT = Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-condensed';

