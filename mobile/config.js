import { Platform } from 'react-native';

// Configuration file for the mobile client
// Using the local IP address of the machine to allow the Expo Go app on physical devices to connect.
export const API_BASE_URL = 'http://192.168.1.125:3000';

export const ROUNDED_FONT = Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-condensed';
