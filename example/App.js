import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';
const storage = new MMKVLoader().withInstanceID('settings').initialize();

storage.setString('key_1', 'value_1');
storage.setInt('key_2', 2);
storage.removeItem('key_2'); // let's say we no longer need this key

export default function App() {
  const [reactive_key_1] = useMMKVStorage('key_1', storage);
  const [reactive_key_2] = useMMKVStorage('key_2', storage);
  const [reactive_key_3] = useMMKVStorage('key_3', storage); // this key doesn't exist

  const key_1 = storage.getString('key_1');
  const key_2 = storage.getInt('key_2');
  const key_3 = storage.getString('key_3'); // this key doesn't exist

  // issue #1 - why reactive_key_1 is becoming undefined?
  console.log(`key_1: ${key_1} - reactive_key_1: ${reactive_key_1}`); // key_1: value_1 - reactive_key_1: undefined

  // issue #2 - why we have two different default values for same key?
  console.log(`key_2: ${key_2} - reactive_key_2: ${reactive_key_2}`); // key_2: null - reactive_key_2: undefined

  // issue #2 - why we have two different default values for same key?
  console.log(`key_3: ${key_3} - reactive_key_3: ${reactive_key_3}`); // key_3: null - reactive_key_3: undefined

  storage.indexer.strings.getKeys().then(r => console.log('keys: ', r));

  return null;
}
