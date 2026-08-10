import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const ENDPOINT = `http://${HOST}:8099/report`;

export async function report(kind: string, payload: object) {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, platform: Platform.OS, payload })
    });
  } catch (e) {}
}
