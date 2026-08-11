import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const ENDPOINT = `http://${HOST}:8099/report`;
const CHUNK_SIZE = 3000;

export async function report(kind: string, payload: object) {
  const body = JSON.stringify({ kind, platform: Platform.OS, payload });

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    return;
  } catch (e) {}

  const total = Math.ceil(body.length / CHUNK_SIZE);
  for (let i = 0; i < total; i++) {
    console.log(`REPORT_CHUNK ${kind} ${i} ${total} ${body.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)}`);
  }
}
