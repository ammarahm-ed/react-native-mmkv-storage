import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
} from 'react-native';
import MMKV from 'react-native-mmkv-storage';

const MMKVStorage = new MMKV.Loader().withEncryption().initialize();

interface StoredMap {
  name: string;
  date: number;
}

const App = () => {
  const [stringValue, setStringValue] = useState('');
  const [arrayValue, setArrayValue] = useState<Array<undefined>>([]);
  const [mapValue, setMapValue] = useState<StoredMap>({
    name: '',
    date: Date.now(),
  });

  useEffect(() => {
    const map = MMKVStorage.getMap<StoredMap>('map');
    map && setMapValue(map);
    MMKVStorage.removeItem('map');
    MMKVStorage.setMap('map', {
      name: 'AAA',
      date: Date.now(),
    });
    const randomString = MMKVStorage.getString('random-string');
    randomString && setStringValue(randomString);
    MMKVStorage.setString(
      'random-string',
      Math.random().toString(36).substring(7),
    );
    const array = MMKVStorage.getArray<undefined>('array');
    array && setArrayValue(array);
    MMKVStorage.setArray('array', new Array(16).fill(undefined));
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Text>Previous value: {stringValue}</Text>
          <Text>
            Map value: {mapValue?.name} {mapValue?.date}
          </Text>
          <Text>Array Length: {arrayValue?.length}</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 32,
  },
});

export default App;
