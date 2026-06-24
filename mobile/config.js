import { Platform, NativeModules } from 'react-native';

// Dynamically retrieve the IP address of the machine running the Metro bundler.
// This allows different developers to run the app without changing the IP address manually.
let packagerIp = '192.168.1.125'; // Fallback default IP

if (__DEV__) {
  const scriptURL = NativeModules.SourceCode?.scriptURL || '';
  const ipAddressMatch = scriptURL.match(/:\/\/([^\/:]+)/);
  if (ipAddressMatch && ipAddressMatch[1]) {
    packagerIp = ipAddressMatch[1];
  }
}

export const API_BASE_URL = `http://${packagerIp}:3000`;

export const ROUNDED_FONT = Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-condensed';
