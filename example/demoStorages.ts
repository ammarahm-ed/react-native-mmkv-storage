import { MMKVLoader } from 'react-native-mmkv-storage';

export const storage = new MMKVLoader().withEncryption().initialize();
export const storage2 = new MMKVLoader().withInstanceID('storage2').initialize();
