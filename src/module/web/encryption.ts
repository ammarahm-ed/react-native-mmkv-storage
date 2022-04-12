import localforage from 'localforage';

export type EncryptedData = { iv: Uint8Array; cipher: BufferSource };

class WebKeyStore {
  database: LocalForage;
  constructor() {
    const drivers = [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE];
    this.database = localforage.createInstance({
      name: 'mmkvkeystore',
      driver: drivers
    });
  }

  read<T>(key: string): Promise<T | null> {
    return this.database.getItem(key);
  }

  write<T>(key: string, data: T) {
    return this.database.setItem(key, data);
  }

  async removeSecureKeyAsync(key: string) {
    await this.database.removeItem(key);
    return true;
  }

  clear() {
    return this.database.clear();
  }

  async secureKeyExistsAsync(name: string) {
    return !!(await this.database.getItem(`${name}@_k`));
  }

  async setSecureKeyAsync(name: string, password: string) {
    if (!password) throw new Error('Invalid data provided to setSecureKeyAsync.');

    if (this.isIndexedDBSupported() && window?.crypto?.subtle) {
      const pbkdfKey = await derivePBKDF2Key(password);
      await this.write(name, pbkdfKey);
      const cipheredKey = await encrypt(pbkdfKey, password!);
      await this.write(`${name}@_k`, cipheredKey);
    } else {
      await this.write(`${name}@_k`, password);
    }
    return true;
  }

  async getKey(name: string): Promise<string | undefined> {
    if (this.isIndexedDBSupported() && window?.crypto?.subtle) {
      const pbkdfKey = await this.read<CryptoKey>(name);
      const cipheredKey = await this.read<EncryptedData | string>(`${name}@_k`);
      if (typeof cipheredKey === 'string') return cipheredKey;
      if (!pbkdfKey || !cipheredKey) return;
      return await decrypt(pbkdfKey, cipheredKey);
    } else {
      const key = await this.read<string>(`${name}@_k`);
      if (!key) return;
      return key;
    }
  }

  async getSecureKeyAsync(name: string): Promise<CryptoKey | undefined> {
    if (this.isIndexedDBSupported() && window?.crypto?.subtle) {
      const pbkdfKey = await this.read<CryptoKey>(name);

      if (!pbkdfKey) return;
      return pbkdfKey;
    }
  }

  isIndexedDBSupported(): boolean {
    return this.database.driver() === 'asyncStorage';
  }
}

const enc = new TextEncoder();
const dec = new TextDecoder();

async function derivePBKDF2Key(password: string): Promise<CryptoKey> {
  const key = await window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey'
  ]);

  let salt = window.crypto.getRandomValues(new Uint8Array(16));
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(cryptoKey: CryptoKey, data: string): Promise<EncryptedData> {
  let iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cipher = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    cryptoKey,
    enc.encode(data)
  );

  return {
    iv,
    cipher
  };
}

async function decrypt(cryptoKey: CryptoKey, data: EncryptedData): Promise<string> {
  const { iv, cipher } = data;

  const plainText = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    cryptoKey,
    cipher
  );
  return dec.decode(plainText);
}

const { secureKeyExistsAsync, getSecureKeyAsync, removeSecureKeyAsync, setSecureKeyAsync } =
  new WebKeyStore();

export default {
  secureKeyExistsAsync,
  getSecureKeyAsync,
  removeSecureKeyAsync,
  setSecureKeyAsync,
  encrypt,
  decrypt
};
