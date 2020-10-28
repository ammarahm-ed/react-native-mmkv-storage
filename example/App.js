import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
} from 'react-native';

import MMKV from 'react-native-mmkv-storage';

const MMKVStorage = new MMKV.Loader().initialize();

const App = () => {
  const [stringValue, setStringValue] = useState('');
  const [arrayValue, setArrayValue] = useState([]);
  const [mapValue, setMapValue] = useState({});

  useEffect(() => {
    (async () => {
      let map =  await MMKVStorage.getMapAsync('map');
      setMapValue(map);
      await MMKVStorage.removeItem('map');
      await  MMKVStorage.setMapAsync('map', {
        name: 'AAA',
        date: Date.now(),
      });
     let randomString = await MMKVStorage.getStringAsync('random-string');
     setStringValue(randomString);
     await MMKVStorage.setStringAsync(
      'random-string',
      Math.random().toString(36).substring(7),
    );
    let array = await MMKVStorage.getArrayAsync('array');
    setArrayValue(array);
    await MMKVStorage.setArrayAsync('array', new Array(16).fill());
    await  MMKVStorage.indexer.hasKey('map').then(console.log);
    })
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
            Map value: {mapValue.name} {mapValue.date}
          </Text>
          <Text>Array Length: {arrayValue.length}</Text>
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
