import { MMKVLoader } from 'react-native-mmkv-storage';

export const plain = new MMKVLoader().withInstanceID('e2e_plain').initialize();

export const encrypted = new MMKVLoader().withInstanceID('e2e_encrypted').withEncryption().initialize();

export const unindexed = new MMKVLoader().withInstanceID('e2e_unindexed').disableIndexing().initialize();

export const persistedDefaults = new MMKVLoader()
  .withInstanceID('e2e_persisted')
  .withPersistedDefaultValues()
  .initialize();

export const E2E_INSTANCE_IDS = [
  'e2e_plain',
  'e2e_encrypted',
  'e2e_unindexed',
  'e2e_persisted'
];
